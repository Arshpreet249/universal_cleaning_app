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
import { Ionicons } from '@expo/vector-icons'

const Payment = ({ route, navigation }) => {
  const { token } = useContext(AuthContext)

  const {
    appointmentData,
    notes,
    selectedAddress,
    totalAmount,
  } = route.params || {}

  const [loading, setLoading] = useState(false)

  // ================= FEE =================
  const calculatePayNowFee = (total) => {
    let fee = 0.0

    if (total >= 100) {
      fee = total * 0.0065 + 0.30
    } else {
      fee = total * 0.009
      if (fee < 0.2) fee = 0.2
    }

    return parseFloat(fee.toFixed(2))
  }

  const fee = calculatePayNowFee(totalAmount || 0)
  const finalTotal = (totalAmount || 0) + fee

  // ================= API =================
  const createAppointment = async () => {
    setLoading(true)

    const payload = {
      data: appointmentData.map((item) => ({
        title: item.package_names?.join(', ') || '',
        address: selectedAddress.address,
        description: `Notes: ${notes || 'N/A'}`,
        start_date: item.start_date,
        end_date: item.start_date,
        startTime: item.startTime,
        endTime: item.endTime,
        assigned_to_usernames: item.assigned_to_usernames || [],
        location: {
          latitude: Number(selectedAddress.lat),
          longitude: Number(selectedAddress.lon),
        },
        package: item.package_ids || [],
      })),
    }

    try {
      const res = await fetch(`${apiBaseUrl}create-appointment-by-client/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Appointment Created')
      } else {
        Alert.alert('Failed', result?.message || 'Error')
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong')
    }

    setLoading(false)
  }

  // ================= ICON HELPER =================
  const Icon = ({ name }) => (
    <Ionicons name={name} size={18} color="#25B7FD" />
  )

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>

        {/* HEADER */}
        <View className="mb-6 p-6 bg-primary rounded-2xl items-center">
          <Text className="text-2xl font-bold text-white">
            Payment Summary
          </Text>
          <Text className="text-white/80 mt-1">
            Review & confirm your booking
          </Text>
        </View>

        {/* APPOINTMENTS */}
        {appointmentData?.map((item, index) => (
          <View key={index} className="bg-white p-4 rounded-2xl mb-4 shadow-sm">

            {/* TITLE */}
            <View className="flex-row items-center mb-3">
              <Icon name="calendar-outline" />
              <Text className="ml-2 font-bold text-gray-900">
                Appointment {index + 1}
              </Text>
            </View>

            {/* PACKAGE */}
            <View className="flex-row items-start mb-2">
              <Icon name="cube-outline" />
              <Text className="ml-2 text-gray-800 font-medium flex-1">
                {item.package_names?.join(', ')}
              </Text>
            </View>

            {/* DATE */}
            <View className="flex-row items-center mb-2">
              <Icon name="calendar-outline" />
              <Text className="ml-2 text-gray-500">
                {item.start_date}
              </Text>
            </View>

            {/* TIME */}
            <View className="flex-row items-center mb-2">
              <Icon name="time-outline" />
              <Text className="ml-2 text-gray-500">
                {item.startTime} - {item.endTime}
              </Text>
            </View>

            {/* ASSIGNED */}
            <View className="flex-row items-center mb-2">
              <Icon name="person-circle-outline" />
              <Text className="ml-2 text-gray-500">
                {item.assigned_to_usernames?.join(', ') || 'N/A'}
              </Text>
            </View>

            {/* NOTES */}
            <View className="flex-row items-start mt-2">
              <Icon name="document-text-outline" />
              <Text className="ml-2 text-gray-400 flex-1">
                {notes || 'No notes'}
              </Text>
            </View>
          </View>
        ))}

        {/* ADDRESS */}
        <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-3 text-primary">
            📍 Service Address
          </Text>

          <View className="flex-row items-center mb-2">
            <Icon name="person-circle-outline" />
            <Text className="ml-2 font-bold text-gray-900">
              {selectedAddress?.name}
            </Text>
          </View>

          <View className="flex-row items-start mb-2">
            <Icon name="location-outline" />
            <Text className="ml-2 text-gray-600 flex-1">
              {selectedAddress?.address}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Icon name="call-outline" />
            <Text className="ml-2 text-gray-800">
              {selectedAddress?.mobile}
            </Text>
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-3 text-primary">
            💳 Payment Method
          </Text>

          <TouchableOpacity className="flex-row items-center p-4 rounded-xl border border-blue-200 bg-blue-50">
            <Icon name="card-outline" />
            <Text className="ml-3 font-medium text-gray-800">
              Card Payment
            </Text>
          </TouchableOpacity>
        </View>

        {/* BILL SUMMARY */}
        <View className="bg-white p-4 rounded-2xl shadow-sm">
          <Text className="text-lg font-semibold mb-3 text-primary">
            💰 Bill Summary
          </Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="font-medium">${totalAmount || 0}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Platform Fee</Text>
            <Text className="font-medium">${fee}</Text>
          </View>

          <View className="border-t border-gray-200 mt-3 pt-3 flex-row justify-between">
            <Text className="font-bold text-lg">Total</Text>
            <Text className="font-bold text-lg text-green-600">
              ${finalTotal.toFixed(2)}
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* BUTTON */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={createAppointment}
          disabled={loading}
          className={`p-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-primary'}`}
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