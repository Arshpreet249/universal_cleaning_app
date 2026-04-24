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

const Home = () => {
  const navigation = useNavigation()
  // const [products, setProducts] = useState([])
  const { products, setProducts } = useContext(ProductContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
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

  const parseDescription = (item) => {
    try {
      return JSON.parse(item.description)
    } catch {
      return null
    }
  }

  return (
    <View style={{ flex: 1, paddingBottom: 40 }}>

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

          {/* Banner 1 */}
          <TouchableOpacity
            style={{
              height: 160,
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <Image
              source={require('../assets/images/banner.webp')}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
              }}
              resizeMode="cover"
            />

            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: 16,
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                Special Offer 🎉
              </Text>

              <Text style={{ color: '#fff', fontSize: 14, marginTop: 6 }}>
                Get up to 50% OFF on Home Services
              </Text>
            </View>
          </TouchableOpacity>

          {/* Banner 2 */}
          <TouchableOpacity
            style={{
              height: 140,
              borderRadius: 16,
              overflow: 'hidden',
              flexDirection: 'row',
              backgroundColor: '#fff',
              elevation: 3,
            }}
          >
            <View style={{ flex: 1, padding: 14, justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                Cleaning Services
              </Text>

              <Text style={{ fontSize: 13, marginTop: 4 }}>
                Flat ₹199 OFF on first booking
              </Text>
            </View>

            <Image
              source={require('../assets/images/home_cleaning.webp')}
              style={{ width: 120, height: '100%' }}
            />
          </TouchableOpacity>
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

                {products.slice(0, 4).map((item) => {   // ✅ only 4 items
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
                        // padding: 12,
                        flexDirection: "row",
                        alignItems: 'center',
                      }}
                      onPress={() =>
                        navigation.navigate('PackageDetail', {   // ✅ FIXED
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
                        style={{
                          width: '50%',
                          height: '100%',
                          borderRadius: 8,
                          // backgroundColor: '#e9ecef'
                        }}
                      />

                      <Text
                        style={{
                          fontSize: 13,
                          marginLeft: 10,
                          flex: 1,
                          fontWeight: 'bold'
                        }}
                        numberOfLines={3}
                      >
                        {data.package_name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}

              </View>
            </ScrollView>
          )}
        </View>
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
            Recent Bookings
          </Text>

          {!products.length ? (
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

                      {/* TOP DESIGN */}

                      <View style={{ height: 170, overflow: 'hidden' }}>
                        {/* API IMAGE */}
                        <Image
                          source={
                            item.icon_url
                              ? { uri: item.icon_url }
                              : require('../assets/images/home_cleaning.webp')
                          }
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                          }}
                          resizeMode="cover"
                        />

                        {/* DARK OVERLAY */}
                        <LinearGradient
                          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                          style={{
                            flex: 1,
                            justifyContent: 'flex-end',
                            padding: 10,
                          }}
                        >
                          {/* TITLE */}
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

                      {/* BOTTOM */}
                      <View
                        style={{
                          flex: 1,
                          padding: 10,
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#666', marginLeft: 10}}>
                          Tuesday 20th April
                        </Text>
                         <Text style={{ fontSize: 12, color: '#666', marginLeft: 10 }}>
                          Tuesday 20th April
                        </Text>
                         <Text style={{ fontSize: 12, color: '#666',marginLeft: 10 }}>
                          Tuesday 20th April
                        </Text>

                        
                      </View>

                    </TouchableOpacity>
                  )
                })}

              </View>
            </ScrollView>
          )}
        </View>
        {/* ================= REFER & EARN ================= */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
            Refer & Earn
          </Text>

          <TouchableOpacity
            style={{
              height: 150,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#6C63FF',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
            }}
            onPress={() => navigation.navigate('Refer')}
          >
            {/* LEFT TEXT */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                Invite Friends 🎁
              </Text>

              <Text style={{ color: '#fff', fontSize: 13, marginTop: 6 }}>
                Earn ₹100 for every referral
              </Text>

              <View
                style={{
                  marginTop: 10,
                  backgroundColor: '#fff',
                  alignSelf: 'flex-start',
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: '#6C63FF', fontSize: 12 }}>
                  Refer Now
                </Text>
              </View>
            </View>

            {/* RIGHT IMAGE */}

          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

export default Home

