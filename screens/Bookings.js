import React, { useState, useContext, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { AuthContext } from '../context/AuthContext'
import { apiBaseUrl, REACT_APP_HOST_API_URL } from '../components/variable'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'

const getStatusTextColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'succeeded':
      return 'text-[#28a745] font-semibold'

    case 'cancelled':
    case 'rejected':
    case 'failed':
      return 'text-[#dc3545] font-semibold'

    case 'pending':
      return 'text-[#6c757d] font-semibold'

    case 'accepted':
      return 'text-[#007bff] font-semibold'

    case 'assigned':
      return 'text-[#af51af] font-semibold'

    case 'initiated':
      return 'text-[#f39c12] font-semibold'

    default:
      return 'text-gray-500'
  }
}

// 🔥 GROUP APPOINTMENTS THAT SHARE A related_appointments ID (PACKAGE BOOKINGS)
const buildDisplayList = (list) => {
  const groups = {}
  const singles = []

  list.forEach((item) => {
    if (item.related_appointments) {
      const key = item.related_appointments
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    } else {
      singles.push(item)
    }
  })

  const groupedEntries = []

  Object.entries(groups).forEach(([key, items]) => {
    // 🔥 IF ONLY ONE APPOINTMENT SHARES THIS related_appointments ID,
    // TREAT IT AS A NORMAL SINGLE CARD — NOT A PACKAGE
    if (items.length === 1) {
      singles.push(items[0])
      return
    }

    const sorted = [...items].sort(
      (a, b) => new Date(a.start_from) - new Date(b.start_from)
    )
    groupedEntries.push({
      isGroup: true,
      groupId: key,
      items: sorted,
    })
  })

  const singleEntries = singles.map((item) => ({
    isGroup: false,
    item,
  }))

  // newest groups/singles first, roughly matching original ordering by first item id
  return [...groupedEntries, ...singleEntries].sort((a, b) => {
    const aId = a.isGroup ? a.items[0].id : a.item.id
    const bId = b.isGroup ? b.items[0].id : b.item.id
    return bId - aId
  })
}

