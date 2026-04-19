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

const Home = () => {
  const navigation = useNavigation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  // GET PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true)

      const res = await axios.get(`${apiBaseUrl}get-products/`)

      console.log('API DATA:', res.data)

      setProducts(res.data || [])
    } catch (error) {
      console.log('API ERROR:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // SAFE JSON PARSE
  const parseDescription = (item) => {
    try {
      return JSON.parse(item.description)
    } catch (e) {
      return null
    }
  }

  return (
    <View >

      {/* BACKGROUND */}
      {/* <Image
        className="absolute inset-0 w-full h-full"
        source={require('../assets/images/background.jpg')}
      /> */}

      <ScrollView>
        <Navbar />

        <View className="mx-4 mt-5">

          {loading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : (
            <View className="flex-row flex-wrap justify-between">

              {products.map((item) => {
                const data = parseDescription(item)
                if (!data) return null

                return (
                  <TouchableOpacity
                    key={item.id}
                    className="bg-white mb-4 rounded-2xl p-3 items-center"
                    style={{ width: '30%' }}

                    // 👉 OPEN DETAIL SCREEN
                    onPress={() =>
                      navigation.navigate('AllPackages', {
                        item,
                        parsed: data,
                      })
                    }
                  >

                    {/* IMAGE */}
                    <Image
                      source={{
                        uri:
                          item.icon_url ||
                          'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542'
                      }}
                      className="w-20 h-20 mb-2 rounded-lg"
                    />

                    {/* NAME */}
                    <Text className="text-xs text-center font-bold">
                      {data.package_name}
                    </Text>

                  </TouchableOpacity>
                )
              })}

            </View>
          )}

        </View>
      </ScrollView>
    </View>
  )
}

export default Home