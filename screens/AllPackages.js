import React, { useContext } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ProductContext } from '../context/ProductContext'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'

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

  // 💎 CARD UI
  const renderItem = ({ item }) => {
    const data = parseDescription(item)
    if (!data) return null

    const startingPrice = getStartingPrice(data)

    return (
      <View
        className="w-[48%] h-[240px] mb-4 rounded-3xl"
        // style={{
        //   shadowColor: '#000',
        //   shadowOpacity: 0.25,
        //   shadowRadius: 10,
        //   // elevation: 6,
        // }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          className="flex-1"
          onPress={() =>
            navigation.navigate('PackageDetail', { item })
          }
        >
          <ImageBackground
            source={{
              uri:
                item.view_images_url ||
                'https://via.placeholder.com/300',
            }}
            className="flex-1 justify-end"
            imageStyle={{ borderRadius: 24 }}
          >
            {/* ✅ GRADIENT */}
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0,0,0,0.4)',
                'rgba(0,0,0,0.9)',
              ]}
              className="absolute left-0 right-0 bottom-0 "
              style={{
                height: 100, // important for iOS
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                paddingHorizontal:8
              }}
            >
              {/* TITLE */}
              <Text className="text-white text-sm font-bold" numberOfLines={1}>
                {data.package_name || 'Package'}
              </Text>

              {/* DESCRIPTION */}
              <Text className="text-gray-300 text-[11px] mt-1" numberOfLines={2}>
                {data?.description}
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
          </ImageBackground>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 ">
      <View className="flex-1 px-4">

        {/* HEADER */}
        <Text className="text-2xl font-bold text-center mt-4 mb-4 text-primary">
          All Packages
        </Text>

        {products.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">
            No packages available
          </Text>
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: 'space-between',
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

      </View>
    </SafeAreaView>
  )
}

export default AllPackages