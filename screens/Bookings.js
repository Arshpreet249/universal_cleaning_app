import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'

const bookingsData = [
  {
    id: 1,
    title: 'One Time Cleaning',
    date: '25 April 2026',
    time: '02:00 PM',
    price: '$250',
    status: 'Confirmed',
  },
  {
    id: 2,
    title: 'Curtain Cleaning',
    date: '28 April 2026',
    time: '11:00 AM',
    price: '$80',
    status: 'Pending',
  },
  {
    id: 3,
    title: 'Head Massage',
    date: '30 April 2026',
    time: '05:00 PM',
    price: '$120',
    status: 'Cancelled',
  },
]

const getStatusStyle = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'bg-green-500'
    case 'Pending':
      return 'bg-orange-400'
    case 'Cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}

const Bookings = () => {
  return (
    <View className="flex-1 bg-gray-100 pt-8 px-4">

      {/* HEADER */}
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        My Bookings
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>

        {bookingsData.map((item) => (
          <View
            key={item.id}
            className="bg-white mb-4 p-4 rounded-2xl shadow-md border border-gray-100"
          >

            {/* TITLE + STATUS */}
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-gray-900">
                {item.title}
              </Text>

              <View
                className={`px-3 py-1 rounded-full ${getStatusStyle(
                  item.status
                )}`}
              >
                <Text className="text-white text-xs font-semibold">
                  {item.status}
                </Text>
              </View>
            </View>

            {/* DETAILS */}
            <Text className="text-gray-500 mt-2">
              📅 {item.date}
            </Text>

            <Text className="text-gray-500 mt-1">
              ⏰ {item.time}
            </Text>

            {/* PRICE */}
            <Text className="text-black font-bold text-base mt-2">
              {item.price}
            </Text>

            {/* BUTTON */}
            <TouchableOpacity className="mt-4 bg-blue-500 py-3 rounded-xl">
              <Text className="text-white text-center font-semibold">
                View Details
              </Text>
            </TouchableOpacity>

          </View>
        ))}

      </ScrollView>
    </View>
  )
}

export default Bookings