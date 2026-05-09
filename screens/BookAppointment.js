
import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL,apiBaseUrl } from '../components/variable'
import { useNavigation } from '@react-navigation/native'

const BookAppointment = () => {

  const navigation = useNavigation()
  const { token, basketItems } = useContext(AuthContext)


  const [fromDate, setFromDate] = useState(new Date())
  const [date, setDate] = useState(new Date())

  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)

  const [pickerMode, setPickerMode] = useState(null)
  const [isPickerVisible, setPickerVisible] = useState(false)

  const [timelineData, setTimelineData] = useState(null)
  const [timelineByDate, setTimelineByDate] = useState({})
  const [timelineLoading, setTimelineLoading] = useState(false)

  const [selectedEmployeesByDate, setSelectedEmployeesByDate] = useState({})

  const [showModal, setShowModal] = useState(false)
  const [modalDate, setModalDate] = useState(null)
  const [modalData, setModalData] = useState(null)

  const [isAutoAssigned, setIsAutoAssigned] = useState(false)

  const isSingleDate =
    fromDate.toDateString() === date.toDateString()

  // ---------------- HELPERS ----------------

  const formatTime = (time) => {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hourNum = parseInt(h, 10)
    const hour = hourNum % 12 || 12
    const ampm = hourNum >= 12 ? 'PM' : 'AM'
    return `${hour}:${m} ${ampm}`
  }

  const formatToAPI = (dateObj) => {
    const h = String(dateObj.getHours()).padStart(2, '0')
    const m = String(dateObj.getMinutes()).padStart(2, '0')
    return `${h}:${m}:00`
  }

  const isSlotValid = (slotStart, slotEnd, selectedStart, selectedEnd) => {
    return slotStart <= selectedStart && slotEnd >= selectedEnd
  }

  const getDatesInRange = (start, end) => {
    const dates = []
    let current = new Date(start)

    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  const getDatesInRangeStrings = () => {
    return getDatesInRange(fromDate, date).map(
      (d) => d.toISOString().split('T')[0]
    )
  }

  const allDatesSelected = () => {
    const dates = getDatesInRangeStrings()
    return dates.every((d) => selectedEmployeesByDate[d])
  }

  // ✅ FILTER EMPLOYEES (IMPORTANT FIX)
  const getEmployees = () => {
    if (!timelineData?.employees) return []
    if (!startTime || !endTime) return []

    return timelineData.employees.filter((emp) =>
      emp.free_slots?.some((slot) =>
        isSlotValid(slot.start_time, slot.end_time, startTime, endTime)
      )
    )
  }

  // ---------------- API ----------------

  const fetchTimeline = async (start, end) => {
    try {
      setTimelineLoading(true)

      const payload = {
        fromDate: fromDate.toISOString().split('T')[0],
        date: date.toISOString().split('T')[0],
        startTime: start,
        endTime: end,
      }

      const res = await fetch(
        `${apiBaseUrl}employee-timeline/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()
      setTimelineData(data?.employees ? data : null)
    } catch {
      Alert.alert('Error', 'Failed to fetch timeline')
    } finally {
      setTimelineLoading(false)
    }
  }

  const fetchTimelineForDate = async (dateStr, start, end) => {
    try {
      const payload = {
        fromDate: dateStr,
        date: dateStr,
        startTime: start,
        endTime: end,
      }

      const res = await fetch(
        `${apiBaseUrl}employee-timeline/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()

      setTimelineByDate((prev) => ({
        ...prev,
        [dateStr]: data,
      }))
    } catch (err) {
      console.log(err)
    }
  }

  const fetchTimelineForCurrentSelection = (start, end, from, to) => {
    if (!start || !end) return

    const dates = getDatesInRange(from, to)

    if (dates.length === 1) {
      fetchTimeline(start, end)
    } else {
      setTimelineLoading(true)

      Promise.all(
        dates.map((d) => {
          const dateStr = d.toISOString().split('T')[0]
          return fetchTimelineForDate(dateStr, start, end)
        })
      ).finally(() => setTimelineLoading(false))
    }
  }

  // ---------------- PICKER ----------------

  const openPicker = (mode) => {
    setPickerMode(mode)
    setPickerVisible(true)
  }

  const handleConfirm = (selected) => {
    setPickerVisible(false)

    let newFromDate = fromDate
    let newToDate = date
    let newStartTime = startTime
    let newEndTime = endTime

    // reset UI
    setTimelineData(null)
    setTimelineByDate({})
    setSelectedEmployeesByDate({})
    setShowModal(false)
    setIsAutoAssigned(false)

    if (pickerMode === 'fromDate') {
      newFromDate = selected
      setFromDate(selected)
    }

    if (pickerMode === 'toDate') {
      newToDate = selected
      setDate(selected)
    }

    if (pickerMode === 'start') {
      const formatted = formatToAPI(selected)
      newStartTime = formatted
      setStartTime(formatted)
      setEndTime(null)
      newEndTime = null
    }

    if (pickerMode === 'end') {
      const formatted = formatToAPI(selected)
      newEndTime = formatted
      setEndTime(formatted)
    }

    // ✅ KEY FIX: refetch if we have both times
    if (newStartTime && newEndTime) {
      fetchTimelineForCurrentSelection(
        newStartTime,
        newEndTime,
        newFromDate,
        newToDate
      )
    }
  }
  // ---------------- AUTO ASSIGN ----------------

  const handleAutoAssign = () => {
    if (!startTime || !endTime) {
      Alert.alert('Select Time First')
      return
    }

    const dates = getDatesInRange(fromDate, date)
    let autoAssigned = {}

    dates.forEach((d) => {
      const dateStr = d.toISOString().split('T')[0]

      const sourceData = isSingleDate
        ? timelineData
        : timelineByDate[dateStr]

      if (!sourceData?.employees) return

      const validEmployees = sourceData.employees.filter((emp) =>
        emp.free_slots?.some((slot) =>
          isSlotValid(slot.start_time, slot.end_time, startTime, endTime)
        )
      )

      if (validEmployees.length > 0) {
        const randomIndex = Math.floor(Math.random() * validEmployees.length)
        autoAssigned[dateStr] = validEmployees[randomIndex]
      }
    })

    setSelectedEmployeesByDate(autoAssigned)
    setIsAutoAssigned(true)

    // Alert.alert('Auto Assign', ' employees assigned')
  }


  // ---------------- PROCEED ----------------


  // const handleProceed = () => {
  //   const dates = getDatesInRangeStrings()

  //   if (!allDatesSelected()) {
  //     Alert.alert('Incomplete', 'Assign employee for all dates')
  //     return
  //   }

  //   const bookingData = dates.map((dateStr) => ({
  //     start_date: dateStr,
  //     employee_id: selectedEmployeesByDate[dateStr]?.employee_id,
  //      assigned_to_usernames: [
  //     selectedEmployeesByDate[dateStr]?.employee_username,],
  //     startTime,
  //     endTime,
  //     // package: basketItems?.map((item) => item.displayName) || [],
  //      package_names: basketItems?.map((item) => item.displayName) || [],
  //   // package_ids: basketItems?.map((item) => item.id) || [],
  //   }))

  //   // ✅ IMPORTANT: pass data
  //   navigation.navigate('Notes', {
  //     appointmentData: bookingData,
  //   })
  // }

  const handleProceed = () => {
  const dates = getDatesInRangeStrings()

  if (!allDatesSelected()) {
    Alert.alert('Incomplete', 'Assign employee for all dates')
    return
  }

  const packageIds = basketItems
    ?.map((item) => item.details?.package_id)
    .filter(Boolean)

  const packageNames = basketItems
    ?.map((item) => item.displayName)

  const bookingData = dates.map((dateStr) => ({
    start_date: dateStr,
    employee_id: selectedEmployeesByDate[dateStr]?.employee_id,
    assigned_to_usernames: [
      selectedEmployeesByDate[dateStr]?.employee_username,
    ],
    startTime,
    endTime,

    // ✅ SEND BOTH
    package_ids: packageIds,
    package_names: packageNames,
  }))

  navigation.navigate('Notes', {
    appointmentData: bookingData,
  })
}
  // ---------------- UI ----------------

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>

        <Text className="text-2xl font-bold text-center mt-4 mb-6 text-primary">
          Book Appointment
        </Text>



        {/* DATE */}
        <View className="flex-row mb-4">
          <TouchableOpacity onPress={() => openPicker('fromDate')} className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1">
            <Text className="text-gray-500 text-xs">From Date</Text>
            <Text className="text-sm font-semibold mt-1">{fromDate.toDateString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openPicker('toDate')} className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1">
            <Text className="text-gray-500 text-xs">To Date</Text>
            <Text className="text-sm font-semibold mt-1">{date.toDateString()}</Text>
          </TouchableOpacity>
        </View>

        {/* TIME */}
        <View className="flex-row mb-4">
          <TouchableOpacity onPress={() => openPicker('start')} className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1">
            <Text className="text-gray-500 text-xs">Start Time</Text>
            <Text className="text-sm font-semibold mt-1">{startTime ? formatTime(startTime) : 'Select'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openPicker('end')} className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1">
            <Text className="text-gray-500 text-xs">End Time</Text>
            <Text className="text-sm font-semibold mt-1">{endTime ? formatTime(endTime) : 'Select'}</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode={pickerMode === 'start' || pickerMode === 'end' ? 'time' : 'date'}
          date={pickerMode === 'fromDate' ? fromDate : pickerMode === 'toDate' ? date : new Date()}
          onConfirm={handleConfirm}
          onCancel={() => setPickerVisible(false)}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant="light"
          textColor="#000000"
        />

        {timelineLoading && <ActivityIndicator size="large" className="mt-4" />}

        {/* AUTO BUTTON */}
        <TouchableOpacity
          onPress={handleAutoAssign}
          className="py-3 rounded-xl mt-4 bg-secondary "
        >
          <Text className="text-white text-center font-bold">
            Auto Assign
          </Text>
        </TouchableOpacity>




        {/* ✅ SINGLE DATE TIMELINE */}

        {isSingleDate && timelineData && (
          <View className="mt-4">

            {/* EMPTY */}
            {getEmployees().length === 0 && (
              <View className="items-center mt-10">
                <Text className="text-gray-400">
                  No employees available at this time
                </Text>
              </View>
            )}

            {/* EMPLOYEES */}
            {getEmployees().map((emp, i) => {
              const total = Math.max(
                emp.timeline_summary?.total_timeline_hours || 0,
                1
              )

              const free =
                (emp.total_free_time_hours / total) * 100

              const busy =
                (emp.total_assigned_time_hours / total) * 100

              const nextFree = emp.free_slots?.[0]

              const dateStr = fromDate.toISOString().split('T')[0]

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() =>
                    setSelectedEmployeesByDate({
                      [dateStr]: emp,
                    })
                  }
                  className={`p-4 rounded-xl mb-3 border ${selectedEmployeesByDate[dateStr]?.employee_id === emp.employee_id
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 bg-white'
                    }`}
                >

                  {/* HEADER */}
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="font-bold">
                        {emp.employee_name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        @{emp.employee_username}
                      </Text>
                    </View>

                    <Text
                      className={`px-2 py-1 rounded-full text-xs ${emp.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}
                    >
                      {emp.is_available ? 'Available' : 'Not Available'}
                    </Text>
                  </View>

                  {/* NEXT FREE SLOT */}
                  {nextFree && (
                    <Text className="text-green-600 text-xs mt-1">
                      Available: {formatTime(nextFree.start_time)}
                    </Text>
                  )}

                  {/* TIMELINE BAR */}
                  <View className="mt-3">
                    <View className="flex-row h-2 rounded overflow-hidden">
                      <View
                        style={{ width: `${free}%` }}
                        className="bg-green-500"
                      />
                      <View
                        style={{ width: `${busy}%` }}
                        className="bg-yellow-500"
                      />
                    </View>

                    <Text className="text-xs text-gray-500 mt-1">
                      {emp.total_free_time_hours}h free / {emp.total_assigned_time_hours}h busy
                    </Text>
                  </View>

                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* MULTI DATE */}

        {!isSingleDate && (
          <View className="mt-4">
            {getDatesInRange(fromDate, date).map((d, i) => {
              const dateStr = d.toISOString().split('T')[0]

              return (
                <View
                  key={i}
                  className="bg-white p-4 rounded-xl mb-4 border border-gray-200"
                >

                  {/* DATE */}
                  <Text className="font-bold text-base">
                    {d.toDateString()}
                  </Text>

                  {/* 🧾 PACKAGE NAME (NEW ADDITION) */}
                  {basketItems?.length > 0 && (
                    <View className="mt-2">
                      <Text className="text-xs text-gray-500">
                        Packages:
                      </Text>

                      {basketItems.map((item, index) => (
                        <Text
                          key={index}
                          className="text-primary font-semibold"
                        >
                          • {item.displayName}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* SELECTED EMPLOYEE */}
                  {selectedEmployeesByDate[dateStr] && (
                    <Text className="text-secondary mt-2">
                      Assigned: {selectedEmployeesByDate[dateStr].employee_name}
                    </Text>
                  )}

                  {/* BUTTON */}
                  <TouchableOpacity
                    className="mt-3 bg-primary py-2 rounded"
                    onPress={() => {
                      setModalDate(dateStr)
                      setModalData(timelineByDate[dateStr])
                      setShowModal(true)
                    }}
                  >
                    <Text className="text-white text-center">
                      Assign Employee
                    </Text>
                  </TouchableOpacity>

                </View>
              )
            })}
          </View>
        )}

      </ScrollView>
      {/* <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleProceed}
          disabled={!allDatesSelected()}
          className={`py-4 rounded-xl ${allDatesSelected() ? 'bg-primary' : 'bg-gray-300'
            }`}
        >
          <Text 
          className="text-white text-center font-bold text-base">
            Proceed
          </Text>
        </TouchableOpacity>
      </View> */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleProceed}
          disabled={!allDatesSelected()}
          className={`py-4 rounded-xl ${allDatesSelected() ? 'bg-primary' : 'bg-gray-300'
            }`}
        >
          <Text className="text-white text-center font-bold text-base">
            Proceed
          </Text>
        </TouchableOpacity>
      </View>
      {/* MODAL */}
      {showModal && (
        <View className="absolute inset-0 bg-black/40 px-4 py-10 justify-center">
          <View className="bg-white p-4 rounded-2xl max-h-[80%]">

            <Text className="font-bold mb-2">
              {new Date(modalDate).toDateString()}
            </Text>


            <ScrollView>

              {modalData?.employees
                ?.filter((emp) =>
                  emp.free_slots?.some((slot) =>
                    isSlotValid(
                      slot.start_time,
                      slot.end_time,
                      startTime,
                      endTime
                    )
                  )
                )
                .map((emp, i) => {

                  const total = Math.max(
                    emp.timeline_summary?.total_timeline_hours || 0,
                    1
                  )

                  const free =
                    (emp.total_free_time_hours / total) * 100

                  const busy =
                    (emp.total_assigned_time_hours / total) * 100

                  const nextFree = emp.free_slots?.[0]

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() =>
                        setSelectedEmployeesByDate((prev) => ({
                          ...prev,
                          [modalDate]: emp,
                        }))
                      }
                      className={`p-4 mb-3 rounded-xl border ${selectedEmployeesByDate[modalDate]?.employee_id === emp.employee_id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 bg-white'
                        }`}
                    >

                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="font-bold">
                            {emp.employee_name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            @{emp.employee_username}
                          </Text>
                        </View>

                        <Text className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Available
                        </Text>
                      </View>

                      {nextFree && (
                        <Text className="text-green-600 text-xs mt-1">
                          Available: {formatTime(nextFree.start_time)}
                        </Text>
                      )}

                      <View className="mt-3">
                        <View className="flex-row h-2 rounded overflow-hidden">
                          <View style={{ width: `${free}%` }} className="bg-green-500" />
                          <View style={{ width: `${busy}%` }} className="bg-yellow-500" />
                        </View>

                        <Text className="text-xs text-gray-500 mt-1">
                          {emp.total_free_time_hours}h free / {emp.total_assigned_time_hours}h busy
                        </Text>
                      </View>

                    </TouchableOpacity>
                  )
                })}

              {/* EMPTY STATE */}
              {modalData?.employees &&
                modalData.employees.filter((emp) =>
                  emp.free_slots?.some((slot) =>
                    isSlotValid(slot.start_time, slot.end_time, startTime, endTime)
                  )
                ).length === 0 && (
                  <View className="items-center mt-10">
                    <Text className="text-gray-400">
                      No employees available at this time
                    </Text>
                  </View>
                )}

            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="bg-primary mt-3 p-3 rounded"
            >
              <Text className="text-white text-center">
                Confirm
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      )}

    </SafeAreaView>
  )
} 

export default BookAppointment


