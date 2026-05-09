import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native'

const Payment = ({ route, navigation }) => {
  const { payload, notes, selectedAddress } = route.params || {}

  const appointment = payload?.data?.[0]

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* HEADER */}
        <Text className="text-3xl font-bold text-center text-blue-600 mb-6">
          Payment
        </Text>

        {/* APPOINTMENT CARD */}
        <View className="bg-white p-5 rounded-2xl mb-5 shadow">
          <Text className="text-lg font-bold mb-3">Appointment Details</Text>

          <Text>📍 {appointment?.address}</Text>
          <Text>📅 {appointment?.start_date}</Text>
          <Text>⏰ {appointment?.startTime} - {appointment?.endTime}</Text>
          <Text>👤 {appointment?.assigned_to_usernames?.join(', ')}</Text>

          <Text className="mt-2 text-gray-500">
            {appointment?.description}
          </Text>
        </View>

        {/* ADDRESS */}
        <View className="bg-white p-5 rounded-2xl mb-5">
          <Text className="text-lg font-bold mb-3">Service Address</Text>
          <Text>{selectedAddress?.name}</Text>
          <Text>{selectedAddress?.address}</Text>
          <Text>📞 {selectedAddress?.mobile}</Text>
        </View>

        {/* PAYMENT METHODS */}
        <View className="bg-white p-5 rounded-2xl mb-5">
          <Text className="text-lg font-bold mb-3">Select Payment Method</Text>

          <TouchableOpacity className="p-4 border rounded-xl mb-3">
            <Text>💵 Cash on Service</Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-4 border rounded-xl mb-3">
            <Text>💳 Card Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-4 border rounded-xl">
            <Text>📱 UPI Payment</Text>
          </TouchableOpacity>
        </View>

        {/* TOTAL */}
        <View className="bg-white p-5 rounded-2xl mb-5">
          <Text className="text-lg font-bold mb-3">Total</Text>
          <Text className="text-2xl font-bold text-green-600">
            $499 {/* You can make dynamic */}
          </Text>
        </View>

      </ScrollView>

      {/* PAY BUTTON */}
      <View className="p-4 bg-white">
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-xl"
          onPress={() => {
            alert('Payment Successful ✅')
            navigation.navigate('Home') // or success screen
          }}
        >
          <Text className="text-white text-center font-bold text-lg">
            Pay Now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Payment