const Bookings = () => {
  const { token, user } = useContext(AuthContext)
  const navigation = useNavigation()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rating, setRating] = useState(5)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedbackMap, setFeedbackMap] = useState({})
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editData, setEditData] = useState({
    appointment_id: null,
    start_date: '',
    end_date: '',
    startTime: '',
    endTime: '',
    description: '',
  })
  const [updating, setUpdating] = useState(false)
  // 🔥 PACKAGE DATE RANGE — WHEN EDITING A GROUPED (PACKAGE) APPOINTMENT,
  // THE NEW DATE MUST STAY BETWEEN THE PACKAGE'S START AND END DATE
  const [editDateRange, setEditDateRange] = useState({ min: null, max: null })
  // 🔥 PICKER
  const [pickerMode, setPickerMode] = useState(null)
  const [isPickerVisible, setPickerVisible] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  useFocusEffect(
    useCallback(() => {
      fetchAppointments()
    }, [])
  )


  const fetchAppointments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetch(`${apiBaseUrl}all-appointments/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
        }),
      })

      const data = await response.json()
      // console.log('Appointments data:', data)


      // 🔥 TRANSACTION MAP
      const transactionsMap = {}
      if (Array.isArray(data?.transactions)) {
        data.transactions.forEach((txn) => {
          transactionsMap[txn.id] = txn
        })
      }

      // 🔥 MERGE BOOKINGS + TRANSACTIONS
      const updatedBookings = (data?.appointments || []).map((appt) => ({
        ...appt,
        transaction: transactionsMap[appt.transaction_id] || null,
      }))

      setBookings(updatedBookings)

      // 🔥 FEEDBACK MAP
      const map = {}
      if (Array.isArray(data?.feedback)) {
        data.feedback.forEach((fb) => {
          map[fb.appointment] = fb
        })
      }

      setFeedbackMap(map)
    } catch (error) {
      // console.log('Error fetching appointments:', error)
      setBookings([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }


  // 🔥 OPEN EDIT
  // packageRange (optional): { min: package_start_date, max: package_end_date }
  // Passed in for grouped/package appointments so the new date stays within the package window
  const openEditModal = (item, packageRange = null) => {
    const start = new Date(item.start_from)
    const end = item.end_at ? new Date(item.end_at) : new Date()

    setEditData({
      appointment_id: item.id,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      startTime: start.toTimeString().split(' ')[0],
      endTime: end.toTimeString().split(' ')[0],
      description: item.description || '',
    })

    setEditDateRange(
      packageRange
        ? { min: packageRange.min, max: packageRange.max }
        : { min: null, max: null }
    )

    setEditModalVisible(true)
  }

  // 🔥 PICKER
  const openEditPicker = (mode) => {
    setPickerMode(mode)
    setPickerVisible(true)
  }


  const handleEditConfirm = (selected) => {
    setPickerVisible(false)

    let updated = { ...editData }

    const now = new Date()

    // ---------------- DATE ----------------
    if (pickerMode === 'startDate') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selected < today) {
        alert('You cannot select past date')
        return
      }

      // 🔥 PACKAGE DATE RANGE CHECK (GROUPED APPOINTMENTS ONLY)
      if (editDateRange.min) {
        const packageMin = new Date(editDateRange.min)
        packageMin.setHours(0, 0, 0, 0)

        if (selected < packageMin) {
          alert('Date must be within the package start and end date')
          return
        }
      }

      if (editDateRange.max) {
        const packageMax = new Date(editDateRange.max)
        packageMax.setHours(0, 0, 0, 0)

        if (selected > packageMax) {
          alert('Date must be within the package start and end date')
          return
        }
      }

      updated.start_date = selected.toISOString().split('T')[0]
    }

    if (pickerMode === 'endDate') {
      const startDate = new Date(editData.start_date)

      if (selected < startDate) {
        alert('End date cannot be before start date')
        return
      }

      // 🔥 PACKAGE DATE RANGE CHECK (GROUPED APPOINTMENTS ONLY)
      if (editDateRange.max) {
        const packageMax = new Date(editDateRange.max)
        packageMax.setHours(0, 0, 0, 0)

        if (selected > packageMax) {
          alert('Date must be within the package start and end date')
          return
        }
      }

      updated.end_date = selected.toISOString().split('T')[0]
    }

    // ---------------- TIME ----------------
    if (pickerMode === 'startTime') {
      const selectedDate = new Date(editData.start_date)

      const isToday =
        selectedDate.toDateString() === now.toDateString()

      // BLOCK PAST TIME (TODAY ONLY)
      if (isToday) {
        if (selected < now) {
          alert('Cannot select past time')
          return
        }
      }

      const h = String(selected.getHours()).padStart(2, '0')
      const m = String(selected.getMinutes()).padStart(2, '0')

      updated.startTime = `${h}:${m}:00`
      updated.endTime = '' // reset end time
    }

    if (pickerMode === 'endTime') {
      if (!editData.startTime) {
        alert('Select start time first')
        return
      }

      const [h, m] = editData.startTime.split(':')
      const start = new Date()
      start.setHours(h, m)

      const minEnd = new Date(start.getTime() + 30 * 60000)

      if (selected < minEnd) {
        alert('End time must be at least 30 minutes after start time')
        return
      }

      const hh = String(selected.getHours()).padStart(2, '0')
      const mm = String(selected.getMinutes()).padStart(2, '0')

      updated.endTime = `${hh}:${mm}:00`
    }

    setEditData(updated)
  }

  const updateAppointment = async () => {
    try {
      setUpdating(true)

      if (
        !editData.start_date ||
        !editData.end_date ||
        !editData.startTime ||
        !editData.endTime
      ) {
        alert("Please select complete date & time")
        return
      }

      //  CONVERT TO ISO FORMAT (REQUIRED BY BACKEND)
      const start_from = `${editData.start_date}T${editData.startTime}`
      const end_at = `${editData.end_date}T${editData.endTime}`

      const payload = {
        appointment_id: editData.appointment_id,
        start_from,
        end_at,
        description: editData.description,
      }

      // console.log(" SENDING:", payload)

      const response = await fetch(`${apiBaseUrl}appointment-edit/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      // console.log('Update response:', data)


      //  BACKEND ERROR HANDLING
      if (data?.error) {
        alert(data.error)
        return
      }

      if (response.ok) {
        alert('Appointment updated successfully')
        setEditModalVisible(false)
        fetchAppointments()
      } else {
        alert(data?.message || 'Update failed')
      }
    } catch (error) {
      console.log('Update error:', error)
      alert('Something went wrong')
    } finally {
      setUpdating(false)
    }
  }
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const openFeedbackModal = (item) => {
    const existing = feedbackMap[item.id]

    setSelectedAppointment(item)

    if (existing) {
      setRating(existing.rating)
      setFeedbackText(existing.content)
    } else {
      setRating(5)
      setFeedbackText('')
    }

    setModalVisible(true)
  }

  const submitFeedback = async () => {
    try {
      setSubmitting(true)

      const existingFeedback = feedbackMap[selectedAppointment.id]

      let url = `${apiBaseUrl}employee-feedback/`
      let method = 'POST'
      let body = {
        appointment: selectedAppointment.id,
        rating: rating,
        content: feedbackText || 'Excellent service by all employees',
      }

      if (existingFeedback) {
        url = `${apiBaseUrl}employee-feedback/${existingFeedback.id}/`
        method = 'PATCH'
        body = {
          rating: rating,
          content: feedbackText || 'Updated feedback',
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      // console.log('Feedback response:', data)

      await fetchAppointments()
      setModalVisible(false)
    } catch (error) {
      // console.log('Feedback error:', error)
      alert('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadend = () => {
        const result = reader.result

        if (!result) {
          reject(new Error('Failed to convert PDF to Base64'))
          return
        }

        const base64 = result.split(',')[1]
        resolve(base64)
      }

      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const downloadInvoice = async (item) => {
    try {
      setDownloadingId(item.id)

      const invoiceUrl =
        `${REACT_APP_HOST_API_URL}/admin-user/download-invoice/`

      const response = await fetch(invoiceUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          appointment_id: item.id,
        }),
      })

      // console.log('invoice response', response.status)
      // console.log('invoice content-type', response.headers.get('content-type'))

      if (!response.ok) {
        const errorText = await response.text()
        // console.log('Invoice error:', errorText)
        alert('Invoice not available')
        return
      }

      const contentType = response.headers.get('content-type')

      if (!contentType || !contentType.includes('application/pdf')) {
        alert('Backend did not return PDF')
        return
      }

      const blob = await response.blob()
      const base64data = await blobToBase64(blob)

      const fileUri =
        FileSystem.documentDirectory + `invoice_${item.id}.pdf`

      await FileSystem.writeAsStringAsync(fileUri, base64data, {
        encoding: FileSystem.EncodingType.Base64,
      })

      // console.log('Invoice saved at:', fileUri)

      const canShare = await Sharing.isAvailableAsync()

      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save Invoice',
          UTI: 'com.adobe.pdf',
        })
      } else {
        alert('Invoice saved successfully')
      }
    } catch (error) {
      // console.log('Save invoice error:', error)
      alert('Failed to save invoice')
    } finally {
      setDownloadingId(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Select'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Select'
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const finalHour = hour % 12 || 12
    return `${finalHour}:${m} ${ampm}`
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }

  if (!loading && bookings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 px-6">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAppointments(true)}
              colors={['#0564BF']}
              tintColor="#0564BF"
            />
          }
        >
          <Text className="text-xl font-semibold text-gray-700 mb-2">
            No Bookings Yet
          </Text>

          <Text className="text-gray-500 text-center mb-6">
            You haven't booked any service yet.
          </Text>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // 🔥 GROUPED (PACKAGE) + SINGLE ENTRIES, COMBINED IN ONE LIST
  const displayList = buildDisplayList(bookings)

  return (
    <SafeAreaView className="flex-1 px-4 ">

      <Text className="text-2xl font-bold text-center mt-4 mb-4 text-primary">
        My Bookings
      </Text>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 46 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAppointments(true)}
            colors={['#0564BF']}
            tintColor="#0564BF"
          />
        }
      >
        {displayList.map((entry) => {

          // ======================================================
          // 🔥 PACKAGE / GROUPED CARD
       
          // ======================================================
          if (entry.isGroup) {
            const items = entry.items
            const firstItem = items[0]
            const txn = firstItem.transaction
            const groupPaymentStatus = txn?.status || 'N/A'
            const totalSessions = firstItem.sessions || items.length
            const groupKey = `group-${entry.groupId}`
            const isGroupExpanded = expandedId === groupKey

            // ✅ FINAL AMOUNT (SAME LOGIC AS SINGLE CARD)
            const hasValidTransaction =
              txn &&
              txn.final_amount &&
              txn.final_amount !== "0.00000" &&
              txn.final_amount !== "0.0000"

            const rawAmount = txn?.final_amount || firstItem.amount

            const shouldShowAmount =
              hasValidTransaction || (firstItem.amount && firstItem.amount !== "0.0000")

            const formattedAmount =
              rawAmount && !isNaN(rawAmount) ? Number(rawAmount).toFixed(2) : null

            // 🔥 SHARED DATA — SAME ACROSS THE PACKAGE, SHOWN ONCE
            const packageNotes = firstItem.description
              ?.split('Notes:')[1]
              ?.split('Package:')[0]
              ?.trim() || 'No notes'

            return (
              <View
                key={groupKey}
                className="bg-white mb-5 p-4 rounded-2xl shadow shadow-slate-200"
              >
                {/* TITLE + PAYMENT STATUS */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-900 font-semibold text-base">
                    {firstItem.title}
                  </Text>

                </View>

                {/* PRICE */}
                <View className="flex-row justify-between items-center mt-4">
                  {shouldShowAmount && formattedAmount && (
                    <Text className="text-2xl font-bold text-secondary">
                      ${formattedAmount}
                    </Text>
                  )}
                </View>



                {/* PACKAGE START DATE | SESSIONS | PAYMENT STATUS — WHOLE PACKAGE, NOT PER SESSION */}
                <View className="mt-4">
                  <View className="flex-row justify-between pt-2 ">
                    <Text className="text-gray-400 text-xs w-[45%]">Start date</Text>
                    <Text className="text-gray-400 text-xs w-[25%]">Sessions</Text>
                    <Text className="text-gray-400 text-xs w-[30%]">Payment</Text>
                  </View>

                  {(() => {
                    const packageStartDate = firstItem.package_start_date
                      ? new Date(firstItem.package_start_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                      : new Date(firstItem.start_from).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })

                    return (
                      <View className="flex-row justify-between items-center py-2 ">
                        <Text className="text-gray-700 text-sm w-[45%]">
                          {packageStartDate}
                        </Text>
                        <Text className="text-gray-700 text-sm w-[25%]">
                          {totalSessions}
                        </Text>
                        <Text
                          className={`text-sm w-[30%] ${getStatusTextColor(
                            groupPaymentStatus
                          )}`}
                        >
                          {groupPaymentStatus}
                        </Text>
                      </View>
                    )
                  })()}
                </View>

                {isGroupExpanded && (
                  <View className="mt-2 pt-3 border-t border-gray-100">

                    {/* ADDRESS — SHOWN ONCE FOR THE WHOLE PACKAGE */}



                    {/* PER-SESSION: DATE, TIME, EDIT, FEEDBACK */}
                    {items.map((session, idx) => {
                      const sessionStart = new Date(session.start_from)
                      const sessionEnd = session.end_at ? new Date(session.end_at) : null
                      const now = new Date()
                      const diffInHours =
                        (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60)
                      const sessionPaymentStatus =
                        session.transaction?.status || groupPaymentStatus
                      const paymentSucceeded =
                        sessionPaymentStatus?.toLowerCase() === 'succeeded'
                      const canEditSession = diffInHours > 48 && paymentSucceeded

                      const sDate = sessionStart.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                      const sTime = sessionStart.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      const eTime = sessionEnd
                        ? sessionEnd.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : 'N/A'

                      return (
                        <View
                          key={`detail-${session.id}`}
                          className="flex-row justify-between items-center py-2 border-t border-gray-50"
                        >
                          <View>
                            <Text className="text-gray-400 text-xs">
                              Session {idx + 1}
                            </Text>
                            <Text className="text-gray-700 text-sm">{sDate}</Text>
                          </View>

                          <View>
                            <Text className="text-gray-400 text-xs">Time</Text>
                            <Text className="text-gray-700 text-sm">
                              {sTime} - {eTime}
                            </Text>
                          </View>

                          {session.process?.toLowerCase() === 'completed' ? (
                            <TouchableOpacity onPress={() => openFeedbackModal(session)}>
                              <Text className="text-secondary font-semibold">
                                {feedbackMap[session.id] ? 'Update Feedback' : 'Give Feedback'}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              onPress={() =>
                                openEditModal(session, {
                                  min: firstItem.package_start_date,
                                  max: firstItem.package_end_date,
                                })
                              }
                              disabled={!canEditSession}
                            >
                              <Text
                                className={`font-semibold ${canEditSession ? 'text-secondary' : 'text-gray-300'
                                  }`}
                              >
                                Edit
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )
                    })}
                    <View className='mt-4'>

                      <Text className="text-gray-400 text-xs">Address</Text>
                      <Text className="text-gray-700 text-sm mb-2">
                        {firstItem.address || 'N/A'}
                      </Text>

                      {/* REFERENCE NO + NOTES — SHOWN ONCE */}
                      {txn?.reference_number && (
                        <>
                          <Text className="text-gray-400 text-xs">Reference No</Text>
                          <Text className="text-gray-700 text-sm mb-2">
                            {txn.reference_number}
                          </Text>
                        </>
                      )}

                      <Text className="text-gray-400 text-xs">Notes</Text>
                      <Text className="text-gray-700 text-sm mb-3">
                        {packageNotes}
                      </Text>
                    </View>
                  </View>
                )}

                <View className="flex-row justify-between items-center mt-4">

                  {groupPaymentStatus?.toLowerCase() === 'succeeded' && (
                    <TouchableOpacity
                      onPress={() => downloadInvoice(firstItem)}
                      disabled={downloadingId === firstItem.id}
                      className="text-secondary font-semibold"
                    >
                      <Text className="text-secondary font-semibold">
                        {downloadingId === firstItem.id ? 'Downloading...' : 'Download Invoice'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => toggleExpand(groupKey)}
                    className="mt-3 items-center"
                  >
                    <Text className="text-secondary font-semibold">
                      {isGroupExpanded ? 'Show Less ▲' : 'Show More ▼'}
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>
            )
          }

          // ======================================================
          // 🔥 SINGLE (NON-GROUPED) BOOKING CARD — UNCHANGED
          // ======================================================
          const item = entry.item
          const txn = item.transaction

          const startDate = new Date(item.start_from)
          const endDate = item.end_at ? new Date(item.end_at) : null
          const now = new Date()
          const diffInMs = startDate.getTime() - now.getTime()
          const diffInHours = diffInMs / (1000 * 60 * 60)

          // ✅ PAYMENT STATUS FROM API (RAW)
          const paymentStatus = txn?.status || 'N/A'

          // const canEditAppointment = diffInHours > 48
          const paymentSucceeded =
            paymentStatus?.toLowerCase() === 'succeeded'

          const canEditAppointment =
            diffInHours > 48 && paymentSucceeded

          const formattedDate = startDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })

          const formattedStartTime = startDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })

          const formattedEndTime = endDate
            ? endDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            : 'N/A'

          // ✅ BOOKING STATUS (UNCHANGED)
          let bookingStatus =
            item.process || (item.status ? 'Completed' : 'In Progress')



          // ✅ FINAL AMOUNT
          // const finalAmount = txn?.final_amount || item.amount

          const hasValidTransaction =
            txn &&
            txn.final_amount &&
            txn.final_amount !== "0.00000" &&
            txn.final_amount !== "0.0000"

          const rawAmount = txn?.final_amount || item.amount

          const shouldShowAmount = hasValidTransaction || (item.amount && item.amount !== "0.0000")

          const formattedAmount =
            rawAmount && !isNaN(rawAmount) ? Number(rawAmount).toFixed(2) : null

          return (
            <View
              key={item.id}
              className="bg-white mb-5 p-4 rounded-2xl shadow shadow-slate-200 "
            // style={{
            //   shadowColor: '#000',
            //   shadowOpacity: 0.08,
            //   shadowRadius: 10,
            //   elevation: 4,
            // }}
            >

              {/* TITLE */}
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-900 font-semibold text-base">
                    {item.title}
                  </Text>



                  {feedbackMap[item.id] && (
                    <Text className="text-yellow-500 text-base mt-1">
                      {'★'.repeat(feedbackMap[item.id].rating)}
                      {'☆'.repeat(5 - feedbackMap[item.id].rating)}
                    </Text>
                  )}
                </View>
              </View>

              {/* PRICE */}
              <View className="flex-row justify-between items-center mt-4">
                {/* <Text className="text-2xl font-bold text-secondary">
                  ${finalAmount}
                </Text> */}

                {shouldShowAmount && formattedAmount && (
                  <Text className="text-2xl font-bold text-secondary">
                    ${formattedAmount}
                  </Text>
                )}
              </View>

              {/* DATE + TIME + STATUS */}
              <View className="flex-row justify-between mt-4">

                <View>
                  <Text className="text-gray-400 text-xs">Date</Text>
                  <Text className="text-gray-700 text-sm">
                    {formattedDate}
                  </Text>
                </View>

                <View>
                  <Text className="text-gray-400 text-xs">Time</Text>
                  <Text className="text-gray-700 text-sm">
                    {formattedStartTime} - {formattedEndTime}
                  </Text>
                </View>

                <View>
                  <Text className="text-gray-400 text-xs">Status</Text>
                  <Text className={`text-sm ${getStatusTextColor(bookingStatus)}`}>
                    {bookingStatus}
                  </Text>
                </View>
              </View>

              {/* 🔥 PAYMENT STATUS (SEPARATE) */}
              <View className="mt-2">
                <Text className="text-gray-400 text-xs">Payment Status</Text>
                <Text className={`text-sm ${getStatusTextColor(paymentStatus)}`}>
                  {paymentStatus}
                </Text>
              </View>

              {/* EXPANDED */}
              {expandedId === item.id && (
                <View className="mt-4 pt-3">

                  <Text className="text-gray-400 text-xs">Address</Text>
                  <Text className="text-gray-700 text-sm mb-2">
                    {item.address || 'N/A'}
                  </Text>

                  {/* 🔥 REFERENCE NUMBER */}
                  {txn?.reference_number && (
                    <>
                      <Text className="text-gray-400 text-xs">Reference No</Text>
                      <Text className="text-gray-700 text-sm mb-2">
                        {txn.reference_number}
                      </Text>
                    </>
                  )}

                  <Text className="text-gray-400 text-xs">Notes</Text>
                  <Text className="text-gray-700 text-sm mb-3">
                    {item.description
                      ?.split('Notes:')[1]
                      ?.split('Package:')[0]
                      ?.trim() || 'No notes'}
                  </Text>

                  {feedbackMap[item.id] ? (
                    <View className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <Text className="text-gray-400 text-xs">Feedback</Text>
                      <Text className="text-gray-700 text-sm mt-1">
                        {feedbackMap[item.id].content}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-gray-400 text-xs mt-2">
                      No feedback yet
                    </Text>
                  )}


                  <Text className="text-xs text-gray-400 mt-2">
                    Appointment ID: #{item.id}
                  </Text>

                </View>
              )}



              <View className="flex-row justify-between items-center mt-4">



                {item.process?.toLowerCase() === 'completed' ? (
                  <TouchableOpacity
                    onPress={() => openFeedbackModal(item)}
                  >
                    <Text className='text-secondary font-semibold'>
                      {feedbackMap[item.id] ? 'Update Feedback' : 'Give Feedback'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    disabled={!canEditAppointment}
                  >
                    <Text
                      className={`font-semibold ${canEditAppointment ? 'text-secondary' : 'text-gray-300'
                        }`}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                )}

                {paymentStatus?.toLowerCase() === 'succeeded' && (
                  <TouchableOpacity
                    onPress={() => downloadInvoice(item)}
                    disabled={downloadingId === item.id}
                    className="text-secondary font-semibold"
                  >
                    <Text className="text-secondary font-semibold">
                      {downloadingId === item.id ? 'Downloading...' : 'Download Invoice'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* SHOW MORE BUTTON */}
                <TouchableOpacity
                  onPress={() => toggleExpand(item.id)}
                  className="mt-3 items-center"
                >
                  <Text className="text-secondary font-semibold">
                    {expandedId === item.id ? 'Show Less ▲' : 'Show More ▼'}
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          )
        })}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white p-5 rounded-t-2xl max-h-[80%]">
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >

                <Text className="text-lg font-bold mb-3">
                  Give Feedback
                </Text>

                <View className="flex-row mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Text className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  placeholder="Write your feedback..."
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  multiline
                  textAlignVertical="top"
                  className="border border-gray-300 rounded-xl p-3 mb-4 min-h-[120px] text-gray-900"
                />

                <View className="flex-row justify-between mb-2">

                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-gray-200 px-5 py-3 rounded-xl"
                  >
                    <Text className="font-semibold text-gray-800">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={submitFeedback}
                    disabled={submitting}
                    className={`px-5 py-3 rounded-xl ${submitting ? 'bg-gray-400' : 'bg-secondary'}`}
                  >
                    <Text className="text-white font-semibold">
                      {submitting ? 'Submitting...' : 'Submit'}
                    </Text>
                  </TouchableOpacity>

                </View>

              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40">

          <View className="bg-white w-[90%] p-5 rounded-3xl">

            <Text className="text-xl font-bold text-primary mb-4">
              Edit Booking
            </Text>

            {/* START DATE */}
            <Text className="text-secondary px-2 py-1 text-base">Start Date</Text>
            <TouchableOpacity
              onPress={() => openEditPicker('startDate')}
              className="bg-gray-100 p-4 rounded-xl mb-3"
            >

              <Text className="font-semibold mt-1 text-gray-800">
                {formatDate(editData.start_date)}
              </Text>
            </TouchableOpacity>

            {/* END DATE */}
            <Text className="text-secondary px-2 py-1 text-base">End Date</Text>
            <TouchableOpacity
              onPress={() => openEditPicker('endDate')}
              className="bg-gray-100 p-4 rounded-xl mb-3"
            >

              <Text className="font-semibold mt-1 text-gray-800">
                {formatDate(editData.end_date)}
              </Text>
            </TouchableOpacity>

            {/* START TIME */}
            <Text className="text-secondary px-2 py-1 text-base">Start Time</Text>
            <TouchableOpacity
              onPress={() => openEditPicker('startTime')}
              className="bg-gray-100 p-4 rounded-xl mb-3"
            >

              <Text className="font-semibold mt-1 text-gray-800">
                {formatTime(editData.startTime)}
              </Text>
            </TouchableOpacity>

            {/* END TIME */}
            <Text className="text-secondary px-2 py-1 text-base">End Time</Text>
            <TouchableOpacity
              onPress={() => openEditPicker('endTime')}
              className="bg-gray-100 p-4 rounded-xl mb-3"
            >

              <Text className="font-semibold mt-1 text-gray-800">
                {formatTime(editData.endTime)}
              </Text>
            </TouchableOpacity>

            <View className="flex-row mt-4">

              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="flex-1 border border-secondary p-3 rounded-xl mr-2"
              >
                <Text className="text-center">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={updateAppointment}
                className="flex-1 bg-secondary p-3 rounded-xl ml-2"
              >
                <Text className="text-white text-center">
                  {updating ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </View>

        {/* PICKER */}
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode={
            pickerMode === 'startTime' || pickerMode === 'endTime'
              ? 'time'
              : 'date'
          }
          onConfirm={handleEditConfirm}
          onCancel={() => setPickerVisible(false)}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant="light"
          textColor="#000000"

        />

      </Modal>

    </SafeAreaView>
  )
}

export default Bookings