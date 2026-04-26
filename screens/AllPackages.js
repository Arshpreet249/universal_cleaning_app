import React, { useContext } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ProductContext } from '../context/ProductContext'
import { LinearGradient } from 'expo-linear-gradient'

const AllPackages = () => {
  const navigation = useNavigation()
  const { products } = useContext(ProductContext)

  // ✅ SAFE PARSE
  const parseDescription = (item) => {
    try {
      return typeof item.description === 'string'
        ? JSON.parse(item.description)
        : item.description
    } catch {
      return null
    }
  }

  // ✅ GET STARTING PRICE
  const getStartingPrice = (parsed) => {
    if (!parsed) return null

    let data = []

    if (Array.isArray(parsed.pricing)) data = parsed.pricing
    else if (Array.isArray(parsed.packages)) data = parsed.packages
    else if (Array.isArray(parsed.sub_packages)) data = parsed.sub_packages
    else if (parsed.pricing_options?.option_b)
      data = parsed.pricing_options.option_b

    if (!data.length) return null

    const prices = data
      .map((item) => {
        let price = item.price_sgd

        if (typeof price === 'string') {
          return parseFloat(price.split(/[–-]/)[0])
        }

        return price
      })
      .filter(Boolean)

    return prices.length ? Math.min(...prices) : null
  }

  // 💎 PREMIUM CARD
  const renderItem = ({ item }) => {
    const data = parseDescription(item)
    if (!data) return null

    const startingPrice = getStartingPrice(data)

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className="flex-1 m-2 h-64 rounded-3xl overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 6,
        }}
        onPress={() =>
          navigation.navigate('PackageDetail', { item })
        }
      >
        {/* IMAGE */}
        <Image
          source={{
            uri:
              item.view_images_url ||
              'https://via.placeholder.com/300',
          }}
          className="absolute w-full h-full"
        />

        {/* GRADIENT OVERLAY */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0,0,0,0.4)',
            'rgba(0,0,0,0.85)',
          ]}
          className="flex-1 justify-end p-3"
        >
          {/* TITLE */}
          <Text
            numberOfLines={1}
            className="text-white text-base font-bold"
          >
            {data.package_name || 'Package'}
          </Text>

          {/* DESCRIPTION */}
          <Text
            numberOfLines={2}
            className="text-gray-300 text-[11px] mt-1"
          >
            {data?.description||
              'Luxury experience with premium services'}
          </Text>

  

          {/* PRICE + BUTTON */}
          <View className="flex-row justify-between items-center mt-3">
            {startingPrice && (
              <View className="bg-white px-3 py-1 rounded-full">
                <Text className="text-black text-xs font-semibold">
                  ${startingPrice}
                </Text>
              </View>
            )}

            <View className="bg-white px-4 py-1.5 rounded-full">
              <Text className="text-black text-xs font-semibold">
                See More
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      {products.length === 0 ? (
        <Text className="text-center mt-10 text-gray-500">
          No packages available
        </Text>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 8 }}
        />
      )}
    </SafeAreaView>
  )
}

export default AllPackages