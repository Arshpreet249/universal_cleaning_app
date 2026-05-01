
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
import DateTimePicker from '@react-native-community/datetimepicker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL } from '../components/variable'

const BookAppointment = () => {
  const { token } = useContext(AuthContext)

  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

    const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [showTimePicker, setShowTimePicker] = useState(false)
//   const [selectedTime, setSelectedTime] = useState(null)

const [timeMode, setTimeMode] = useState('start') // start | end

  const [timelineData, setTimelineData] = useState(null)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])

  // ---------------- FORMAT TIME (UI) ----------------
  const formatTime = (time) => {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hour = h % 12 || 12
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${hour}:${m} ${ampm}`
  }

  // ---------------- FORMAT TIME (API SAFE) ----------------
  const formatToAPI = (dateObj) => {
    const h = String(dateObj.getHours()).padStart(2, '0')
    const m = String(dateObj.getMinutes()).padStart(2, '0')
    return `${h}:${m}:00`
  }

  // ---------------- API ----------------
  const fetchTimeline = async (start,end) => {
    try {
      setTimelineLoading(true)

      const payload = {
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

  // ---------------- DATE ----------------
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date
    setShowDatePicker(Platform.OS === 'ios')
    setDate(currentDate)

    setSelectedTime(null)
    setTimelineData(null)
    setSelectedEmployees([]) // ✅ reset
  }

  // ---------------- TIME ----------------
//   const onTimeChange = (event, time) => {
//     setShowTimePicker(false)

//     if (time) {
//       const formatted = formatToAPI(time)

//       setSelectedTime(formatted)
//       setTimelineData(null)
//       setSelectedEmployees([]) // ✅ reset

//       fetchTimeline(formatted)
//     }
//   }

 const onTimeChange = (event, time) => {
    setShowTimePicker(false)

    if (!time) return

    const formatted = formatToAPI(time)

    setTimelineData(null)
    setSelectedEmployees([])

    // START TIME
    if (timeMode === 'start') {
      setStartTime(formatted)
    }

    // END TIME
    if (timeMode === 'end') {
      setEndTime(formatted)

      // only call API when start exists
      if (startTime) {
        fetchTimeline(startTime, formatted)
      }
    }
  }


  // ---------------- FILTER EMPLOYEES ----------------
  const getEmployees = () => {
    if (!timelineData?.employees) return []

    return timelineData.employees
      .filter((e) => parseFloat(e.total_free_time_hours) > 0)
      .sort((a, b) => b.is_available - a.is_available)
  }

  // ---------------- SELECT EMPLOYEE ----------------
  const toggleEmployee = (emp) => {
    const exists = selectedEmployees.find(
      (e) => e.employee_id === emp.employee_id
    )

    if (exists) {
      setSelectedEmployees((prev) =>
        prev.filter((e) => e.employee_id !== emp.employee_id)
      )
    } else {
      setSelectedEmployees((prev) => [...prev, emp])
    }
  }

  // ---------------- CONTINUE ----------------
  const handleContinue = () => {
    if (selectedEmployees.length === 0) return

    Alert.alert(
      'Booking',
      `Selected Employees:\n${selectedEmployees
        .map(e => e.employee_name)
        .join(', ')}`
    )

    // 👉 next step: navigation or API
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <Text className="text-2xl font-bold text-center mt-4 mb-6 text-primary">
          Book Appointment
        </Text>

        {/* DATE */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-white p-4 rounded-xl border border-gray-200 mb-4"
        >
          <Text className="text-gray-500">Date</Text>
          <Text className="text-lg font-semibold">
            {date.toDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        {/* TIME */}
        {/* <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          className="bg-white p-4 rounded-xl border border-gray-200 mb-4"
        >
          <Text className="text-gray-500">Time</Text>
          <Text className="text-lg font-semibold">
            {selectedTime ? formatTime(selectedTime) : 'Select Time'}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            onChange={onTimeChange}
          />
        )} */}

         <TouchableOpacity
          onPress={() => {
            setTimeMode('start')
            setShowTimePicker(true)
          }}
          className="bg-white p-4 rounded-xl border border-gray-200 mb-4"
        >
          <Text className="text-gray-500">Start Time</Text>
          <Text className="text-lg font-semibold">
            {startTime ? formatTime(startTime) : 'Select Start Time'}
          </Text>
        </TouchableOpacity>

        {/* END TIME */}
        <TouchableOpacity
          onPress={() => {
            setTimeMode('end')
            setShowTimePicker(true)
          }}
          className="bg-white p-4 rounded-xl border border-gray-200 mb-4"
        >
          <Text className="text-gray-500">End Time</Text>
          <Text className="text-lg font-semibold">
            {endTime ? formatTime(endTime) : 'Select End Time'}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            onChange={onTimeChange}
          />
        )}


        {/* LOADING */}
        {timelineLoading && (
          <ActivityIndicator size="large" className="mt-4" />
        )}

        {/* EMPTY BEFORE SELECT */}
        {!timelineData && !timelineLoading && (
          <View className="items-center mt-10">
            <Text className="text-gray-400 text-center px-6">
              Choose a date and time to see available staff and slots
            </Text>
          </View>
        )}

        {/* TIMELINE */}
        {timelineData && (
          <View className="mt-4">

            {/* NO AVAILABLE */}
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

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleEmployee(emp)}
                  className={`p-4 rounded-xl mb-3 border ${
                    selectedEmployees.find(e => e.employee_id === emp.employee_id)
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
                      className={`px-2 py-1 rounded-full text-xs ${
                        emp.is_available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {emp.is_available
                        ? 'Available Now'
                        : 'Available Later'}
                    </Text>
                  </View>

                  {/* NEXT SLOT */}
                  {nextFree && (
                    <Text className="text-green-600 text-xs mt-1">
                      Next Available: {formatTime(nextFree.start_time)}
                    </Text>
                  )}

                  {/* PROGRESS */}
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
                      {emp.total_free_time_hours}h free /{' '}
                      {emp.total_assigned_time_hours}h busy
                    </Text>
                  </View>

                  {/* FREE SLOTS */}
                  {emp.free_slots?.length > 0 && (
                    <View className="mt-2">
                      <Text className="text-green-600 text-xs font-bold">
                        Free Slots
                      </Text>

                      {emp.free_slots.map((s, idx) => (
                        <TouchableOpacity
                          key={idx}
                          className="bg-green-100 px-2 py-1 rounded mt-1"
                        >
                          <Text className="text-xs text-green-800">
                            {formatTime(s.start_time)} - {formatTime(s.end_time)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* ✅ CONTINUE BUTTON (ADDED ONLY) */}
        <View className="mt-6 mb-10">
          <TouchableOpacity
            disabled={selectedEmployees.length === 0}
            onPress={handleContinue}
            className={`py-3 rounded-xl ${
              selectedEmployees.length === 0
                ? 'bg-gray-300'
                : 'bg-primary'
            }`}
          >
            <Text className="text-white text-center font-bold">
              Book ({selectedEmployees.length})
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default BookAppointment