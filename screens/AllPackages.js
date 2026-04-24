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

  const parseDescription = (item) => {
    try {
      return JSON.parse(item.description)
    } catch {
      return null
    }
  }

  const renderItem = ({ item }) => {
    const data = parseDescription(item)
    if (!data) return null

    return (
      <TouchableOpacity
        style={{
          flex: 1,
          margin: 8,
          backgroundColor: '#fff',
          borderRadius: 14,
          padding: 10,
          elevation: 3,
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
          source={
            item.icon_url
              ? { uri: item.icon_url }
              : require('../assets/images/home_cleaning.webp')
          }
          style={{
            width: '100%',
            height: 110,
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
          }}
          numberOfLines={2}
        >
          {data.package_name}
        </Text>

        {/* SUBTEXT */}
        <Text
          style={{
            fontSize: 12,
            color: '#666',
            marginTop: 4,
          }}
        >
         
        </Text>

        {/* BUTTON */}
        <View
          style={{
            marginTop: 10,
            backgroundColor: '#6C63FF',
            alignSelf: 'flex-start',
            paddingVertical: 5,
            paddingHorizontal: 12,
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

      {/* HEADER */}
      <View
        style={{
          padding: 16,
          backgroundColor: '#6C63FF',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontSize: 16, marginRight: 10 }}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
          All Packages
        </Text>
      </View>

      {/* LIST */}
      {products.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#777' }}>
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