import React, { useState, useMemo, useEffect, useContext } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native'

import { ProductContext } from '../context/ProductContext'

const Basket = () => {
  const { products } = useContext(ProductContext)
  const [items, setItems] = useState([])

  // ✅ LOAD FROM CONTEXT
  useEffect(() => {
    if (products && products.length > 0) {
      const mapped = products.map((item, index) => ({
        ...item,
        id: item.id ?? index,
        quantity: 1,
      }))
      setItems(mapped)
    } else {
      setItems([])
    }
  }, [products])

  // ✅ INCREASE QTY
  const increaseQty = (id) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  // ✅ DECREASE QTY
  const decreaseQty = (id) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    )
  }

  // ✅ REMOVE ITEM
  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  // ✅ TOTAL PRICE
  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.price_sgd || item.price || 0)
      return sum + price * item.quantity
    }, 0)
  }, [items])

  // ✅ CARD UI
  const renderItem = ({ item }) => (
    
    <View className="flex-row bg-white rounded-2xl p-3 mb-3 mx-4 items-center shadow-sm">

      {/* IMAGE */}
      <Image
        source={{
          uri:
            item.view_images_url
        }}
        className="w-20 h-20 rounded-xl"
      />

      {/* DETAILS */}
      <View className="flex-1 ml-3">

        {/* PACKAGE NAME */}
        <Text className="text-[15px] font-bold text-gray-900">
          {item.package_name }
        </Text>

        {/* UNIT TYPE */}
        {item.unit_type && (
          <Text className="text-[12px] text-gray-500 mt-1">
            {item.unit_type}
          </Text>
        )}

        {/* PRICE */}
        <Text className="text-[13px] font-semibold text-green-600 mt-1">
          ${item.price_sgd}
        </Text>

        {/* ACTIONS */}
        <View className="flex-row justify-between items-center mt-2">

          {/* QTY CONTROLS */}
          <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">

            <TouchableOpacity onPress={() => decreaseQty(item.id)}>
              <Text className="text-lg px-2">−</Text>
            </TouchableOpacity>

            <Text className="px-2 font-semibold">
              {item.quantity}
            </Text>

            <TouchableOpacity onPress={() => increaseQty(item.id)}>
              <Text className="text-lg px-2">＋</Text>
            </TouchableOpacity>

          </View>

          {/* REMOVE */}
          <TouchableOpacity onPress={() => removeItem(item.id)}>
            <Text className="text-red-500 text-xs font-semibold">
              Remove
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50 pt-8 px-4">
 <Text className="text-2xl font-bold text-gray-900 mb-4">
        My Basket
      </Text>

      {/* LIST */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text className="text-center mt-10 text-gray-400">
            Your Basket is empty 🛒
          </Text>
        }
      />

      {/* FOOTER */}
      <View className="absolute bottom-0 w-full bg-white px-5 py-4 flex-row justify-between items-center border-t border-gray-200">

        <View>
          <Text className="text-xs ">Total</Text>
          <Text className="text-lg font-bold text-black">
            ${total.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity className="bg-black px-6 py-3 rounded-full">
          <Text className="font-semibold">
            Checkout
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default Basket