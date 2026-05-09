import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
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

  useEffect(() => {
    fetchAppointments()
  }, [])

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
      setBookings(Array.isArray(data) ? data : [])
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

  //  LOADING
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
          You haven’t booked any service yet. Start by creating your first booking.
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
          const endDate = new Date(item.end_at)

          const formattedDate = startDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })

          const formattedStartTime = startDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })

          const formattedEndTime = endDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })

          const statusText =
            item.process || (item.status ? 'Completed' : 'In Progress')

          const packageText =
            item.description?.split('Package:')[1]?.trim() ||
            'Cleaning Service'

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
              {/* TOP ROW */}
              <View className="flex-row justify-between items-center">
                <View>

                  <Text className="text-gray-900 font-semibold text-base">
                    {item.title !== 'Appointment'
                      ? item.title
                      : item.description?.split('Package:')[1]?.trim() || 'Cleaning Service'}
                  </Text>
                  <Text className="text-secondary text-base mt-1">
                    ★★★★★ 
                  </Text>
                </View>
              </View>

              {/* SERVICE + PRICE */}
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

              {/* 🔽 EXPANDED CONTENT */}
              {expandedId === item.id && (
                <View className="mt-4 pt-3">
                  {/* Address */}
                  <Text className="text-gray-400 text-xs">Address</Text>
                  <Text className="text-gray-700 text-sm mb-2">
                    {item.address || 'N/A'}
                  </Text>

                  {/* Notes */}
                  <Text className="text-gray-400 text-xs">Notes</Text>
                  <Text className="text-gray-700 text-sm">
                    {item.description?.split('Notes:')[1]?.split('Package:')[0]?.trim() ||
                      'No notes'}
                  </Text>
                </View>
              )}

              {/*  MORE BUTTON */}
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
    </SafeAreaView>
  )
}

export default Bookings