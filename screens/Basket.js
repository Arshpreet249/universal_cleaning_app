import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Platform
} from 'react-native'

import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL } from '../components/variable'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

const Basket = () => {
  const { token, setCartCount, setBasketItems } = useContext(AuthContext)

  const [cartData, setCartData] = useState([])
  const [loading, setLoading] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const navigation = useNavigation()

  // ---------------- FETCH CART ----------------
  const fetchCart = async () => {
    if (!token) return

    setLoading(true)

    try {
      const res = await fetch(
        `${REACT_APP_HOST_API_URL}/api/booking/list/`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const text = await res.text()
      const data = JSON.parse(text)

      if (data.status === 200) {
        const cleanedData = data.data.map(item => {
          let details = {}

          try {
            details = item.note ? JSON.parse(item.note) : {}
          } catch (e) { }

          const metaEntries = Object.entries(details).filter(
            ([key]) =>
              ![
                'service',
                'price',
                'quantity',
                'totalPrice',
                'total',
                'package_id',
                'rowIndex',
              ].includes(key)
          )

          return {
            ...item,
            details,
            displayName: details.service || 'Service',
            displayMeta: metaEntries.map(([key, value]) => ({
              key,
              value,
            })),
            displayPrice: details.price || item.price || 0,
            displayTotal:
              details.totalPrice ||
              details.total ||
              (details.price || item.price || 0) *
              (details.quantity || 1),
          }
        })

        setCartData(cleanedData)
        setBasketItems(cleanedData)
        setCartCount(data.cart_count || cleanedData.length)
      }
    } catch (err) {
      console.log(err)
      Alert.alert('Error', 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchCart()
  }, [token])

  // ---------------- DELETE ----------------
  const confirmDelete = async () => {
    if (!selectedId || !token) return

    try {
      const res = await fetch(
        `${REACT_APP_HOST_API_URL}/api/booking/${selectedId}/delete/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (data.status === 200) {
        const updatedCart = cartData.filter(item => item.id !== selectedId)
        setCartData(updatedCart)
        setBasketItems(updatedCart)
        setCartCount(updatedCart.length)

        setShowDeleteModal(false)
        setSelectedId(null)
      } else {
        Alert.alert('Error', 'Failed to delete item')
      }
    } catch (err) {
      console.log(err)
      Alert.alert('Error', 'Something went wrong')
    }
  }

  // ---------------- TOTAL ----------------
  const total = cartData.reduce((sum, item) => {
    return sum + (item.displayTotal || 0)
  }, 0)

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const isCartEmpty = cartData.length === 0

  return (
    <SafeAreaView className="flex-1 bg-blue-50 ">
      <View className="flex-1 px-4 ">

        {/* HEADER */}
        <View className="mt-4 mb-4 p-5 rounded-2xl bg-primary shadow">
          <Text className="text-white text-center text-xl font-bold">
            My Basket
          </Text>
          <Text className="text-white/80 text-center text-sm mt-1">
            Review your selected services ✨
          </Text>
        </View>

        {!token ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-center">
              Please login to view your basket
            </Text>
          </View>
        ) : (
          <>
            {/* LIST */}
            <FlatList
              data={cartData}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: Platform.OS === 'ios' ? 110 : 80,
              }}
              renderItem={({ item }) => (
                <View className="bg-white p-4 rounded-2xl mb-3 border border-blue-100 shadow-sm">

                  <View className="flex-row justify-between">

                    {/* LEFT */}
                    <View className="flex-1 pr-3">
                      <Text className="text-primary font-bold text-base">
                        {item.displayName}
                      </Text>

                      {item.displayMeta?.length > 0 && (
                        <View className="mt-1">
                          {item.displayMeta.map((meta, i) => (
                            <View key={i} className="flex-row">
                              <Text className="text-gray-500 capitalize">
                                {meta.key}:
                              </Text>
                              <Text className="ml-2 text-gray-700">
                                {meta.value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <Text className="text-secondary font-bold mt-2">
                        price: ${item.displayTotal}
                      </Text>
                    </View>

                    {/* REMOVE */}
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedId(item.id)
                        setShowDeleteModal(true)
                      }}
                      className="bg-red-100 px-3 py-2 rounded-xl self-start"
                    >
                      <Text className="text-red-600 font-semibold text-xs">
                        Remove
                      </Text>
                    </TouchableOpacity>

                  </View>

                </View>
              )}
              ListEmptyComponent={
                <View className="items-center mt-20">
                  <Text className="text-gray-400 text-base">
                    Your basket is empty 🛒
                  </Text>
                </View>
              }
            />

            {/* FOOTER */}
            <View
              // className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-blue-100 flex-row justify-between items-center">
              style={{
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 45 : 65,
                left: 0,
                right: 0,
              }}
              className="bg-white px-5 py-4 border-t border-blue-100 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-gray-500 text-xs">Total</Text>
                <Text className="text-xl font-bold text-primary">
                  $ {total}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (!isCartEmpty) {
                    navigation.navigate('BookAppointment', {
                      appointmentData: cartData,
                      totalAmount: total,
                    })
                  }
                }}
                disabled={isCartEmpty}
                className={`px-6 py-3 rounded-xl ${isCartEmpty ? 'bg-gray-300' : 'bg-primary'
                  }`}
              >
                <Text className="text-white font-semibold">
                  Proceed
                </Text>
              </TouchableOpacity>

            </View>
          </>
        )}

        {/* DELETE MODAL */}
        <Modal transparent visible={showDeleteModal} animationType="fade">
          <View className="flex-1 bg-black/40 justify-center items-center px-6">

            <View className="w-full bg-white rounded-3xl p-6">

              <View className="items-center mb-3">
                <View className="bg-red-100 p-4 rounded-full">
                  <Text className="text-2xl">🗑️</Text>
                </View>
              </View>

              <Text className="text-lg font-bold text-center mb-2">
                Remove Item?
              </Text>

              <Text className="text-gray-500 text-center mb-5">
                This item will be removed from your basket.
              </Text>

              <View className="flex-row gap-3">

                <TouchableOpacity
                  onPress={() => {
                    setShowDeleteModal(false)
                    setSelectedId(null)
                  }}
                  className="flex-1 border border-gray-300 py-3 rounded-xl"
                >
                  <Text className="text-center font-semibold text-gray-600">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmDelete}
                  className="flex-1 bg-red-500 py-3 rounded-xl"
                >
                  <Text className="text-center font-semibold text-white">
                    Delete
                  </Text>
                </TouchableOpacity>

              </View>

            </View>

          </View>
        </Modal>

      </View>
    </SafeAreaView>
  )
}

export default Basket