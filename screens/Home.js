import React, { useState, useCallback, useRef } from 'react'
import {
  ScrollView,
  Text,
  View,
  Share,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  Animated,
  PanResponder,
} from 'react-native'
import Navbar from '../components/Navbar'
import axios from 'axios'
import { apiBaseUrl } from '../components/variable'
import { useNavigation } from '@react-navigation/native'
import { useContext } from 'react'
import { ProductContext } from '../context/ProductContext'
import { LinearGradient } from 'expo-linear-gradient'
import { Dimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { AuthContext } from '../context/AuthContext'
import { useFocusEffect } from '@react-navigation/native'


const Home = () => {
  const navigation = useNavigation()
  const { token, user } = useContext(AuthContext)
  const userId = user?.id || user?.user?.id

  const { products, setProducts, searchText, filteredProducts } = useContext(ProductContext)
  const productsLoadedRef = useRef(false)
  const promotionsLoadedRef = useRef(false)


  const displayProducts =
    searchText?.trim()?.length > 0 ? filteredProducts : products

  const [loading, setLoading] = useState(true)
  const [promotions, setPromotions] = useState([])
  const [promoLoading, setPromoLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  const [recentBookings, setRecentBookings] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [upcomingAlert, setUpcomingAlert] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const bookingSheetTranslateY = useRef(new Animated.Value(0)).current
  const bookingSheetDragY = useRef(0)
  const bookingSheetClosing = useRef(false)

  // useEffect(() => {
  //   fetchProducts()
  //   fetchPromotions()
  //   fetchrecentBookings()
  // }, [])

  useFocusEffect(
    useCallback(() => {
      fetchProducts()
      fetchPromotions()
      if (token && userId) fetchrecentBookings()
    }, [token, userId])
  )

  const refreshHome = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchProducts(),
        fetchPromotions(),
        token && userId ? fetchrecentBookings() : Promise.resolve(),
      ])
    } finally {
      setRefreshing(false)
    }
  }

 

  const checkUpcomingBookings = (bookings, transactions = []) => {
    // 
    le.log('DEBUG bookings received:', bookings?.length, 'transactions received:', transactions?.length)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // console.log('DEBUG today is:', today.toString())

    // ✅ Build a quick lookup: transaction id -> transaction status
    const transactionStatusById = {}
    transactions.forEach((t) => {
      transactionStatusById[t.id] = (t?.status || '').toLowerCase()
    })
    // console.log('DEBUG transactionStatusById:', JSON.stringify(transactionStatusById))

    // ✅ Only consider bookings whose linked transaction succeeded
    const paidBookings = bookings.filter((item) => {
      const txStatus = transactionStatusById[item?.transaction_id]
      return txStatus === 'succeeded'
    })
    console.log('DEBUG paidBookings:', JSON.stringify(paidBookings))

    // ✅ Check if any of them fall exactly on today
    const todayBooking = paidBookings.find((item) => {
      if (!item?.start_from) return false

      const bookingDate = new Date(item.start_from)
      bookingDate.setHours(0, 0, 0, 0)

      return bookingDate.getTime() === today.getTime()
    })
    console.log('DEBUG todayBooking found:', JSON.stringify(todayBooking))

    if (todayBooking) {
      setUpcomingAlert({ ...todayBooking, isToday: true })
      return
    }

    // ✅ Otherwise, find the next one within the next 2 days
    const upcoming = paidBookings.find((item) => {
      if (!item?.start_from) return false

      const bookingDate = new Date(item.start_from)
      bookingDate.setHours(0, 0, 0, 0)

      const diffDays = Math.ceil(
        (bookingDate - today) / (1000 * 60 * 60 * 24)
      )

      return diffDays > 0 && diffDays <= 2
    })
    console.log('DEBUG upcoming found:', JSON.stringify(upcoming))

    setUpcomingAlert(upcoming ? { ...upcoming, isToday: false } : null)
  }

  const fetchrecentBookings = async () => {
    if (!token || !userId) return

    try {
      // setLoading(true)

      const response = await fetch(`${apiBaseUrl}all-appointments/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      })

      const data = await response.json()
      console.log('Recent Bookings:', data)
      // setRecentBookings(Array.isArray(data?.appointments) ? data.appointments : [])

      const bookings = Array.isArray(data?.appointments)
        ? data.appointments
        : []

      const transactions = Array.isArray(data?.transactions)
        ? data.transactions
        : []


      setRecentBookings(bookings)
      setRecentTransactions(transactions)
      checkUpcomingBookings(bookings, transactions)

    } catch (error) {
      console.log('API ERROR:', error.message)
    }
  }

  const fetchProducts = async () => {
    try {
      if (!productsLoadedRef.current) setLoading(true)
      const res = await axios.get(`${apiBaseUrl}get-products/`)
      setProducts(res.data || [])
      productsLoadedRef.current = true
      // console.log(res.data)

    } catch (error) {
      console.log('API ERROR:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPromotions = async () => {
    try {
      if (!promotionsLoadedRef.current) setPromoLoading(true)
      const res = await axios.get(`${apiBaseUrl}get-poromotios/`)
      setPromotions(res.data || [])
      promotionsLoadedRef.current = true
      // console.log("res>>>>>>>>>>", res)
    } catch (error) {
      console.log('PROMO API ERROR:', error.message)
    } finally {
      setPromoLoading(false)
    }
  }

  // ================= REFER LOGIC =================
  const isRefer = (p) => {
    const text = (p?.title || '').toLowerCase()
    return (
      text.includes('reffer') ||
      text.includes('invite') ||
      text.includes('earn')
    )
  }

  const referPromo = promotions.find(isRefer)
  const normalPromos = promotions.filter(p => !isRefer(p))

  const SkeletonBox = ({ style }) => (
    <View
      style={[
        {
          backgroundColor: 'rgba(226,232,240,0.95)',
          borderRadius: 12,
          overflow: 'hidden',
        },
        style,
      ]}
    />
  )

  const HighlightSkeleton = () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
        <View
          key={item}
          style={{
            backgroundColor: 'rgba(255,255,255,0.86)',
            marginBottom: 16,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            width: '24%',
          }}
        >
          <SkeletonBox style={{ width: 40, height: 40, borderRadius: 20 }} />
          <SkeletonBox style={{ width: '86%', height: 10, marginTop: 10 }} />
          <SkeletonBox style={{ width: '60%', height: 10, marginTop: 5 }} />
        </View>
      ))}
    </View>
  )

  const PromoSkeleton = () => (
    <View style={{ marginHorizontal: 0 }}>
      {[0, 1].map((item) => (
        <View
          key={item}
          style={{
            height: 160,
            marginBottom: 12,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.9)',
            overflow: 'hidden',
            padding: 16,
            justifyContent: 'space-between',
          }}
        >
          <View>
            <SkeletonBox style={{ width: '54%', height: 18 }} />
            <SkeletonBox style={{ width: '82%', height: 11, marginTop: 10 }} />
            <SkeletonBox style={{ width: '60%', height: 11, marginTop: 7 }} />
          </View>
          <SkeletonBox style={{ width: 120, height: 34, borderRadius: 12 }} />
        </View>
      ))}
    </View>
  )

  const ExploreSkeleton = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
        {[0, 1].map((item) => (
          <View
            key={item}
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              width: 300,
              height: 150,
              marginRight: 12,
              borderRadius: 12,
              flexDirection: 'row',
              overflow: 'hidden',
            }}
          >
            <SkeletonBox style={{ width: '50%', height: '100%', borderRadius: 0 }} />
            <View style={{ flex: 1, paddingHorizontal: 10, justifyContent: 'center' }}>
              <SkeletonBox style={{ width: '88%', height: 14 }} />
              <SkeletonBox style={{ width: '66%', height: 14, marginTop: 7 }} />
              <SkeletonBox style={{ width: '92%', height: 10, marginTop: 14 }} />
              <SkeletonBox style={{ width: '76%', height: 10, marginTop: 7 }} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )

  const certificates = [
    {
      title: 'bizSAFE Level 3',
      subtitle: 'Workplace safety',
      icon: require('../assets/images/bizsafe3.jpeg'),
    },
    {
      title: 'SME 500',
      subtitle: 'Business excellence',
      icon: require('../assets/images/sme500.png'),
    },
    {
      title: 'NEA Licensed',
      subtitle: 'Approved cleaning',
      icon: require('../assets/images/nea.png'),
    },
    {
      title: 'Trusted Service',
      subtitle: 'Quality assured',
      icon: require('../assets/images/ts.png'),
    },
  ]

  const certificateCardWidth = (screenWidth - 76) / 2

  const trustSections = [
    {
      title: 'Safety & Compliance',
      accent: '#0564BF',
      items: [
        'BizSAFE Level 3 Certified (WSH Council Singapore)',
        'NEA Certified Cleaning Service Provider',
        'WICA & Public Liability Fully Insured',
      ],
    },
    {
      title: 'Business Recognition',
      accent: '#12B76A',
      items: [
        'SME 500 Award Winner (2025)',
        'Recognised for quality & trusted service standards',
      ],
    },
    {
      title: 'Professional Standards',
      accent: '#F79009',
      items: [
        'TADF Compliant Operations',
        'WageMark Plus Certified',
        'FMO2 Certified Workforce',
      ],
    },
  ]


  const parseDescription = (item) => {
    try {
      return JSON.parse(item.description)
    } catch {
      return null
    }
  }

  const getStatusColor = (process) => {
    switch ((process || '').toLowerCase()) {
      case 'completed':
        return '#2a9d8f'
      case 'cancelled':
        return '#e63946'
      case 'assigned':
        return '#0564BF'
      case 'initiated':
      case 'pending':
        return '#f4a261'
      default:
        return '#6B7280'
    }
  }

  const getBookingTimestamp = (item) => {
    const time = new Date(item?.start_from || 0).getTime()
    return Number.isNaN(time) ? 0 : time
  }

  const formatBookingDateTime = (dateValue) => {
    if (!dateValue) return 'Not available'

    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return 'Not available'

    return date.toLocaleString('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const latestRecentBookings = [...(recentBookings || [])]
    .sort((a, b) => getBookingTimestamp(b) - getBookingTimestamp(a))
    .slice(0, 4)

  const getBookingTransaction = (booking) => {
    if (!booking?.transaction_id) return null
    return recentTransactions.find((transaction) => transaction.id === booking.transaction_id) || null
  }

  const openBookingModal = (booking) => {
    bookingSheetClosing.current = false
    bookingSheetDragY.current = 0
    bookingSheetTranslateY.setValue(0)
    setSelectedBooking(booking)
  }

  const closeBookingModal = () => {
    if (bookingSheetClosing.current) return

    bookingSheetClosing.current = true
    const currentDrag = bookingSheetDragY.current
    const remainingDistance = Math.max(screenHeight - currentDrag, 0)
    const duration = Math.min(Math.max(remainingDistance * 0.75, 260), 560)

    Animated.timing(bookingSheetTranslateY, {
      toValue: screenHeight,
      duration,
      useNativeDriver: false,
    }).start(() => {
      setSelectedBooking(null)
      setTimeout(() => {
        bookingSheetDragY.current = 0
        bookingSheetClosing.current = false
        bookingSheetTranslateY.setValue(0)
      }, 0)
    })
  }

  const bookingSheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 1,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => Math.abs(gestureState.dy) > 1,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gestureState) => {
        const nextY = Math.max(0, gestureState.dy)
        bookingSheetDragY.current = nextY
        bookingSheetTranslateY.setValue(nextY)
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.65) {
          closeBookingModal()
          return
        }

        bookingSheetDragY.current = 0
        Animated.spring(bookingSheetTranslateY, {
          toValue: 0,
          tension: 70,
          friction: 14,
          useNativeDriver: false,
        }).start()
      },
    })
  ).current

  const selectedBookingTransaction = getBookingTransaction(selectedBooking)
  const selectedBookingStatusColor = selectedBooking
    ? getStatusColor(selectedBooking.process)
    : '#6B7280'
  const selectedBookingAmount = selectedBookingTransaction?.final_amount || selectedBooking?.amount || '0.0000'
  const selectedBookingReference = selectedBookingTransaction?.reference_number || 'Not available'

  return (
    <View style={{ flex: 1, }}>

      {/* BACKGROUND */}
      <Image
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        source={require('../assets/images/background.jpg')}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshHome}
            colors={['#0564BF']}
            tintColor="#0564BF"
          />
        }
      >
        <Navbar />

        {searchText?.trim()?.length > 0 ? (

          // ✅ SEARCH RESULTS UI
          <View style={{ margin: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Search Results
            </Text>

            {filteredProducts.length === 0 ? (
              <Text style={{ color: '#666' }}>
                No services found for "{searchText}"
              </Text>
            ) : (
              filteredProducts.map((item) => {
                const data = parseDescription(item)
                if (!data) return null

                return (

                  <TouchableOpacity
                    key={item.id}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      marginBottom: 12,
                      flexDirection: 'row',
                      overflow: 'hidden',
                      elevation: 2
                    }}
                    onPress={() =>
                      navigation.navigate('PackageDetail', {
                        item,
                        parsed: data,
                      })
                    }
                  >
                    {/* ✅ IMAGE */}
                    <Image
                      source={{ uri: item.view_images_url }}
                      style={{
                        width: 150,
                        height: 150,
                      }}
                      resizeMode="cover"
                    />

                    {/* ✅ TEXT */}
                    <View style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 14,
                          color: '#111'
                        }}
                        numberOfLines={2}
                      >
                        {data.package_name}
                      </Text>

                      {/* Optional small info instead of full description */}
                      <Text
                        style={{
                          color: '#666',
                          marginTop: 4,
                          fontSize: 12
                        }}
                        numberOfLines={2}   // 👈 THIS TRUNCATES
                        ellipsizeMode="tail" // 👈 adds "..."
                      >
                        {data.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })
            )}
          </View>

        ) : (
          <>



            {/* ================= HIGHLIGHTS ================= */}
            <View style={{ marginHorizontal: 16, marginTop: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
                  Highlights
                </Text>

              </View>

              {loading ? (
                <HighlightSkeleton />
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                  }}
                >
                  {products
                    .filter((item) => item?.layout_style === 'high_light')
                    .map((item) => {
                      const data = parseDescription(item)
                      if (!data) return null

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={{
                            backgroundColor: 'white',
                            marginBottom: 16,
                            borderRadius: 12,
                            padding: 12,
                            alignItems: 'center',
                            width: '24%',
                          }}
                          onPress={() =>
                            navigation.navigate('PackageDetail', {
                              item,
                              parsed: data,
                            })
                          }
                        >
                          <Image
                            source={

                              { uri: item.icon_url }

                            }
                            style={{ width: 40, height: 40 }}
                          />

                          <Text
                            style={{
                              fontSize: 12,
                              textAlign: 'center',
                              marginTop: 8,
                            }}
                          >
                            {/* {data.package_name.toLowerCase()} */}
                            {data?.package_name?.toLowerCase()}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                </View>
              )}
            </View>

            {/* ================= UPCOMING ALERT ================= */}



            <View style={{ marginTop: 20 }}>

              {upcomingAlert && (
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    padding: 16,
                    margin: 10,
                    marginTop: 30,
                    borderRadius: 10,
                    position: 'relative',
                  }}
                >
                  {/* DATE BADGE */}
                  <View
                    style={{
                      position: 'absolute',
                      top: -28,
                      left: 15,
                      // backgroundColor: '#000',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: '#666', fontWeight: 'bold', fontSize: 30, fontWeight: '900', }}>
                      {new Date(upcomingAlert.start_from).getDate()}{" "}
                      {new Date(upcomingAlert.start_from).toLocaleString('default', {
                        month: 'short',
                      })}
                    </Text>
                  </View>

                  {/* ✅ HEADER ROW: Title + Status Badge */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', color: '#000' }}>
                      {upcomingAlert.isToday
                        ? "Today's Appointment"
                        : 'Upcoming Appointment'}
                    </Text>

                    {/* ✅ STATUS BADGE (only if completed) */}
                    {(upcomingAlert.process || '').toLowerCase() === 'completed' && (
                      <View
                        style={{
                          backgroundColor: getStatusColor(upcomingAlert.process),
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: '700',
                            textTransform: 'capitalize',
                          }}
                        >
                          {upcomingAlert.process}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={{ color: '#333', marginTop: 8 }}>
                    {upcomingAlert.title}
                  </Text>
                  <Text style={{ fontSize: 12, marginTop: 2 }}>
                    {new Date(upcomingAlert.start_from).toDateString()}
                  </Text>
                </View>
              )}

            </View>

            {/* ================= PROMOS ================= */}

            <View className="mx-4 mt-5">

              <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
                Promos
              </Text>

              {promoLoading ? (
                <PromoSkeleton />
              ) : normalPromos.length === 0 ? (
                <Text className="px-2 py-2 text-gray-500">
                  No promotions available
                </Text>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>

                  {normalPromos.map((promo) => (
                    <TouchableOpacity
                      key={promo.id}
                      className="w-full h-40 mb-3 rounded-2xl overflow-hidden"
                    >

                      {/* Background Image */}
                      <Image
                        source={{ uri: promo.image_url }}
                        className="absolute w-full h-full"
                        resizeMode="cover"
                      />

                      {/* Dark Overlay */}
                      <View className="flex-1 bg-black/30 p-4 justify-between">

                        <View>

                          <Text className="text-white text-lg font-bold">
                            {promo.title}
                          </Text>

                          <Text className="text-white text-xs mt-1 opacity-90">
                            {promo.description}
                          </Text>

                          {/* 🔥 GLASS PROMO CODE */}
                          <BlurView
                            intensity={40}
                            tint="light"
                            className="mt-4 self-start px-4 py-2 rounded-xl border border-white/30 overflow-hidden"
                          >
                            <Text className="text-white font-bold tracking-widest text-sm">
                              {promo.promo_code}
                            </Text>
                          </BlurView>

                        </View>

                      </View>

                    </TouchableOpacity>
                  ))}

                </ScrollView>
              )}

            </View>


            {/* ================= EXPLORE MORE ================= */}
            <View style={{ marginTop: 20 }}>

              {/* HEADER WITH SEE ALL */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    padding: 10,
                  }}
                >
                  Explore More...
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AllPackages', {
                      products: products, // pass all data
                    })
                  }
                >
                  <Text
                    style={{
                      color: '#6C63FF',
                      fontWeight: 'bold',
                      paddingRight: 10,
                    }}
                  >
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <ExploreSkeleton />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>

                    {products.slice(0, 4).map((item) => {
                      const data = parseDescription(item)
                      if (!data) return null

                      return (

                        <TouchableOpacity
                          key={item.id}
                          style={{
                            backgroundColor: '#fff',
                            width: 300,
                            height: 150,
                            marginRight: 12,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            overflow: 'hidden',
                          }}
                          onPress={() =>
                            navigation.navigate('PackageDetail', {
                              item,
                              parsed: data,
                            })
                          }
                        >
                          {/* IMAGE */}
                          <Image
                            source={{ uri: item.view_images_url }}
                            style={{
                              width: '50%',
                              height: '100%',
                              borderTopLeftRadius: 12,
                              borderBottomLeftRadius: 12,
                            }}
                          />

                          {/* TEXT SECTION */}
                          <View style={{ flex: 1, paddingHorizontal: 10, justifyContent: 'center' }}>

                            {/* TITLE */}
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: 'bold',
                                color: '#111',
                              }}
                              numberOfLines={2}
                            >
                              {data.package_name}
                            </Text>

                            {/* DESCRIPTION (NEW) */}
                            <Text
                              style={{
                                fontSize: 11,
                                color: '#666',
                                marginTop: 6,
                                lineHeight: 15,
                              }}
                              numberOfLines={3}
                            >
                              {data.description}
                            </Text>

                          </View>
                        </TouchableOpacity>
                      )
                    })}

                  </View>
                </ScrollView>
              )}
            </View>
            {/* ================= Recent Booking ================= */}

            {token && latestRecentBookings.length > 0 && (
              <View style={{ marginHorizontal: 16, marginTop: 24 }}>
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: '#EEF2F6',
                    padding: 14,
                    shadowColor: '#0f172a',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.06,
                    shadowRadius: 16,
                    elevation: 3,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1.1, color: '#0564BF' }}>
                        RECENT ACTIVITY
                      </Text>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: '#101828', marginTop: 2 }}>
                        Your Bookings
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 999,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: '#667085', fontWeight: '800' }}>
                        {latestRecentBookings.length} shown
                      </Text>
                    </View>
                  </View>

                  {latestRecentBookings.map((item, index) => {
                    const statusColor = getStatusColor(item.process)
                    const bookingDate = item.start_from ? new Date(item.start_from) : null
                    const dateDay = bookingDate ? bookingDate.getDate() : '--'
                    const dateMonth = bookingDate
                      ? bookingDate.toLocaleString('default', { month: 'short' })
                      : 'Date'
                    const fullDate = bookingDate ? bookingDate.toDateString() : 'Date not available'
                    const isLast = index === latestRecentBookings.length - 1

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.82}
                        onPress={() => openBookingModal(item)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 13,
                          borderTopWidth: index === 0 ? 0 : 1,
                          borderTopColor: '#F1F5F9',
                        }}
                      >
                        <View style={{ width: 48, alignItems: 'center', marginRight: 12 }}>
                          <View
                            style={{
                              width: 44,
                              height: 48,
                              borderRadius: 14,
                              backgroundColor: '#F8FAFC',
                              borderWidth: 1,
                              borderColor: '#E5E7EB',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#111827' }}>
                              {dateDay}
                            </Text>
                            <Text style={{ fontSize: 9, fontWeight: '800', color: '#667085', textTransform: 'uppercase' }}>
                              {dateMonth}
                            </Text>
                          </View>
                          {!isLast && (
                            <View
                              style={{
                                width: 1,
                                height: 16,
                                backgroundColor: '#E5E7EB',
                                marginTop: 8,
                                marginBottom: -8,
                              }}
                            />
                          )}
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <View
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: 7,
                                backgroundColor: statusColor,
                                marginRight: 7,
                              }}
                            />
                            <Text style={{ fontSize: 11, color: '#98A2B3', fontWeight: '700' }} numberOfLines={1}>
                              {fullDate}
                            </Text>
                          </View>

                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{ fontSize: 15, fontWeight: '800', color: '#111827' }}
                          >
                            {item.title || 'Cleaning booking'}
                          </Text>

                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{ fontSize: 12, color: '#667085', marginTop: 3 }}
                          >
                            {item.description || 'Tap to view booking details'}
                          </Text>
                        </View>

                        <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                          <View
                            style={{
                              backgroundColor: `${statusColor}14`,
                              paddingHorizontal: 9,
                              paddingVertical: 5,
                              borderRadius: 999,
                              marginBottom: 8,
                              maxWidth: 92,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: '800',
                                color: statusColor,
                                textTransform: 'capitalize',
                              }}
                              numberOfLines={1}
                            >
                              {item.process || 'Booking'}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 12, color: '#0564BF', fontWeight: '900' }}>
                            View
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            )}
            {/*  NOT LOGGED IN */}
            {!token && (
              <View
                style={{
                  borderRadius: 16,
                  marginHorizontal: 10,
                  marginTop: 20,
                  backgroundColor: '#fff',
                  padding: 20,
                  alignItems: 'center',
                }}
              >
                <Text className="text-2xl font-bold text-red-500 mb-2">
                  Oh! No!
                </Text>

                <Text className="text-gray-500 text-sm text-center mb-6">
                  You should login before booking.
                </Text>

                <TouchableOpacity
                  className="bg-red-500 px-6 py-3 rounded-xl"
                  onPress={() => navigation.navigate('Auth')}
                >
                  <Text className="text-white font-semibold text-base">
                    Login Now
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= REFER & EARN ================= */}

            {referPromo && (
              <View style={{ marginHorizontal: 16, marginTop: 20, marginBottom: 40 }}>

                {/* Title */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  Refer & Earn
                </Text>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={async () => {
                    try {
                      await Share.share({
                        message:
                          'Download this amazing app 🚀\n\nhttps://yourapp.link',
                      });
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  style={{
                    height: 170,
                    borderRadius: 18,
                    overflow: 'hidden',
                    elevation: 4,
                  }}
                >
                  {/* Background Image */}
                  <Image
                    source={{ uri: referPromo.image_url }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="cover"
                  />
                  <BlurView
                    intensity={70}
                    tint="light"
                    style={{
                      flex: 1,
                      // padding: 16,
                      margin: 15,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.7)',
                      borderRadius: 18,
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                    }}
                  >

                    {/* Overlay */}
                    <View
                      style={{
                        flex: 1,
                        // backgroundColor: 'rgba(0,0,0,0.35)',
                        padding: 16,
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Top Content */}
                      <View>
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                          {referPromo.title}
                        </Text>

                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 13,
                            marginTop: 6,
                            lineHeight: 18,
                          }}
                        >
                          {referPromo.description}
                        </Text>
                      </View>

                      {/* Bottom Section */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                        {/* Referral Code */}
                        <View
                          style={{
                            backgroundColor: '#fff',
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 10,
                          }}
                        >
                          <Text style={{ fontSize: 10, color: '#888' }}>
                            YOUR CODE
                          </Text>
                          <Text style={{ color: '#0564BF', fontWeight: 'bold', fontSize: 14 }}>
                            {/* HRAHIDNO63 */}
                            {user?.referral_code || user?.user?.referral_code || '---'}
                          </Text>
                        </View>

                      </View>

                     
                    </View>
                  </BlurView>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= WHY CHOOSE US ================= */}
            <View style={{ marginHorizontal: 16, marginTop: 30, marginBottom: 10 }}>

              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.94)',
                  borderRadius: 22,
                  paddingHorizontal: 16,
                  paddingTop: 18,
                  paddingBottom: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(5,100,191,0.08)',
                  shadowColor: '#0f172a',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.08,
                  shadowRadius: 18,
                  elevation: 4,
                }}
              >
                <View style={{ alignItems: 'center', marginBottom: 18 }}>
                  <View
                    style={{
                      backgroundColor: '#EAF4FF',
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 999,
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '800',
                        letterSpacing: 1.4,
                        color: '#0564BF',
                      }}
                    >
                      TRUSTED & VERIFIED
                    </Text>
                  </View>

                  <Text style={{ fontSize: 23, fontWeight: '800', color: '#101828', marginBottom: 7 }}>
                    Why choose us?
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#667085',
                      textAlign: 'center',
                      lineHeight: 20,
                      paddingHorizontal: 8,
                    }}
                  >
                    Recognised by leading Singapore authorities for safety, quality and excellence.
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    rowGap: 12,
                  }}
                >
                  {certificates.map((cert, index) => (
                    <View
                      key={index}
                      style={{
                        width: certificateCardWidth,
                        minHeight: 142,
                        borderRadius: 18,
                        backgroundColor: '#FFFFFF',
                        paddingVertical: 14,
                        paddingHorizontal: 10,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: '#EEF2F6',
                      }}
                    >
                      <View
                        style={{
                          width: 74,
                          height: 74,
                          borderRadius: 18,
                          backgroundColor: '#F8FAFC',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 10,
                        }}
                      >
                        <Image
                          source={cert.icon}
                          style={{ width: 58, height: 58 }}
                          resizeMode="contain"
                        />
                      </View>

                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '800',
                          color: '#111827',
                          textAlign: 'center',
                        }}
                        numberOfLines={1}
                      >
                        {cert.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: '#667085',
                          marginTop: 3,
                          textAlign: 'center',
                        }}
                        numberOfLines={1}
                      >
                        {cert.subtitle}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={{ marginTop: 18 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#101828', marginBottom: 12 }}>
                    Trust & Certifications
                  </Text>

                  {trustSections.map((section) => (
                    <View
                      key={section.title}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#EEF2F6',
                        padding: 14,
                        marginBottom: 10,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 8,
                            backgroundColor: section.accent,
                            marginRight: 8,
                          }}
                        />
                        <Text style={{ fontSize: 14, fontWeight: '900', color: '#111827' }}>
                          {section.title}
                        </Text>
                      </View>

                      {section.items.map((item) => (
                        <View key={item} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 7 }}>
                          <Text style={{ color: section.accent, fontSize: 13, lineHeight: 18, marginRight: 7 }}>
                            *
                          </Text>
                          <Text style={{ flex: 1, fontSize: 12, color: '#475467', lineHeight: 18 }}>
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>

            </View>

            <View style={{ height: 90 }} />
          </>
        )}

      </ScrollView>

      <Modal
        visible={!!selectedBooking}
        transparent
        animationType="none"
        onRequestClose={closeBookingModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeBookingModal}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />

          <Animated.View
            {...bookingSheetPanResponder.panHandlers}
            style={{
              transform: [{ translateY: bookingSheetTranslateY }],
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.12,
              shadowRadius: 18,
              elevation: 10,
            }}
          >
            <View
              style={{
                width: 44,
                height: 5,
                borderRadius: 999,
                backgroundColor: '#E5E7EB',
                alignSelf: 'center',
                marginBottom: 18,
              }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: 14 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: '#0564BF' }}>
                  BOOKING DETAILS
                </Text>
                <Text
                  style={{ fontSize: 21, fontWeight: '900', color: '#101828', marginTop: 4, lineHeight: 27 }}
                  numberOfLines={2}
                >
                  {selectedBooking?.title || 'Cleaning booking'}
                </Text>
              </View>


            </View>

            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: `${selectedBookingStatusColor}14`,
                paddingHorizontal: 11,
                paddingVertical: 6,
                borderRadius: 999,
                marginTop: 14,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '900',
                  color: selectedBookingStatusColor,
                  textTransform: 'capitalize',
                }}
              >
                {selectedBooking?.process || 'Booking'}
              </Text>
            </View>

            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 18, padding: 14 }}>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, color: '#98A2B3', fontWeight: '800', marginBottom: 4 }}>
                  DESCRIPTION
                </Text>
                <Text style={{ fontSize: 14, color: '#344054', lineHeight: 20 }}>
                  {selectedBooking?.description || 'No description available'}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: '#E5E7EB', marginBottom: 12 }} />

              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize: 11, color: '#98A2B3', fontWeight: '800', marginBottom: 4 }}>
                    START
                  </Text>
                  <Text style={{ fontSize: 13, color: '#111827', fontWeight: '700', lineHeight: 18 }}>
                    {formatBookingDateTime(selectedBooking?.start_from)}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#98A2B3', fontWeight: '800', marginBottom: 4 }}>
                    END
                  </Text>
                  <Text style={{ fontSize: 13, color: '#111827', fontWeight: '700', lineHeight: 18 }}>
                    {formatBookingDateTime(selectedBooking?.end_at)}
                  </Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: '#E5E7EB', marginBottom: 12 }} />

              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, color: '#98A2B3', fontWeight: '800', marginBottom: 4 }}>
                  ADDRESS
                </Text>
                <Text style={{ fontSize: 13, color: '#111827', fontWeight: '700', lineHeight: 18 }}>
                  {selectedBooking?.address || 'Address not available'}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: '#E5E7EB', marginBottom: 12 }} />

              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize: 11, color: '#98A2B3', fontWeight: '800', marginBottom: 4 }}>
                    AMOUNT
                  </Text>
                  <Text style={{ fontSize: 13, color: '#111827', fontWeight: '700' }}>
                    SGD {selectedBookingAmount}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#98A2B3', fontWeight: '800', marginBottom: 4 }}>
                    REFERENCE
                  </Text>
                  <Text style={{ fontSize: 13, color: '#111827', fontWeight: '700' }}>
                    {selectedBookingReference}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

export default Home

