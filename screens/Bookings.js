import React, { useState, useContext, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { AuthContext } from '../context/AuthContext'
import { apiBaseUrl } from '../components/variable'

const getStatusTextColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'text-[#28a745] font-semibold'

    case 'cancelled':
    case 'rejected':
      return 'text-[#dc3545] font-semibold'

    case 'pending':
      return 'text-[#6c757d] font-semibold'

    case 'accepted':
      return 'text-[#007bff] font-semibold'

    case 'assigned':
      return 'text-[#af51af] font-semibold'

    case 'payment pending':
      return 'text-[#f39c12] font-semibold'

    default:
      return 'text-gray-500'
  }
}

const Bookings = () => {
  const { token, user } = useContext(AuthContext)
  const navigation = useNavigation()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  //  MODAL STATES (ADDED)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rating, setRating] = useState(5)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedbackMap, setFeedbackMap] = useState({})


  useFocusEffect(
    useCallback(() => {
      fetchAppointments()
    }, [])
  )

  const fetchAppointments = async () => {
    try {
      setLoading(true)

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
      console.log('Appointments data:', data)
      setBookings(Array.isArray(data?.appointments) ? data.appointments : [])

      //  build feedback map
      const map = {}

      if (Array.isArray(data?.feedback)) {
        data.feedback.forEach((fb) => {
          map[fb.appointment] = fb
        })
      }

      setFeedbackMap(map) 
    } catch (error) {
      console.log('Error fetching appointments:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // =========================
  //  OPEN MODAL (ADDED)
  // =========================


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
 
  // ✅ SUBMIT (POST + PATCH)
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
      console.log('Feedback response:', data)

      await fetchAppointments() // refresh UI
      setModalVisible(false)
    } catch (error) {
      console.log('Feedback error:', error)
      alert('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
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
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100 px-6">
        <Text className="text-xl font-semibold text-gray-700 mb-2">
          No Bookings Yet
        </Text>

        <Text className="text-gray-500 text-center mb-6">
          You haven’t booked any service yet.
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-4 pb-24">

      {/* HEADER */}
      <Text className="text-2xl font-bold text-center mt-4 mb-4 text-primary">
        My Bookings
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {bookings.map((item) => {
          const startDate = new Date(item.start_from)
          const endDate = item.end_at ? new Date(item.end_at) : null

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

          let statusText =
            item.process || (item.status ? 'Completed' : 'In Progress')

          if (statusText?.toLowerCase() === 'initiated') {
            statusText = 'Payment Pending'
          }

          return (
            <View
              key={item.id}
              className="bg-white mb-5 p-4 rounded-2xl"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 4,
              }}
            >

              {/* TOP */}
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-900 font-semibold text-base">
                    {item.title !== 'Appointment'
                      ? item.title
                      : item.description
                        ?.split('Package:')[1]
                        ?.trim() || 'Cleaning Service'}
                  </Text>

                  <Text className="text-secondary text-base mt-1">
                    ★★★★★
                  </Text>
                </View>
              </View>

              {/* PRICE */}
              <View className="flex-row justify-between items-center mt-4">
                <Text className="text-2xl font-bold text-secondary">
                  ${item.amount}
                </Text>
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
                  <Text
                    className={`text-sm font-medium ${getStatusTextColor(
                      statusText
                    )}`}
                  >
                    {statusText}
                  </Text>
                </View>
              </View>

              {/* EXPANDED */}
              {expandedId === item.id && (

                <View className="mt-4 pt-3">

                  <Text className="text-gray-400 text-xs">Address</Text>
                  <Text className="text-gray-700 text-sm mb-2">
                    {item.address || 'N/A'}
                  </Text>

                  <Text className="text-gray-400 text-xs">Notes</Text>
                  <Text className="text-gray-700 text-sm mb-3">
                    {item.description
                      ?.split('Notes:')[1]
                      ?.split('Package:')[0]
                      ?.trim() || 'No notes'}
                  </Text>

                   {/* FEEDBACK DISPLAY */}
                  {feedbackMap[item.id] ? (
                    <View className="mt-3 p-3 bg-gray-50 rounded-lg">

                      <Text className="text-gray-400 text-xs">
                        Feedback
                      </Text>

                      <Text className="text-yellow-500 text-sm mt-1">
                        {'★'.repeat(feedbackMap[item.id].rating)}
                        {'☆'.repeat(5 - feedbackMap[item.id].rating)}
                      </Text>

                      <Text className="text-gray-700 text-sm mt-1">
                        {feedbackMap[item.id].content}
                      </Text>

                    </View>
                  ) : (
                    <Text className="text-gray-400 text-xs mt-2">
                      No feedback yet
                    </Text>
                  )}

                  {/* FEEDBACK BUTTON */}
                
                   <TouchableOpacity
                    onPress={() => openFeedbackModal(item)}
                    className="mt-4 bg-secondary py-2 rounded-lg items-center"
                  >
                    <Text className="text-white font-semibold">
                      {feedbackMap[item.id]
                        ? 'Update Feedback'
                        : 'Give Feedback'}
                    </Text>
                  </TouchableOpacity>

                  <Text className="text-xs text-gray-400 mt-2">
                    Appointment ID: {item.id}
                  </Text>

                </View>

                
              )}

              {/* MORE */}
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                className="mt-3 items-center"
              >
                <Text className="text-secondary font-semibold">
                  {expandedId === item.id ? 'Show Less ▲' : 'Show More ▼'}
                </Text>
              </TouchableOpacity>

            </View>
          )
        })}
      </ScrollView>

      {/* ================= FEEDBACK MODAL ================= */}
      <Modal visible={modalVisible} transparent animationType="slide">

        <View className="flex-1 justify-end bg-black/50">

          <View className="bg-white p-5 rounded-t-2xl">

            <Text className="text-lg font-bold mb-3">
              Give Feedback
            </Text>

            {/*  STARS */}
            <View className="flex-row mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Text
                    className={`text-2xl ${star <= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                      }`}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* INPUT */}
            <TextInput
              placeholder="Write your feedback..."
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              className="border border-gray-300 rounded-lg p-2 mb-4"
            />

            {/* BUTTONS */}
            <View className="flex-row justify-between">

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={submitFeedback}
                disabled={submitting}
                className="bg-secondary px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">
                  {submitting ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>

      </Modal>

    </SafeAreaView>
  )
}

export default Bookings