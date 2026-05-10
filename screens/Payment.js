import React, { useContext, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { AuthContext } from '../context/AuthContext'
import { apiBaseUrl } from '../components/variable'

const Payment = ({ route, navigation }) => {
  const { token } = useContext(AuthContext)

  const { appointmentData, notes, selectedAddress } = route.params || {}

  const [loading, setLoading] = useState(false)

  // ================= CREATE APPOINTMENT =================
  const createAppointment = async () => {
    setLoading(true)

    const payload = {
      data: appointmentData.map((item) => ({
        title: item.package_names?.join(', ') || '',
        address: selectedAddress.address,

        description: `Notes: ${notes || 'N/A'}\nPackage: ${
          item.package_names?.join(', ') || 'None'
        }`,

        start_date: item.start_date,
        end_date: item.start_date,

        startTime: item.startTime,
        endTime: item.endTime,

        assigned_to_usernames:
          item.assigned_to_usernames || [],

        location: {
          latitude: Number(selectedAddress.lat),
          longitude: Number(selectedAddress.lon),
        },

        package: item.package_ids || [],
      })),
    }

    try {
      const res = await fetch(
        `${apiBaseUrl}create-appointment-by-client/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const result = await res.json()
      console.log("API RESPONSE:", result)

      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Appointment Created')
        // navigation.navigate('Success')
      } else {
        Alert.alert(
          'Failed',
          result?.message || 'Could not create appointment'
        )
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong')
    }

    setLoading(false)
  }

  // ================= UI =================
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* HEADER */}
        <Text className="text-2xl font-bold text-center text-blue-600 mb-6">
          Payment
        </Text>

        {/* LOOP ALL APPOINTMENTS */}
        {appointmentData?.map((item, index) => (
          <View
            key={index}
            className="bg-white p-5 rounded-2xl mb-5 shadow"
          >
            <Text className="text-lg font-bold mb-3">
              Appointment 
            </Text>

            <Text> {item.package_names?.join(', ')}</Text>
            <Text> {item.start_date}</Text>
            <Text> {item.startTime} - {item.endTime}</Text>
            <Text> {item.assigned_to_usernames?.join(', ') || 'N/A'}</Text>

            <Text className="mt-2 text-gray-500">
              Notes: {notes || 'N/A'}
            </Text>
          </View>
        ))}

        {/* ADDRESS */}
        <View className="bg-white p-5 rounded-2xl mb-5">
          <Text className="text-lg font-bold mb-3">
            Service Address
          </Text>
          <Text>{selectedAddress?.name}</Text>
          <Text>{selectedAddress?.address}</Text>
          <Text>📞 {selectedAddress?.mobile}</Text>
        </View>

        {/* PAYMENT METHODS */}
        <View className="bg-white p-5 rounded-2xl mb-5">
          <Text className="text-lg font-bold mb-3">
            Select Payment Method
          </Text>
          <TouchableOpacity className="p-4 border border-gray-200 rounded-xl mb-3">
            <Text>💳 Card Payment</Text>
          </TouchableOpacity>

        </View>

        {/* TOTAL (STATIC FOR NOW) */}
        <View className="bg-white p-5 rounded-2xl mb-5">
          <Text className="text-lg font-bold mb-3">Total</Text>
          <Text className="text-2xl font-bold text-green-600">
            $499
          </Text>
        </View>

      </ScrollView>

      {/* PAY BUTTON */}
      <View className="p-4 bg-white">
        <TouchableOpacity
          onPress={createAppointment}
          disabled={loading}
          className={`p-4 rounded-xl ${
            loading ? 'bg-gray-400' : 'bg-blue-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Pay & Confirm Booking
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Payment