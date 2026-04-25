// import React, { useContext } from 'react'
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
// } from 'react-native'
// import { useNavigation } from '@react-navigation/native'
// import { ProductContext } from '../context/ProductContext'

// const AllPackages = () => {
//   const navigation = useNavigation()
//   const { products } = useContext(ProductContext)

//   const parseDescription = (item) => {
//     try {
//       return JSON.parse(item.description)
//     } catch {
//       return null
//     }
//   }

//   const renderItem = ({ item }) => {
//     const data = parseDescription(item)
//     if (!data) return null

//     return (
//       <TouchableOpacity
//         style={{
//           flex: 1,
//           margin: 8,
//           backgroundColor: '#fff',
//           borderRadius: 14,
//           padding: 10,
//           elevation: 3,
//         }}
//         onPress={() =>
//           navigation.navigate('PackageDetail', {
//             item,
//             parsed: data,
//           })
//         }
//       >
//         {/* IMAGE */}
//         <Image
//           source={{ uri: item.view_images_url }}
//           style={{
//             width: '100%',
//             height: 120,
//             borderRadius: 10,
//           }}
//           resizeMode="cover"
//         />

//         {/* TITLE */}
//         <Text
//           style={{
//             fontSize: 14,
//             fontWeight: 'bold',
//             marginTop: 8,
//           }}
//           numberOfLines={2}
//         >
//           {data.package_name}
//         </Text>

//         {/* SUBTEXT */}
//         <Text
//           style={{
//             fontSize: 12,
//             color: 'black',
//             marginTop: 4,
//           }}
//         >
// Starting  from
//         </Text>

//         {/* BUTTON */}
//         <View
//           style={{
//             marginTop: 10,
//             backgroundColor: '#2563eb',
//             alignSelf: 'center',
//             paddingVertical: 5,
//             paddingHorizontal: 12,
//             borderRadius: 20,
//           }}
//         >
//           <Text style={{ color: '#fff', fontSize: 12 }}>
//             View Details
//           </Text>
//         </View>
//       </TouchableOpacity>
//     )
//   }

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>


//       {/* LIST */}
//       {products.length === 0 ? (
//         <Text style={{ textAlign: 'center', marginTop: 40, color: '#777' }}>
//           No packages available
//         </Text>
//       ) : (
//         <FlatList
//           data={products}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.id.toString()}
//           numColumns={2}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ padding: 8 }}
//         />
//       )}
//     </SafeAreaView>
//   )
// }

// export default AllPackages

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

        // handle range like "590–650"
        if (typeof price === 'string') {
          return parseFloat(price.split(/[–-]/)[0])
        }

        return price
      })
      .filter(Boolean)

    return prices.length ? Math.min(...prices) : null
  }

  // ✅ CARD UI
  const renderItem = ({ item }) => {
    const data = parseDescription(item)
    if (!data) return null

    const startingPrice = getStartingPrice(data)

    return (
      <TouchableOpacity
        style={{
          flex: 1,
          margin: 8,
          backgroundColor: '#fff',
          borderRadius: 14,
          padding: 10,
          elevation: 3,
          marginBottom: 20
        }}
        onPress={() =>
          navigation.navigate('PackageDetail', {
            item,
          })
        }
      >
        {/* IMAGE */}
        <Image
          source={{
            uri:
              item.view_images_url ||
              'https://via.placeholder.com/300',
          }}
          style={{
            width: '100%',
            height: 120,
            borderRadius: 10,
          }}
          resizeMode="cover"
        />

        {/* TITLE */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 8,
            color: '#111827',
          }}
          numberOfLines={2}
        >
          {data.package_name || 'Package'}
        </Text>

        {/* 🔥 STARTING PRICE */}
        {startingPrice ? (
          <View style={{  marginTop: 6, flexDirection: 'row',alignItems: 'center',gap: '5' }}>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>
              Starting from
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#2563eb',
              }}
            >
              ${startingPrice}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontSize: 12,
              color: '#9ca3af',
              marginTop: 6,
            }}
          >
            Price not available
          </Text>
        )}

        {/* BUTTON */}
        <View
          style={{
            marginTop: 10,
            backgroundColor: '#2563eb',
            alignSelf: 'center',
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>
            View Details
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      {products.length === 0 ? (
        <Text
          style={{
            textAlign: 'center',
            marginTop: 40,
            color: '#777',
          }}
        >
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