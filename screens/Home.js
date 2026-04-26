import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  Text,
  View,
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


const Home = () => {
  const navigation = useNavigation()

  const { products, setProducts } = useContext(ProductContext)
  const [loading, setLoading] = useState(true)
  const [promotions, setPromotions] = useState([])
  const [promoLoading, setPromoLoading] = useState(true)
  const screenWidth = Dimensions.get('window').width


  useEffect(() => {
    fetchProducts()
    fetchPromotions()
  }, [])

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
                          item.icon_url
                            ? { uri: item.icon_url }
                            : require('../assets/images/home_cleaning.webp')
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

        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
            Promos
          </Text>

          {promoLoading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : normalPromos.length === 0 ? (
            <Text style={{ padding: 10, color: '#777' }}>
              No promotions available
            </Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {normalPromos.map((promo) => (
                <TouchableOpacity
                  key={promo.id}
                  style={{
                    width: '100%',
                    height: 160,
                    marginBottom: 12,
                    borderRadius: 16,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    source={{ uri: promo.image_url }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="cover"
                  />

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      padding: 16,
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                        {promo.title}
                      </Text>

                      <Text style={{ color: '#fff', fontSize: 13, marginTop: 6 }}>
                        {promo.description}
                      </Text>

                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          fontWeight: 'bold',
                          marginTop: 10,
                        }}
                      >
                        Use Code {promo.promo_code}
                      </Text>
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
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
            Recent Bookings
          </Text>

          {/* {!products.length ? (
            <Text style={{ paddingHorizontal: 10, color: '#777' }}>
              No recent bookings yet
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 6 }}>

                {products.slice(0, 5).map((item) => {
                  const data = parseDescription(item)
                  if (!data) return null

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={{
                        width: 220,
                        height: 280,
                        borderRadius: 10,
                        overflow: 'hidden',
                        marginRight: 12,
                        backgroundColor: '#fff',
                        elevation: 4,
                      }}
                      onPress={() =>
                        navigation.navigate('PackageDetail', {
                          item,
                          parsed: data,
                        })
                      }
                    >


                      <View style={{ height: 170, overflow: 'hidden' }}>
                        
                        <Image
                          source={{ uri: item.view_images_url }}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                          }}
                          resizeMode="cover"
                        />

                        <LinearGradient
                          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                          style={{
                            flex: 1,
                            justifyContent: 'flex-end',
                            padding: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: '#fff',
                              fontWeight: 'bold',
                              fontSize: 13,
                            }}
                            numberOfLines={2}
                          >
                            {data.package_name}
                          </Text>
                        </LinearGradient>
                      </View>

                     
                      <View
                        style={{
                          flex: 1,
                          padding: 10,
                          justifyContent: 'space-between',
                          
                        }}
                      >
                        <Text className='text-sm ml-3 color-gray-600'>
                          Tuesday 20th April
                        </Text>
                        <Text className='text-sm ml-3 color-gray-600'>
                          Tuesday 20th April
                        </Text>
                         <Text className='text-sm ml-3 color-gray-600'>
                          Tuesday 20th April
                        </Text>


                      </View>

                    </TouchableOpacity>
                  )
                })}

              </View>
            </ScrollView>
          )} */}

       <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        marginHorizontal: 16,
        marginTop: 10,
      }}
    >
      {/* LEFT RED STRIP */}
      <View
        style={{
          width: 6,
          backgroundColor: 'indianred',
        }}
      />

      {/* CONTENT */}
      <View style={{ flex: 1, padding: 12 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'indianred',
          }}
        >
          
        </Text>

        
        <Text
        className='text-lg'
        >
         Oh! No!
        </Text>

        <Text
          style={{
            color: '#666',
            marginTop: 4,
            fontSize: 13,
          }}
        >
         You should login before booking.
        </Text>
      </View>

     
    </View>
        </View>
        {/* ================= REFER & EARN ================= */}
        {referPromo && (
          <View style={{ marginHorizontal: 16, marginTop: 20, marginBottom: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
              Refer & Earn
            </Text>

            <TouchableOpacity
              style={{
                height: 160,
                borderRadius: 16,
                overflow: 'hidden',
              }}
              onPress={() => navigation.navigate('Refer')}
            >
              <Image
                source={{ uri: referPromo.image_url }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="cover"
              />

              <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: 16,
                justifyContent: 'space-between',
              }}>
                <View>
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                    {referPromo.title}
                  </Text>

                  <Text style={{ color: '#fff', fontSize: 13, marginTop: 6 }}>
                    {referPromo.description}
                  </Text>
                </View>

                <View style={{
                  backgroundColor: '#fff',
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{ color: '#6C63FF', fontWeight: 'bold' }}>
                    Refer Now
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

export default Home

