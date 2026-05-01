
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

  const [fromDate, setFromDate] = useState(new Date())
  const [showFromDatePicker, setShowFromDatePicker] = useState(false)

  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const [timeMode, setTimeMode] = useState('start') // start | end

  const [timelineData, setTimelineData] = useState(null)
  const [timelineLoading, setTimelineLoading] = useState(false)
const [selectedEmployee, setSelectedEmployee] = useState(null)

  // ---------------- FORMAT TIME (UI FIXED) ----------------
  const formatTime = (time) => {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hourNum = parseInt(h, 10)
    const hour = hourNum % 12 || 12
    const ampm = hourNum >= 12 ? 'PM' : 'AM'
    return `${hour}:${m} ${ampm}`
  }

  // ---------------- FORMAT TIME (API SAFE) ----------------
  const formatToAPI = (dateObj) => {
    const h = String(dateObj.getHours()).padStart(2, '0')
    const m = String(dateObj.getMinutes()).padStart(2, '0')
    return `${h}:${m}:00`
  }

   // ---------------- TIME COMPARISON ----------------
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

  // ---------------- FROM DATE ----------------
  const onFromDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate
    setShowFromDatePicker(Platform.OS === 'ios')
    setFromDate(currentDate)

    setTimelineData(null)
    setSelectedEmployee(null)
  }

  // ---------------- DATE ----------------
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date
    setShowDatePicker(Platform.OS === 'ios')
    setDate(currentDate)

    setTimelineData(null)
    setSelectedEmployee(null)
  }

  // ---------------- TIME ----------------
  const onTimeChange = (event, time) => {
    setShowTimePicker(false)

    if (!time) return

    const formatted = formatToAPI(time)

    setTimelineData(null)
    setSelectedEmployee(null)

    // START TIME
    if (timeMode === 'start') {
      setStartTime(formatted)
      setEndTime(null)
    }

    // END TIME
    if (timeMode === 'end') {
      setEndTime(formatted)

      // SAFE CHECK
      if (startTime) {
        fetchTimeline(startTime, formatted)
      }
    }
  }

  // ---------------- FILTER EMPLOYEES ----------------
//   const getEmployees = () => {
//     if (!timelineData?.employees) return []

//     return timelineData.employees
//       .filter((e) => parseFloat(e.total_free_time_hours) > 0)
//       .sort((a, b) => b.is_available - a.is_available)
//   }

const getEmployees = () => {
    if (!timelineData?.employees) return []
    if (!startTime || !endTime) return []

    return timelineData.employees
      .filter((emp) => {
        if (!emp.free_slots || emp.free_slots.length === 0) return false

        // employee must fully cover selected time range
        return emp.free_slots.some((slot) =>
          isSlotValid(
            slot.start_time,
            slot.end_time,
            startTime,
            endTime
          )
        )
      })
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

     {/* ================= DATE ROW ================= */}
          <View className="flex-row mb-4">

          <TouchableOpacity
            onPress={() => setShowFromDatePicker(true)}
            className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1"
          >
            <Text className="text-gray-500 text-xs">From Date</Text>
            <Text className="text-sm font-semibold mt-1">
              {fromDate.toDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1"
          >
            <Text className="text-gray-500 text-xs">To Date</Text>
            <Text className="text-sm font-semibold mt-1">
              {date.toDateString()}
            </Text>
          </TouchableOpacity>

        </View>

       
          {/* ================= TIME ROW ================= */}
        <View className="flex-row mb-4">

          <TouchableOpacity
            onPress={() => {
              setTimeMode('start')
              setShowTimePicker(true)
            }}
            className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1"
          >
            <Text className="text-gray-500 text-xs">Start Time</Text>
            <Text className="text-sm font-semibold mt-1">
              {startTime ? formatTime(startTime) : 'Select'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setTimeMode('end')
              setShowTimePicker(true)
            }}
            className="flex-1 bg-white p-4 rounded-xl border border-gray-200 mx-1"
          >
            <Text className="text-gray-500 text-xs">End Time</Text>
            <Text className="text-sm font-semibold mt-1">
              {endTime ? formatTime(endTime) : 'Select'}
            </Text>
          </TouchableOpacity>

        </View>

        {/* DATE PICKERS */}
        {showFromDatePicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            onChange={onFromDateChange}
          />
        )}

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={onDateChange}
          />
        )}

        {/* TIME PICKER */}
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
                    // selectedEmployees.find(e => e.employee_id === emp.employee_id)
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
                      Next Available: {formatTime(nextFree.start_time)}
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
            // disabled={selectedEmployees.length === 0}
            disabled={!selectedEmployee}
            onPress={handleContinue}
            className={`py-3 rounded-xl ${
      !selectedEmployee ? 'bg-gray-300' : 'bg-primary'
    }`}
          >
            <Text className="text-white text-center font-bold">
              {/* Book ({selectedEmployees.length}) */}
              Book ({selectedEmployee })
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default BookAppointment