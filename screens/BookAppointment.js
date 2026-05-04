
import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL } from '../components/variable'

const BookAppointment = () => {
  const { token } = useContext(AuthContext)

  const [fromDate, setFromDate] = useState(new Date())
  const [date, setDate] = useState(new Date())

  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)

  const [pickerMode, setPickerMode] = useState(null) // fromDate | toDate | start | end
  const [isPickerVisible, setPickerVisible] = useState(false)

  const [timelineData, setTimelineData] = useState(null)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // ---------------- FORMAT TIME ----------------
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
        `${REACT_APP_HOST_API_URL}/admin-user/employee-timeline/`,
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

      if (!data?.employees) {
        setTimelineData(null)
        return
      }

      setTimelineData(data)
    } catch (err) {
      console.log(err)
      Alert.alert('Error', 'Failed to fetch timeline')
    } finally {
      setTimelineLoading(false)
    }
  }

  // ---------------- PICKER CONTROL ----------------
  const openPicker = (mode) => {
    setPickerMode(mode)
    setPickerVisible(true)
  }

  const handleConfirm = (selected) => {
    setPickerVisible(false)

    setTimelineData(null)
    setSelectedEmployee(null)

    if (pickerMode === 'fromDate') {
      setFromDate(selected)
    }

    if (pickerMode === 'toDate') {
      setDate(selected)
    }

    if (pickerMode === 'start') {
      const formatted = formatToAPI(selected)
      setStartTime(formatted)
      setEndTime(null)
    }

    if (pickerMode === 'end') {
      const formatted = formatToAPI(selected)
      setEndTime(formatted)

      if (startTime) {
        fetchTimeline(startTime, formatted)
      }
    }
  }

  // ---------------- FILTER EMPLOYEES ----------------
  const getEmployees = () => {
    if (!timelineData?.employees) return []
    if (!startTime || !endTime) return []

    return timelineData.employees
      .filter((emp) =>
        emp.free_slots?.some((slot) =>
          isSlotValid(slot.start_time, slot.end_time, startTime, endTime)
        )
      )
      .sort((a, b) => b.is_available - a.is_available)
  }

  // ---------------- SELECT EMPLOYEE ----------------
  const toggleEmployee = (emp) => {
    if (selectedEmployee?.employee_id === emp.employee_id) {
      setSelectedEmployee(null)
    } else {
      setSelectedEmployee(emp)
    }
  }

  // ---------------- CONTINUE ----------------
  const handleContinue = () => {
    if (!selectedEmployee) return

    Alert.alert(
      'Booking',
      `Selected Employee:\n${selectedEmployee.employee_name}`
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <Text className="text-2xl font-bold text-center mt-4 mb-6 text-primary">
          Book Appointment
        </Text>

        {/* DATE ROW */}
        <View className="flex-row mb-4">

          <TouchableOpacity
            onPress={() => openPicker('fromDate')}
            className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1"
          >
            <Text className="text-gray-500 text-xs">From Date</Text>
            <Text className="text-sm font-semibold mt-1">
              {fromDate.toDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openPicker('toDate')}
            className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1"
          >
            <Text className="text-gray-500 text-xs">To Date</Text>
            <Text className="text-sm font-semibold mt-1">
              {date.toDateString()}
            </Text>
          </TouchableOpacity>

        </View>

        {/* TIME ROW */}
        <View className="flex-row mb-4">

          <TouchableOpacity
            onPress={() => openPicker('start')}
            className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1"
          >
            <Text className="text-gray-500 text-xs">Start Time</Text>
            <Text className="text-sm font-semibold mt-1">
              {startTime ? formatTime(startTime) : 'Select'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openPicker('end')}
            className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1"
          >
            <Text className="text-gray-500 text-xs">End Time</Text>
            <Text className="text-sm font-semibold mt-1">
              {endTime ? formatTime(endTime) : 'Select'}
            </Text>
          </TouchableOpacity>

        </View>

        {/* MODAL PICKER */}
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode={
            pickerMode === 'start' || pickerMode === 'end'
              ? 'time'
              : 'date'
          }
          date={new Date()}
          onConfirm={handleConfirm}
           isDarkModeEnabled={false} 
          onCancel={() => setPickerVisible(false)}
        />

        {/* LOADING */}
        {timelineLoading && (
          <ActivityIndicator size="large" className="mt-4" />
        )}

        {/* EMPTY STATE */}
        {!timelineData && !timelineLoading && (
          <View className="items-center mt-10">
            <Text className="text-gray-400 text-center px-6">
              Choose a date and time to see available staff and slots
            </Text>
          </View>
        )}

        {/* EMPLOYEES */}
        {timelineData && (
          <View className="mt-4">

            {getEmployees().length === 0 && (
              <View className="items-center mt-10">
                <Text className="text-gray-400">
                  No employees available at this time
                </Text>
              </View>
            )}

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

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleEmployee(emp)}
                  className={`p-4 rounded-xl mb-3 border ${
                    selectedEmployee?.employee_id === emp.employee_id
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

                    <Text className={`px-2 py-1 rounded-full text-xs ${
                      emp.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {emp.is_available ? 'Available' : 'Not Available'}
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
          </View>
        )}

        {/* CONTINUE */}
        <View className="mt-6 mb-10">
          <TouchableOpacity
            disabled={!selectedEmployee}
            onPress={handleContinue}
            className={`py-3 rounded-xl ${
              !selectedEmployee ? 'bg-gray-300' : 'bg-primary'
            }`}
          >
            <Text className="text-white text-center font-bold">
              Book Appointment
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default BookAppointment