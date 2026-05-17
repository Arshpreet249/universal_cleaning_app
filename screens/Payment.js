import React, { useContext, useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,

  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  TextInput,
  Platform,
} from 'react-native'
import { AuthContext } from '../context/AuthContext'
import { apiBaseUrl } from '../components/variable'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Linking } from 'react-native'

const Payment = ({ route, navigation }) => {

  const { token } = useContext(AuthContext)

  const {
    appointmentData,
    notes,
    selectedAddress,
    totalAmount,
  } = route.params || {}

  console.log("address", selectedAddress)

  // console.log("apointmentData in Payment::", appointmentData)

  const [loading, setLoading] = useState(false)
  // ================= COINS =================
  const [coins, setCoins] = useState(0)
  const [useCoins, setUseCoins] = useState(false)
  const [coinsLoading, setCoinsLoading] = useState(false)

  // ✅ COUPON STATES
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponDescription, setCouponDescription] = useState('')
  const [appliedCouponId, setAppliedCouponId] = useState(null)

  const [checkoutUrl, setCheckoutUrl] = useState(null)
  // ================= FETCH COINS =================
  const fetchCoins = async () => {
    setCoinsLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}get_user_coins/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()
      console.log(' Coins API:', data)

      if (res.status === 200) {

        setCoins(data?.data?.available_coins || 0)
      }
    } catch (err) {
      console.log('Coins error:', err)
    }
    setCoinsLoading(false)
  }
  useEffect(() => {
    fetchCoins()
  }, [])

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

  // ================= COINS LOGIC =================
  const coinValue = coins * 1 // 1 coin = $1

  const coinDiscount = useCoins
    ? Math.min(coinValue, (totalAmount || 0) + fee - discount)
    : 0



  // ✅ FINAL TOTAL
  const finalTotal = (totalAmount || 0) + fee - discount - coinDiscount


  // ================= APPLY COUPON =================
  const applyCoupon = async (codeParam) => {
    const codeToApply = codeParam || couponCode

    if (!codeToApply) {
      Alert.alert('Error', 'Enter coupon code')
      return
    }

    setCouponLoading(true)

    try {
      const res = await fetch(`${apiBaseUrl}get_coupen_codes/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promo_code: codeToApply,
        }),
      })
      console.log(' Apply Coupon Response ', res)

      const text = await res.text()
      console.log('RAW RESPONSE coupon:', text)

      let data
      try {
        data = JSON.parse(text)
      } catch {
        Alert.alert('Server Error', 'Invalid response')
        return
      }

      console.log('Parsed JSON:', data)

      if (res.status === 200) {

        const coupon = data.data

        if (!coupon) {
          Alert.alert('Error', 'Invalid coupon data')
          return
        }

        setAppliedCouponId(coupon.id || null)

        const minAmount = coupon.min_purchase_amount || 0

        if ((totalAmount || 0) < minAmount) {
          Alert.alert(
            'Not Eligible',
            `Minimum purchase should be $${minAmount}`
          )
          setDiscount(0)
          setAppliedCoupon(null)
          return
        }

        let discountValue = 0

        if (coupon.discount_amount) {
          discountValue = coupon.discount_amount
        } else if (coupon.discount_percentage) {
          discountValue =
            ((totalAmount || 0) * coupon.discount_percentage) / 100
        }

        if (discountValue > (totalAmount || 0)) {
          discountValue = totalAmount || 0
        }

        discountValue = parseFloat(discountValue.toFixed(2))

        console.log(' Discount Applied:', discountValue)

        setDiscount(discountValue)
        setAppliedCoupon(coupon.promo_code)
        setCouponDescription(coupon.description || '')
        setCouponCode(coupon.promo_code)

        // Alert.alert('Success', data.message || 'Coupon applied ')
      } else {
        setDiscount(0)
        setAppliedCoupon(null)
        Alert.alert('Invalid', data?.message || 'Coupon not valid')
      }
    } catch (error) {
      console.log(' Network Error:', error)
      Alert.alert('Error', 'Network issue')
    }

    setCouponLoading(false)
  }

  // ================= API =================
  const createAppointment = async () => {
    setLoading(true)

    const payload = {

      amount: totalAmount,
      discount: discount || 0,
      tax: fee,
      coins: useCoins ? coinDiscount : 0,
      coupen_number: appliedCoupon || '',
      coupen_id: appliedCouponId || null,
      booking_service_ids: appointmentData.flatMap(item => item.booking_ids || []),
      booking_address_id: selectedAddress?.id,

      data: appointmentData.map((item) => ({

        title: item.package_names?.join(', ') || '',
        address: selectedAddress.address,
        description: `Notes: ${notes || 'N/A'} | Packages: ${item.package_names?.join(', ') || 'None'}`,
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
    console.log('Payload for API:', JSON.stringify(payload, null, 2))

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
      console.log(' Create Appointment Response:', result)

      if (res.status === 200 || res.status === 201) {
        // Alert.alert('Success', 'Appointment Created')

        // const checkoutUrl = result?.data?.checkout_url
        let url = result?.data?.checkout_url
        if (!url && result?.data?.detail === "Transaction already exists") {
          if (checkoutUrl) {
            navigation.navigate('Countdown', { checkoutUrl })
            return
          } else {
            Alert.alert("Error", "Payment already exists but no URL found")
            return
          }
        }
        if (url) {
          setCheckoutUrl(url)

          navigation.navigate('Countdown', {
            checkoutUrl: url
          })
        }


      } else {
        Alert.alert('Failed', result?.message || 'Error')
      }
    } catch (err) {
      console.log('FULL ERROR:', err)
      Alert.alert('Error', 'Something went wrong')
    }

    setLoading(false)
  }

  // ================= ICON =================
  const Icon = ({ name }) => (
    <Ionicons name={name} size={18} color="#25B7FD" />
  )

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 120,
          }} >

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

              <View className="flex-row items-center mb-3">
                <Icon name="calendar-outline" />
                <Text className="ml-2 font-bold text-gray-900">
                  Appointment {index + 1}
                </Text>
              </View>

              <View className="flex-row items-start mb-2">
                <Icon name="cube-outline" />
                <Text className="ml-2 text-gray-800 font-medium flex-1">
                  {item.package_names?.join(', ')}
                </Text>
              </View>

              <View className="flex-row items-center mb-2">
                <Icon name="calendar-outline" />
                <Text className="ml-2 text-gray-500">
                  {item.start_date}
                </Text>
              </View>

              <View className="flex-row items-center mb-2">
                <Icon name="time-outline" />
                <Text className="ml-2 text-gray-500">
                  {item.startTime} - {item.endTime}
                </Text>
              </View>

              <View className="flex-row items-center mb-2">
                <Icon name="person-circle-outline" />
                <Text className="ml-2 text-gray-500">
                  #{item.assigned_to_usernames?.join(', ') || ''}
                </Text>
              </View>

              <View className="flex-row items-start mt-2">
                <Icon name="document-text-outline" />
                <Text className="ml-2 text-gray-400 flex-1">
                  {notes || ''}
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

          {/* COINS */}
          <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-primary mb-2">
              🪙 Wallet Coins
            </Text>

            {coinsLoading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text className="text-gray-700 mb-2">
                  Available Coins: {coins}
                </Text>

                <TouchableOpacity
                  onPress={() => setUseCoins(!useCoins)}
                  className={`p-3 rounded-xl bg-secondary }`}
                >
                  <Text className="text-white text-center font-semibold">
                    {useCoins ? 'Coins Applied' : 'Use Coins'}
                  </Text>
                </TouchableOpacity>


              </>
            )}
          </View>


          {/* APPLY COUPONS */}
          <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-primary">
              🎟️ Apply Coupon
            </Text>

            <View className="flex-row items-center">
              <TextInput
                value={couponCode}
                // onChangeText={setCouponCode}
                onChangeText={(text) => setCouponCode(text.toUpperCase())}
                placeholder="Enter coupon code"
                placeholderTextColor="#9ca3af"
                autoCapitalize='characters'
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-800"
              />

              <TouchableOpacity
                onPress={() => applyCoupon()}
                className="ml-3 bg-secondary px-4 py-3 rounded-xl"
              >
                {couponLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">Apply</Text>
                )}
              </TouchableOpacity>
            </View>

            {appliedCoupon && (
              <View className="mt-2">
                <Text className="text-green-600 font-semibold">
                  {appliedCoupon} - {couponDescription}
                </Text>
              </View>
            )}

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

            {discount > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Discount</Text>
                <Text className="text-green-600">-${discount}</Text>
              </View>
            )}

            {coinDiscount > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Coins</Text>
                <Text className="text-green-600">-${coinDiscount}</Text>
              </View>
            )}
            <View className="border-t border-gray-200 mt-3 pt-3 flex-row justify-between">
              <Text className="font-bold text-lg">Total</Text>
              <Text className="font-bold text-lg text-green-600">
                ${finalTotal.toFixed(2)}
              </Text>
            </View>
          </View>

        </ScrollView>

        {/* BUTTON */}
        <View className="p-4 bg-white border-t border-gray-200"
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          }}>
          <TouchableOpacity
            // onPress={createAppointment}
            // disabled={loading}
            onPress={() => {
              if (!loading) createAppointment()
            }}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Payment