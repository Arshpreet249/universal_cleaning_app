import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  Text,
  View,
  Share,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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

const Home = () => {
  const navigation = useNavigation()
  const { token, user } = useContext(AuthContext)

  const { products, setProducts } = useContext(ProductContext)
  const [loading, setLoading] = useState(true)
  const [promotions, setPromotions] = useState([])
  const [promoLoading, setPromoLoading] = useState(true)
  const screenWidth = Dimensions.get('window').width
  const [recentBookings, setRecentBookings] = useState([])


  useEffect(() => {
    fetchProducts()
    fetchPromotions()
    fetchrecentBookings()
  }, [])


   const fetchrecentBookings = async () => {
    try {
      // setLoading(true)

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
            console.log('Recent Bookings:', data)
            setRecentBookings(Array.isArray(data) ? data : [])

    } catch (error) {
      console.log('API ERROR:', error.message)
    } 
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${apiBaseUrl}get-products/`)
      setProducts(res.data || [])
      // console.log(res.data)

    } catch (error) {
      console.log('API ERROR:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPromotions = async () => {
    try {
      setPromoLoading(true)
      const res = await axios.get(`${apiBaseUrl}get-poromotios/`)
      setPromotions(res.data || [])
      // console.log("res>>>>>>>>>>",res)
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
      text.includes('refer') ||
      text.includes('invite') ||
      text.includes('earn')
    )
  }

  const referPromo = promotions.find(isRefer)
  const normalPromos = promotions.filter(p => !isRefer(p))



  const parseDescription = (item) => {
    try {
      return JSON.parse(item.description)
    } catch {
      return null
    }
  }

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

      <ScrollView>
        <Navbar />

        {/* ================= HIGHLIGHTS ================= */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
              Highlights
            </Text>
            <Image
              source={require('../assets/gif/dot.gif')}
              style={{ width: 40, height: 40 }}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="blue" />
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
                        {data.package_name.toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
            </View>
          )}
        </View>


        {/* ================= PROMOS ================= */}

        <View className="mx-4 mt-5">

          <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
            Promos
          </Text>

          {promoLoading ? (
            <ActivityIndicator size="large" color="blue" />
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
            <ActivityIndicator size="large" color="blue" />
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
        <View style={{ marginHorizontal: 10, marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
            Recent Bookings
          </Text>

       
            { token ? (
               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
                
                {recentBookings.slice(0, 5).map((item) => (
                  
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      backgroundColor: '#fff',
                      width: 300,
                      minHeight: 160,
                      marginRight: 12,
                      borderRadius: 16,
                      padding: 16,
                      justifyContent: 'center',
                    }}
                  >

                    {/* Title */}
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#111',
                      }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>

                    {/* Start From */}
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#666',
                        marginTop: 10,
                      }}
                    >
                      Start: {new Date(item.start_from).toLocaleString()}
                    </Text>

                    {/* Process */}
                    <View
                      style={{
                        marginTop: 14,
                        alignSelf: 'flex-start',
                        backgroundColor: '#ffe5e5',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          color: '#ff3b30',
                          fontWeight: '600',
                          fontSize: 12,
                        }}
                      >
                        {item.process}
                      </Text>
                    </View>

                  </TouchableOpacity>

                ))}

              </View>
            </ScrollView>
            ):(

                 <View
            style={{
              flexDirection: 'row',
              // backgroundColor: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              elevation: 6,
              marginHorizontal: 10,
              marginTop: 10,
            }}
          >

            <View className="flex-1 ">


              <View className="flex-1 px-4 py-6 items-center justify-center">

                <Text className="text-2xl font-bold text-red-500 mb-2">
                  Oh! No!
                </Text>

                <Text className="text-gray-500 text-sm text-center mb-6">
                  You should login before booking.
                </Text>

                <TouchableOpacity
                  className="bg-red-500 px-6 py-3 rounded-xl shadow-md"
                  onPress={() => navigation.navigate('Auth')}
                >
                  <Text className="text-white font-semibold text-base">
                    Login Now
                  </Text>
                </TouchableOpacity>

              </View>

            </View>
          </View>
            )
            }



        </View>

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
                      HRAHIDNO63
                    </Text>
                  </View>

                </View>
              </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  )
}

export default Home

