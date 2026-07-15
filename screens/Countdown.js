

import React, { useEffect, useState, useRef } from 'react'
import { View, Text, Linking, ActivityIndicator, AppState , BackHandler} from 'react-native'
import { REACT_APP_HOST_API_URL } from '../components/variable'

const Countdown = ({ route, navigation }) => {
  const { checkoutUrl, paymentRequestId } = route.params || {}
// console.log('Countdown params:', checkoutUrl, paymentRequestId) 
// console.log('Countdown paymentRequestId:', paymentRequestId) 

  const DURATION = 300 // 5 min
  const endTimeRef = useRef(Date.now() + DURATION * 1000)

  const [seconds, setSeconds] = useState(DURATION)
  const [checking, setChecking] = useState(false)
  const appState = useRef(AppState.currentState)
  const checkingRef = useRef(false)

    const goToBookings = () => {
    navigation.replace('Main', { screen: 'Booking' })
  }


  // ✅ OPEN URL IMMEDIATELY (only once)
  useEffect(() => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl)
    }
  }, [])

   // ✅ BLOCK ANDROID HARDWARE BACK BUTTON
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true // returning true = swallow the back press, do nothing
    )
    return () => backHandler.remove()
  }, [])

  // ✅ BLOCK iOS SWIPE-BACK / HEADER BACK GESTURE
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    })
  }, [navigation])

  const checkStatus = async () => {
    if (!paymentRequestId || checkingRef.current) return
    checkingRef.current = true
    setChecking(true)
    try {
      const res = await fetch(
        `${REACT_APP_HOST_API_URL}/payment/payment-details/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_request_id: paymentRequestId }),
        }
      )
    // console.log('checkStatus HTTP status:', res.status) 

      if (!res.ok) return

      const result = await res.json()
          console.log('checkStatus RAW response:', JSON.stringify(result)) // 👈 ADD

      const data = result?.data || {}
      const status = (data.status || '').toLowerCase()
    // console.log('checkStatus parsed status:', status) 

      if (['succeeded', 'completed', 'success'].includes(status)) {
        // navigation.replace('Booking')
           goToBookings()
      } else if (['failed', 'cancelled', 'canceled'].includes(status)) {
        // navigation.replace('Booking')
           goToBookings()
      }
      // pending → keep polling
    } catch (err) {
      console.log('Payment status check error:', err)
    } finally {
      checkingRef.current = false
      setChecking(false)
    }
  }

  // ✅ TICK — recompute remaining time from absolute end timestamp
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((endTimeRef.current - Date.now()) / 1000)
      )
      setSeconds(remaining)

      if (remaining === 0) {
        goToBookings()
      }
    }

    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  // ✅ POLL every 10s while app is in foreground
  useEffect(() => {
    if (!paymentRequestId) return

    checkStatus() // immediate check
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [paymentRequestId])

  // ✅ On returning from browser, immediately re-check + re-sync countdown
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        // resync displayed time in case the tick was throttled
        const remaining = Math.max(
          0,
          Math.round((endTimeRef.current - Date.now()) / 1000)
        )
        setSeconds(remaining)

        if (remaining === 0) {
          goToBookings()
        } else {
          checkStatus() // check payment status right away
        }
      }
      appState.current = nextState
    })

    return () => sub.remove()
  }, [paymentRequestId])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <View className="flex-1 bg-blue-50 items-center justify-center px-6">
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        Complete Your Payment
      </Text>

      <Text className="text-7xl font-extrabold text-primary mb-3">
        {minutes}:{secs < 10 ? `0${secs}` : secs}
      </Text>

      <Text className="text-gray-600 text-center mb-3">
        You have 5 minutes to complete your payment.
      </Text>

      {checking && <ActivityIndicator color="#0564BF" />}
    </View>
  )
}

export default Countdown