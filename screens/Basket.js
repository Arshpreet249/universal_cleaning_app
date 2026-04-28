
import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native'

import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL } from '../components/variable'
import { SafeAreaView } from 'react-native-safe-area-context'

const Basket = () => {
  const { token, setCartCount } = useContext(AuthContext)

  const [cartData, setCartData] = useState([])
  const [loading, setLoading] = useState(false)

  // ✅ modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

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
          } catch (e) {}

          const metaEntries = Object.entries(details).filter(
            ([key]) =>
              !['service', 'price', 'quantity', 'totalPrice', 'total'].includes(key)
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
    fetchCart()
  }, [token])

  // ---------------- DELETE API ----------------
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

  // ---------------- RENDER ITEM ----------------
  const renderItem = ({ item }) => (
    <View className="border border-gray-200 p-4 rounded-xl flex-row mb-3 bg-white">

      {/* <Image
        source={require('../assets/images/signin.webp')}
        className="w-20 h-20 rounded-xl"
      /> */}

      <View className="flex-1 px-3">

        {/* Service Name */}
        <Text className="text-md font-semibold text-primary">
        {item.displayName}
        </Text>

        {/* Dynamic Details */}
        {item.displayMeta?.length > 0 && (
          <View className="mt-1">
            {item.displayMeta.map((meta, index) => (
              <View key={index} className="flex-row">
                <Text className=" font-semibold capitalize">
                {meta.key}:
                </Text>
                <Text className="text-gray-600 ml-2">
                  {meta.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Price */}
        <Text className="text-primary text-lg font-bold mt-2">
        Price: ${item.displayPrice}
        </Text>
      </View>

      {/* REMOVE BUTTON */}
      <TouchableOpacity
        onPress={() => {
          setSelectedId(item.id)
          setShowDeleteModal(true)
        }}
        className="bg-red-100 px-3 py-2 rounded-lg self-start"
      >
        <Text className="text-red-600 font-semibold">
          Remove
        </Text>
      </TouchableOpacity>
    </View>
  )

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
     <SafeAreaView className="flex-1 bg-gray-50">
    <View className="flex-1 px-4 pb-24">

      {/* HEADER */}
      <Text className="text-2xl font-bold text-center mt-4 mb-4 text-primary">
        My Basket
      </Text>

      {/* LIST */}
      <FlatList
        data={cartData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="text-center mt-10 text-gray-500">
            No items in basket
          </Text>
        }
      />

      {/* FOOTER */}
      <View className="bg-white px-5 py-4 flex-row justify-between items-center ">
        <View>
          <Text>Total </Text>
          <Text className="text-lg font-bold">${total}</Text>
        </View>

        <TouchableOpacity className="bg-primary px-6 py-3 rounded-full">
          <Text className="text-white font-semibold">
            Checkout
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- PREMIUM DELETE MODAL ---------------- */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">

          <View className="w-full bg-white rounded-3xl p-6 shadow-xl">

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

              {/* CANCEL */}
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

              {/* DELETE */}
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