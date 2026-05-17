
import React, { useEffect, useState } from 'react'
import { View, Text, Linking } from 'react-native'

const Countdown = ({ route }) => {
  const { checkoutUrl } = route.params || {}

  const [seconds, setSeconds] = useState(300) // 5 min

  // ✅ OPEN URL IMMEDIATELY (only once)
  useEffect(() => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl)
    }
  }, [])

  // ✅ COUNTDOWN CONTINUES IN APP
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // ✅ Format MM:SS
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <View className="flex-1 bg-blue-50 items-center justify-center px-6">

      <Text className="text-2xl font-bold text-gray-900 mb-4">
        Complete Your Payment
      </Text>

      {/* ⏱️ TIMER */}
      <Text className="text-7xl font-extrabold text-primary mb-3">
        {minutes}:{secs < 10 ? `0${secs}` : secs}
      </Text>

      <Text className="text-gray-600 text-center">
        You have 5 minutes to complete your payment.
      </Text>

    </View>
  )
}

export default Countdown