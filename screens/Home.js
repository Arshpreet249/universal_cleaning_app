// import React, { useEffect, useState } from 'react'
// import {
//   ScrollView,
//   Text,
//   View,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
// } from 'react-native'
// import Navbar from '../components/Navbar'
// import axios from 'axios'
// import { apiBaseUrl } from '../components/variable'
// import { useNavigation } from '@react-navigation/native'

// const Home = () => {
//   const navigation = useNavigation()
//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetchProducts()
//   }, [])

//   // GET PRODUCTS
//   const fetchProducts = async () => {
//     try {
//       setLoading(true)

//       const res = await axios.get(`${apiBaseUrl}get-products/`)
//       // console.log('API DATA:', res.data)

//       setProducts(res.data || [])
//     } catch (error) {
//       console.log('API ERROR:', error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // SAFE JSON PARSE
//   const parseDescription = (item) => {
//     try {
//       return JSON.parse(item.description)
//     } catch (e) {
//       return null
//     }
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       {/* BACKGROUND */}
//       <Image
//         style={{
//           position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
//         }}
//         source={require('../assets/images/background.jpg')}
//       />

//       <ScrollView>
//         <Navbar />

//         <View style={{ marginHorizontal: 16, marginTop: 20 }}>
//           <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>HighLights</Text>
//           {loading ? (
//             <ActivityIndicator size="large" color="blue" />
//           ) : (
//             <View
//               style={{
//                 flexDirection: 'row',
//                 flexWrap: 'wrap',
//                 justifyContent: 'space-between',
//               }}
//             >
//               {products
//                 .filter((item) => item?.layout_style === 'high_light')
//                 .map((item) => {
//                   const data = parseDescription(item)
//                   if (!data) return null

//                   return (
//                     <TouchableOpacity
//                       key={item.id}
//                       style={{ backgroundColor: 'white', marginBottom: 16, borderRadius: 12, padding: 12, alignItems: 'center', width: '24%', }}
//                       onPress={() =>
//                         navigation.navigate('AllPackages', {
//                           item,
//                           parsed: data,
//                         })
//                       }
//                     >
//                       {/* IMAGE */}
//                       <Image
//                         source={
//                           item.icon_url
//                             ? { uri: item.icon_url }
//                             : require('../assets/images/home_cleaning.webp')
//                         }
//                         style={{ width: 40, height: 40, borderRadius: 8 }}
//                       />

//                       {/* NAME */}
//                       <Text
//                         style={{
//                           fontSize: 12,
//                           textAlign: 'center',
//                           fontWeight: '400',
//                           marginTop: 8,
//                         }}
//                       >
//                         {data.package_name.toLowerCase()}
//                       </Text>
//                     </TouchableOpacity>
//                   )
//                 })}
//             </View>
//           )}
//         </View>

//         <View>
//           <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 12, marginHorizontal: 16 , padding: 10}}>
//             Explore More...
//           </Text>

//           <View
//             style={{
//               flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',paddingHorizontal: 16,
//             }}
//           >
//             {products.map((item) => {
//               const data = parseDescription(item)
//               if (!data) return null

//               return (
//                 <TouchableOpacity
//                   key={`category-${item.id}`}
//                   style={{backgroundColor: '#fff',width: '48%',marginBottom: 12,borderRadius: 12,padding: 12,
//                     // flexDirection: 'row',
//                     alignItems: 'center',
//                   }}
//                   onPress={() =>
//                     navigation.navigate('AllPackages', {
//                       item,
//                       parsed: data,
//                     })
//                   }
//                 >
//                   {/* IMAGE */}
//                   <Image
//                     source={
//                       item.icon_url
//                         ? { uri: item.icon_url }
//                         : require('../assets/images/home_cleaning.webp')
//                     }
//                     style={{ width: 100, height: 100, borderRadius: 8 }}
//                   />

//                   {/* TEXT */}
//                   <View style={{ marginLeft: 10, flex: 1 }}>
//                     <Text
//                       style={{
//                         fontSize: 14,
//                         fontWeight: '400',
//                         textTransform: 'capitalize',textAlign: 'center', marginTop: 8,
//                       }}
//                     >
//                       {data.package_name}
//                     </Text>

//                   </View>
//                 </TouchableOpacity>
//               )
//             })}
//           </View>

//         </View>
//       </ScrollView>
//     </View>
//   )
// }

// export default Home


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

  // FETCH PRODUCTS
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
    } catch {
      return null
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {/* BACKGROUND */}
      <Image
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        source={require('../assets/images/background.jpg')}
      />

      <ScrollView>
        <Navbar />

        {/* ================= HIGHLIGHTS ================= */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 10 }}>
            HighLights
          </Text>

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
                        navigation.navigate('AllPackages', {
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
                        style={{ width: 40, height: 40, borderRadius: 8 }}
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

        {/* ================= EXPLORE MORE ================= */}
        <View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginVertical: 12,
              marginHorizontal: 16,
              padding: 10,
            }}
          >
            Explore More...
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
                
                {Array.from({
                  length: Math.ceil(products.length / 2),
                }).map((_, colIndex) => {
                  const firstItem = products[colIndex * 2]
                  const secondItem = products[colIndex * 2 + 1]

                  return (
                    <View key={colIndex} style={{ marginRight: 12 }}>
                      
                      {[firstItem, secondItem].map((item) => {
                        if (!item) return null

                        const data = parseDescription(item)
                        if (!data) return null

                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={{
                              backgroundColor: '#fff',
                              width: 120,
                              height: 150,
                              marginBottom: 12,
                              borderRadius: 12,
                              padding: 12,
                              alignItems: 'center',
                            }}
                            onPress={() =>
                              navigation.navigate('AllPackages', {
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
                                width: 80,
                                height: 80,
                                borderRadius: 8,
                              }}
                            />

                            <Text
                              style={{
                                fontSize: 13,
                                textAlign: 'center',
                                marginTop: 8,
                                textTransform: 'capitalize',
                              }}
                            >
                              {data.package_name}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  )
                })}

              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default Home