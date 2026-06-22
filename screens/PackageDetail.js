// import React, { useState, useContext } from 'react'
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   Alert
// } from 'react-native'
// import { useNavigation } from '@react-navigation/native'
// import { AuthContext } from '../context/AuthContext'
// import { REACT_APP_HOST_API_URL } from '../components/variable'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import BackButton from '../components/BackButton'


// const PackageDetail = ({ route }) => {
//   const { item } = route.params
//   const navigation = useNavigation()
//   const { token, basketItems, setBasketItems } = useContext(AuthContext)

//   const [selectedItems, setSelectedItems] = useState([])

//   const parseDescription = (data) => {
//     try {
//       return typeof data === 'string' ? JSON.parse(data) : data
//     } catch {
//       return null
//     }
//   }

//   const parsed = parseDescription(item.description)

//   const getMinPrice = (price) => {
//     if (!price) return null
//     const str = String(price).toLowerCase().trim()
//     const cleaned = str.replace(/from/g, '').trim()
//     if (cleaned.includes('+')) {
//       return parseFloat(cleaned.replace('+', '').trim())
//     }
//     if (/[–-]/.test(cleaned)) {
//       return parseFloat(cleaned.split(/[–-]/)[0])
//     }
//     return parseFloat(cleaned)
//   }

//   const getDataArray = (parsed) => {
//     if (!parsed) return []
//     if (Array.isArray(parsed.pricing)) return parsed.pricing
//     if (Array.isArray(parsed.packages)) return parsed.packages
//     if (Array.isArray(parsed.sub_packages)) return parsed.sub_packages
//     if (parsed.pricing_options?.option_b) return parsed.pricing_options.option_b
//     return []
//   }

//   const data = getDataArray(parsed)

//   const getStartingPrice = (data) => {
//     if (!data || data.length === 0) return null
//     let prices = data
//       .map(item => {
//         let price = item.price_sgd
//         if (typeof price === 'string') {
//           const num = price.split(/[–-]/)[0]
//           return parseFloat(num)
//         }
//         return price
//       })
//       .filter(Boolean)
//     return Math.min(...prices)
//   }

//   const startingPrice = getStartingPrice(data)

//   const getHeaders = (data) => {
//     if (!data.length) return []
//     const sample = data[0]
//     return Object.keys(sample)
//       .filter(key => key !== 'payment_type')
//       .map(key =>
//         key === 'price_sgd'
//           ? 'PRICE'
//           : key.toUpperCase().replace(/_/g, ' ')
//       )
//   }

//   const headers = getHeaders(data)
//   const isShortTable = headers.length <= 3

//   const isAddOn =
//     parsed?.package_name?.toLowerCase().includes('add on') || false

//   const toggleSelection = (row, index) => {
//     const exists = selectedItems.find(i => i.rowIndex === index)
//     if (isAddOn) {
//       if (exists) {
//         setSelectedItems(prev => prev.filter(i => i.rowIndex !== index))
//       } else {
//         setSelectedItems(prev => [...prev, { ...row, rowIndex: index, quantity: 1 }])
//       }
//     } else {
//       if (exists) {
//         setSelectedItems([])
//       } else {
//         setSelectedItems([{ ...row, rowIndex: index, quantity: 1 }])
//       }
//     }
//   }

//   const updateQuantity = (index, type) => {
//     setSelectedItems(prev =>
//       prev.map(item => {
//         if (item.rowIndex === index) {
//           let qty = item.quantity || 1
//           if (type === 'inc') qty++
//           if (type === 'dec' && qty > 1) qty--
//           return { ...item, quantity: qty }
//         }
//         return item
//       })
//     )
//   }

//   const handleAddToCart = async () => {
//     if (selectedItems.length === 0) return
//     try {
//       if (!token) {
//         Alert.alert('Login Required', 'Please login first!')
//         return
//       }

//       let newItems = []

//       for (let row of selectedItems) {
//         let price = getMinPrice(row.price_sgd)
//         if (price === null || isNaN(price)) {
//           Alert.alert('Invalid Plan', 'This plan requires a custom quote.')
//           return
//         }

//         price = Number(price)
//         const { price_sgd, ...cleanRow } = row
//         const qty = row.quantity || 1
//         const total = price * qty

//         const itemToAdd = {
//           package_id: item.id,
//           service: parsed?.package_name || 'Package',
//           ...cleanRow,
//           price,
//           quantity: qty,
//           totalPrice: total,
//         }

//         const res = await fetch(`${REACT_APP_HOST_API_URL}/api/booking/add/`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             note: JSON.stringify(itemToAdd),
//             price: itemToAdd.totalPrice,
//             package_id :item.id
//           }),
//         })

//         const data = await res.json()

//         if (data.status !== 200) {
//           Alert.alert('Error', data.message || 'Booking failed')
//           return
//         }

//         newItems.push(itemToAdd)
//       }

//       setBasketItems([...basketItems, ...newItems])

//       navigation.navigate('Main', {
//         screen: 'Basket',
//       })

//     } catch (err) {
//       Alert.alert('Error', 'Something went wrong!')
//     }
//   }

//   const SectionTitle = ({ title }) => (
//     <Text className="text-[20px] font-bold mt-5 mb-2 text-blue-600">
//       {title}
//     </Text>
//   )

//   const renderList = (data) => {
//     if (!data) return null
//     return data.map((item, index) => (
//       <Text
//         key={index}
//         className="text-[13px] text-gray-700 mb-2 leading-[18px] bg-gray-100 p-3 rounded-xl"
//       >
//         • {typeof item === 'string' ? item : item.description || '-'}
//       </Text>
//     ))
//   }

//   const renderTerms = (terms) => {
//     if (!terms) return null
//     return terms.map((item, index) => (
//       <View key={index} className="mb-2">
//         <Text className="text-[14px] font-semibold text-blue-600 mb-1">
//           {item.heading || item.condition}
//         </Text>
//         {Array.isArray(item.description)
//           ? item.description.map((d, i) => (
//             <Text
//               key={i}
//               className="text-[13px] text-gray-700 mb-2 leading-[18px] bg-gray-100 p-3 rounded-xl"
//             >
//               • {d}
//             </Text>
//           ))
//           : (
//             <Text className="text-[13px] text-gray-700 mb-2 leading-[18px] bg-gray-100 p-3 rounded-xl">
//               • {item.description}
//             </Text>
//           )}
//       </View>
//     ))
//   }

//   const renderRefund = (refund) => {
//     if (!refund) return null
//     return Object.entries(refund).map(([key, value], index) => (
//       <Text
//         key={index}
//         className="text-[13px] text-gray-700 mb-2 leading-[18px] bg-gray-100 p-3 rounded-xl"
//       >
//         • {key.replace(/_/g, ' ').toUpperCase()} : {value}
//       </Text>
//     ))
//   }

//   const GalleryTile = ({ img, height, rounded = 16, style }) => (
//     <View
//       style={[
//         {
//           height,
//           borderRadius: rounded,
//           overflow: 'hidden',
//           backgroundColor: '#e2e8f0',
//         },
//         style,
//       ]}
//     >
//       <Image source={{ uri: img.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
//     </View>
//   )

//   return (
//     <SafeAreaView className="flex-1">
//       <View className="px-4 py-2">
//         <BackButton />
//       </View>
//       <ScrollView className="flex-1">
//         <Text className="text-2xl font-bold text-center mt-4 mb-4 text-primary">
//           Package Details
//         </Text>

//         {/* IMAGE */}
//         <Image
//           source={{ uri: item.view_images_url }}
//           className="w-full h-[220px]"
//         />

//         <View className="bg-white -mt-5 rounded-t-2xl p-4">

//           {/* TITLE */}
//           <Text className="text-[22px] font-bold mb-4 text-blue-600">
//             {parsed?.package_name}
//           </Text>

//           {/* STARTING PRICE */}
//           {startingPrice && (
//             <View className="flex-row justify-between items-center mb-5">
//               <View>
//                 <Text className="text-[12px] text-gray-500">Starting from</Text>
//                 <Text className="text-[26px] font-bold text-blue-600">
//                   ${startingPrice}
//                   <Text className="text-[14px] text-gray-500"></Text>
//                 </Text>
//               </View>
//             </View>
//           )}

//           {/* DESCRIPTION */}
//           {parsed?.description && (
//             <>
//               <SectionTitle title="Description" />
//               {Array.isArray(parsed.description)
//                 ? renderList(parsed.description)
//                 : (
//                   <Text className="text-[13px] text-gray-700 mb-2 bg-gray-100 p-3 rounded-xl">
//                     {parsed.description}
//                   </Text>
//                 )}
//             </>
//           )}


//           {/* SELECTION INFO */}
//           <Text className="text-gray-500 mb-3 text-[12px]">
//             {isAddOn
//               ? 'You can select multiple add-on services'
//               : 'Select one package'}
//           </Text>

//           {/* TABLE */}
//           <ScrollView
//             horizontal={!isShortTable}
//             showsHorizontalScrollIndicator={false}
//           >
//             <View className={`${isShortTable ? 'w-full' : ''} border border-gray-200 rounded-xl overflow-hidden`}>

//               {/* HEADER */}
//               {headers.length > 0 && (
//                 <View className="flex-row bg-blue-600">
//                   {/* Checkbox column placeholder */}
//                   <View className="w-10 border-r border-blue-400" />

//                   {headers.map((h, i) => (
//                     <View
//                       key={i}
//                       className={`py-3 px-2 items-center justify-center
//                         ${isShortTable ? 'flex-1' : 'w-[110px]'}
//                         ${i < headers.length - 1 ? 'border-r border-blue-400' : ''}
//                       `}
//                     >
//                       <Text className="text-[12px] font-bold text-white text-center">
//                         {h}
//                       </Text>
//                     </View>
//                   ))}
//                 </View>
//               )}

//               {/* ROWS */}
//               {data.map((row, index) => {
//                 const isSelected = selectedItems.some(i => i.rowIndex === index)

//                 return (
//                   <TouchableOpacity
//                     key={index}
//                     onPress={() => toggleSelection(row, index)}
//                     className={`flex-row items-center border-t
//                       ${isSelected
//                         ? 'bg-blue-50 border-blue-200'
//                         : 'bg-white border-gray-200'}
//                     `}
//                   >
//                     {/* CHECKBOX — same w-10 as header placeholder */}
//                     <View className={`w-10 py-4 items-center justify-center border-r
//                       ${isSelected ? 'border-blue-200' : 'border-gray-200'}
//                     `}>
//                       <View className="w-5 h-5 border border-blue-600 rounded items-center justify-center">
//                         <Text className="text-blue-600 font-bold text-[11px]">
//                           {isSelected ? '✓' : ''}
//                         </Text>
//                       </View>
//                     </View>

//                     {/* VALUES */}
//                     <View className="flex-1">
//                       <View className="flex-row">
//                         {headers.map((header, i) => {
//                           let key = header === 'PRICE'
//                             ? 'price_sgd'
//                             : header.toLowerCase().replace(/ /g, '_')

//                           let value = row[key]

//                           if (key === 'duration_hours' && value) value = `${value} hrs`
//                           if (key === 'duration_minutes' && value) value = `${value} mins`

//                           return (
//                             <View
//                               key={i}
//                               className={`py-4 px-2 items-center justify-center
//                                 ${isShortTable ? 'flex-1' : 'w-[110px]'}
//                                 ${i < headers.length - 1
//                                   ? isSelected ? 'border-r border-blue-200' : 'border-r border-gray-200'
//                                   : ''}
//                               `}
//                             >
//                               <Text className="text-[13px] text-gray-900 text-center">
//                                 {value ? `${key === 'price_sgd' ? '$' : ''}${value}` : '-'}
//                               </Text>
//                             </View>
//                           )
//                         })}
//                       </View>

//                       {/* QTY (ADD-ON only) */}
//                       {isAddOn && isSelected && (
//                         <>
//                           <View className="flex-row items-center justify-center mt-2">
//                             <TouchableOpacity
//                               onPress={() => updateQuantity(index, 'dec')}
//                               className="px-3 py-1 bg-gray-200 rounded-md"
//                             >
//                               <Text className="text-black font-bold">-</Text>
//                             </TouchableOpacity>

//                             <Text className="mx-4 text-base font-semibold">
//                               {selectedItems.find(i => i.rowIndex === index)?.quantity || 1}
//                             </Text>

//                             <TouchableOpacity
//                               onPress={() => updateQuantity(index, 'inc')}
//                               className="px-3 py-1 bg-gray-200 rounded-md"
//                             >
//                               <Text className="text-black font-bold">+</Text>
//                             </TouchableOpacity>
//                           </View>

//                           <Text className="text-center mt-2 mb-2 text-blue-600 font-semibold">
//                             Total: $
//                             {(
//                               (selectedItems.find(i => i.rowIndex === index)?.quantity || 1) *
//                               (getMinPrice(row.price_sgd) || 0)
//                             ).toFixed(2)}
//                           </Text>
//                         </>
//                       )}
//                     </View>
//                   </TouchableOpacity>
//                 )
//               })}

//             </View>
//           </ScrollView>

//           {/* MULTIPLE IMAGES - VERTICAL */}
//           {/* {item?.multiple_images?.length > 0 && (
//             <>
//               <SectionTitle title="Our Work" />

//               <View className="mt-3 mb-5 px-2">
//                 {item.multiple_images.map((img) => (
//                   <Image
//                     key={img.id}
//                     source={{ uri: img.image_url }}
//                     className="w-full h-[200px] rounded mb-3"
//                     resizeMode="cover"
//                   />
//                 ))}
//               </View>
//             </>
//           )} */}

//           {item?.multiple_images?.length > 0 && (() => {
//             const imgs = item.multiple_images
//             const hero = imgs[0]
//             const gallery = imgs.slice(1)

//             return (
//               <View style={{ marginTop: 28, marginBottom: 16 }}>
//                 <SectionTitle title="Our Work" />

//                 {hero && (
//                   <View
//                     style={{
//                       marginTop: 8,
//                       marginBottom: 10,
//                       borderRadius: 20,
//                       padding: 4,
//                       backgroundColor: '#fff',
//                       shadowColor: '#0f172a',
//                       shadowOffset: { width: 0, height: 10 },
//                       shadowOpacity: 0.12,
//                       shadowRadius: 18,
//                       elevation: 4,
//                     }}
//                   >
//                     <GalleryTile img={hero} height={235} rounded={17} />
//                   </View>
//                 )}

//                 {gallery.length > 0 && (
//                   <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
//                     {gallery.map((img, i) => {
//                       const isLastOdd = gallery.length % 2 === 1 && i === gallery.length - 1

//                       return (
//                         <View
//                           key={img.id || img.image_url}
//                           style={{
//                             width: isLastOdd ? '100%' : '48.5%',
//                             borderRadius: 16,
//                             padding: 3,
//                             backgroundColor: '#fff',
//                             shadowColor: '#0f172a',
//                             shadowOffset: { width: 0, height: 6 },
//                             shadowOpacity: 0.08,
//                             shadowRadius: 12,
//                             elevation: 2,
//                           }}
//                         >
//                           <GalleryTile img={img} height={isLastOdd ? 180 : 142} rounded={13} />
//                         </View>
//                       )
//                     })}
//                   </View>
//                 )}

//                 {imgs.length === 1 && (
//                   <View
//                     style={{
//                       marginTop: 10,
//                       backgroundColor: '#f8fafc',
//                       borderRadius: 16,
//                       padding: 14,
//                       borderWidth: 1,
//                       borderColor: '#e2e8f0',
//                     }}
//                   >
//                     <Text style={{ color: '#64748b', fontSize: 12, textAlign: 'center' }}>
//                       More work photos coming soon
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             )
//           })()}

//           {/* TERMS */}
//           {parsed?.terms_and_conditions && (
//             <>
//               <SectionTitle title="Terms & Conditions" />
//               {renderTerms(parsed.terms_and_conditions)}
//             </>
//           )}

//           {/* DEPOSIT */}
//           {parsed?.deposit_policy && (
//             <>
//               <SectionTitle title="Deposit Policy" />
//               {renderList(parsed.deposit_policy)}
//             </>
//           )}

//           {/* REFUND */}
//           {parsed?.refund_policy && (
//             <>
//               <SectionTitle title="Refund Policy" />
//               {renderRefund(parsed.refund_policy)}
//             </>
//           )}

//           {/* ADDITIONAL */}
//           {parsed?.additional_conditions && (
//             <>
//               <SectionTitle title="Additional Conditions" />
//               {renderTerms(parsed.additional_conditions)}
//             </>
//           )}

//           {/* POLICIES */}
//           {parsed?.policies && (
//             <>
//               <SectionTitle title="Policies" />
//               {Object.entries(parsed.policies).map(([key, value], i) => (
//                 <View key={i} className="mb-2">
//                   <Text className="text-[14px] font-semibold text-blue-600 mb-1">
//                     {key.replace(/_/g, ' ').toUpperCase()}
//                   </Text>
//                   {renderList(value)}
//                 </View>
//               ))}
//             </>
//           )}

//         </View>
//       </ScrollView>

//       {/* ADD TO CART BUTTON */}
//       {selectedItems.length > 0 && (
//         <View className="p-3 bg-white">
//           <TouchableOpacity
//             className="bg-blue-600 p-4 rounded-xl items-center"
//             onPress={handleAddToCart}
//           >
//             <Text className="text-white font-bold">
//               Add {selectedItems.length} items
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   )
// }

// export default PackageDetail


import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL } from '../components/variable'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '../components/BackButton'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/* ─── Icon map: matches common service keywords to icons ─── */
const SECTION_ICONS = {
  'Description':          { lib: 'Ionicons',   name: 'document-text-outline',   color: '#3B82F6' },
  'Terms & Conditions':   { lib: 'Ionicons',   name: 'shield-checkmark-outline', color: '#6366F1' },
  'Deposit Policy':       { lib: 'Ionicons',   name: 'wallet-outline',           color: '#F59E0B' },
  'Refund Policy':        { lib: 'Ionicons',   name: 'return-down-back-outline', color: '#10B981' },
  'Additional Conditions':{ lib: 'Ionicons',   name: 'information-circle-outline',color: '#8B5CF6' },
  'Policies':             { lib: 'Ionicons',   name: 'lock-closed-outline',      color: '#EF4444' },
  'Our Work':             { lib: 'Ionicons',   name: 'images-outline',           color: '#3B82F6' },
}

const SectionIcon = ({ title }) => {
  const cfg = SECTION_ICONS[title]
  if (!cfg) return null
  return (
    <View style={{
      width: 32, height: 32, borderRadius: 10,
      backgroundColor: cfg.color + '18',
      alignItems: 'center', justifyContent: 'center',
      marginRight: 8,
    }}>
      <Ionicons name={cfg.name} size={17} color={cfg.color} />
    </View>
  )
}

/* ─── Divider ─── */
const Divider = () => (
  <View style={{ height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 }} />
)

/* ─── Section Title ─── */
const SectionTitle = ({ title }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
    <SectionIcon title={title} />
    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', letterSpacing: 0.2 }}>
      {title}
    </Text>
  </View>
)

/* ─── Pill Badge ─── */
const Pill = ({ label, icon }) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF6FF', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, marginBottom: 8,
  }}>
    {icon && <Ionicons name={icon} size={12} color="#3B82F6" style={{ marginRight: 4 }} />}
    <Text style={{ fontSize: 11, fontWeight: '600', color: '#2563EB' }}>{label}</Text>
  </View>
)

/* ─── Bullet card ─── */
const BulletCard = ({ text }) => (
  <View style={{
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#F8FAFC', borderRadius: 12,
    padding: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: '#BFDBFE',
  }}>
    <View style={{
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: '#3B82F6', marginTop: 5, marginRight: 10, flexShrink: 0,
    }} />
    <Text style={{ fontSize: 13, color: '#475569', lineHeight: 19, flex: 1 }}>
      {typeof text === 'string' ? text : text.description || '-'}
    </Text>
  </View>
)

/* ─── Gallery Tile ─── */
const GalleryTile = ({ img, height, rounded = 16, style }) => (
  <View style={[{ height, borderRadius: rounded, overflow: 'hidden', backgroundColor: '#E2E8F0' }, style]}>
    <Image source={{ uri: img.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
  </View>
)

/* ════════════════════════════════════════════════════════════ */
const PackageDetail = ({ route }) => {
  const { item } = route.params
  const navigation = useNavigation()
  const { token, basketItems, setBasketItems } = useContext(AuthContext)
  const [selectedItems, setSelectedItems] = useState([])

  /* ── Helpers ── */
  const parseDescription = (data) => {
    try { return typeof data === 'string' ? JSON.parse(data) : data } catch { return null }
  }
  const parsed = parseDescription(item.description)

  const getPriceValue = (row) => {
    // Support both price_sgd and price_sgd_per_hour (and any other price_ key)
    const priceKey = Object.keys(row).find(k => k.startsWith('price'))
    if (!priceKey) return null
    return row[priceKey]
  }

  const getMinPrice = (price) => {
    if (!price) return null
    const str = String(price).toLowerCase().trim()
    const cleaned = str.replace(/from/g, '').trim()
    if (cleaned.includes('+')) return parseFloat(cleaned.replace('+', '').trim())
    if (/[–-]/.test(cleaned)) return parseFloat(cleaned.split(/[–-]/)[0])
    return parseFloat(cleaned)
  }

  const getDataArray = (parsed) => {
    if (!parsed) return []
    if (Array.isArray(parsed.pricing)) return parsed.pricing
    if (Array.isArray(parsed.packages)) return parsed.packages
    if (Array.isArray(parsed.sub_packages)) return parsed.sub_packages
    if (parsed.pricing_options?.option_b) return parsed.pricing_options.option_b
    return []
  }
  const data = getDataArray(parsed)

  const getStartingPrice = (data) => {
    if (!data || data.length === 0) return null
    const prices = data.map(row => {
      const raw = getPriceValue(row)
      if (raw == null) return null
      if (typeof raw === 'number') return raw
      return parseFloat(String(raw).split(/[–-]/)[0])
    }).filter(v => v != null && !isNaN(v))
    if (!prices.length) return null
    return Math.min(...prices)
  }
  const startingPrice = getStartingPrice(data)

  const getHeaders = (data) => {
    if (!data.length) return []
    return Object.keys(data[0])
      .filter(k => k !== 'payment_type')
      .map(k => k.startsWith('price') ? 'PRICE' : k.toUpperCase().replace(/_/g, ' '))
  }
  const headers = getHeaders(data)
  const isShortTable = headers.length <= 3
  const isAddOn = parsed?.package_name?.toLowerCase().includes('add on') || false

  const toggleSelection = (row, index) => {
    const exists = selectedItems.find(i => i.rowIndex === index)
    if (isAddOn) {
      setSelectedItems(prev => exists ? prev.filter(i => i.rowIndex !== index) : [...prev, { ...row, rowIndex: index, quantity: 1 }])
    } else {
      setSelectedItems(exists ? [] : [{ ...row, rowIndex: index, quantity: 1 }])
    }
  }

  const updateQuantity = (index, type) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.rowIndex !== index) return i
      let qty = i.quantity || 1
      if (type === 'inc') qty++
      if (type === 'dec' && qty > 1) qty--
      return { ...i, quantity: qty }
    }))
  }

  const handleAddToCart = async () => {
    if (selectedItems.length === 0) return
    try {
      if (!token) { Alert.alert('Login Required', 'Please login first!'); return }
      let newItems = []
      for (let row of selectedItems) {
        let price = getMinPrice(getPriceValue(row))
        if (price === null || isNaN(price)) { Alert.alert('Invalid Plan', 'This plan requires a custom quote.'); return }
        price = Number(price)
        const { price_sgd, ...cleanRow } = row
        const qty = row.quantity || 1
        const total = price * qty
        const itemToAdd = { package_id: item.id, service: parsed?.package_name || 'Package', ...cleanRow, price, quantity: qty, totalPrice: total }
        const res = await fetch(`${REACT_APP_HOST_API_URL}/api/booking/add/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ note: JSON.stringify(itemToAdd), price: itemToAdd.totalPrice, package_id: item.id }),
        })
        const data = await res.json()
        if (data.status !== 200) { Alert.alert('Error', data.message || 'Booking failed'); return }
        newItems.push(itemToAdd)
      }
      setBasketItems([...basketItems, ...newItems])
      navigation.navigate('Main', { screen: 'Basket' })
    } catch { Alert.alert('Error', 'Something went wrong!') }
  }

  const renderList = (data) => {
    if (!data) return null
    return data.map((item, i) => <BulletCard key={i} text={item} />)
  }

  const renderTerms = (terms) => {
    if (!terms) return null
    return terms.map((item, i) => (
      <View key={i} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Ionicons name="chevron-forward-circle" size={15} color="#6366F1" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
            {item.heading || item.condition}
          </Text>
        </View>
        {Array.isArray(item.description)
          ? item.description.map((d, j) => <BulletCard key={j} text={d} />)
          : <BulletCard text={item.description} />}
      </View>
    ))
  }

  const renderRefund = (refund) => {
    if (!refund) return null
    return Object.entries(refund).map(([key, value], i) => (
      <View key={i} style={{
        flexDirection: 'row', justifyContent: 'space-between',
        backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 8,
        borderLeftWidth: 3, borderLeftColor: '#10B981',
      }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', flex: 1 }}>
          {key.replace(/_/g, ' ').toUpperCase()}
        </Text>
        <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '600', flex: 1, textAlign: 'right' }}>
          {value}
        </Text>
      </View>
    ))
  }

  /* ─── Selected total for non-addon ─── */
  const cartTotal = selectedItems.reduce((sum, i) => sum + (getMinPrice(getPriceValue(i)) || 0) * (i.quantity || 1), 0)

  /* ──────────────────────── RENDER ──────────────────────── */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F4FF' }}>

      {/* ── Floating Back Button ── */}
      <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? 52 : 16, left: 16, zIndex: 99 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.92)',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12, shadowRadius: 8, elevation: 5,
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── Hero Image with gradient overlay ── */}
        <View style={{ height: 280, width: '100%', position: 'relative' }}>
          <Image source={{ uri: item.view_images_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(15,23,42,0.72)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 }}
          />
          {/* Category pill on hero */}
          <View style={{ position: 'absolute', top: 18, right: 16 }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
            }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
                PREMIUM PACKAGE
              </Text>
            </View>
          </View>
          {/* Package name on hero */}
          <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3, lineHeight: 28 }}>
              {parsed?.package_name}
            </Text>
          </View>
        </View>

        {/* ── White card ── */}
        <View style={{
          backgroundColor: '#fff', marginTop: -20,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120,
          shadowColor: '#0F172A', shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06, shadowRadius: 12,
        }}>

          {/* ── Price + Book strip ── */}
          {startingPrice && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: '#EFF6FF', borderRadius: 16,
              paddingHorizontal: 18, paddingVertical: 14, marginBottom: 20,
              borderWidth: 1, borderColor: '#BFDBFE',
            }}>
              <View>
                <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 2 }}>Starting from</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#2563EB', lineHeight: 32 }}>
                    ${startingPrice}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#94A3B8', marginLeft: 3, marginBottom: 4 }}>SGD</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star-half" size={14} color="#F59E0B" />
                <Text style={{ fontSize: 11, color: '#94A3B8', marginLeft: 4 }}>4.8</Text>
              </View>
            </View>
          )}

          {/* ── Trust badges ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <Pill label="Verified Service" icon="shield-checkmark-outline" />
            <Pill label="Instant Booking" icon="flash-outline" />
            <Pill label="Secure Payment" icon="lock-closed-outline" />
            <Pill label="5★ Rated" icon="star-outline" />
          </ScrollView>

          <Divider />

          {/* ── Description ── */}
          {parsed?.description && (
            <>
              <SectionTitle title="Description" />
              {Array.isArray(parsed.description)
                ? renderList(parsed.description)
                : (
                  <View style={{
                    backgroundColor: '#F8FAFC', borderRadius: 14,
                    padding: 14, borderLeftWidth: 3, borderLeftColor: '#BFDBFE', marginBottom: 8,
                  }}>
                    <Text style={{ fontSize: 13, color: '#475569', lineHeight: 19 }}>
                      {parsed.description}
                    </Text>
                  </View>
                )}
              <Divider />
            </>
          )}

          {/* ── Package selection ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name={isAddOn ? 'add-circle-outline' : 'radio-button-on-outline'} size={15} color="#3B82F6" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 12, color: '#64748B' }}>
              {isAddOn ? 'Select one or more add-ons' : 'Select one package to continue'}
            </Text>
          </View>

          {/* ── Pricing Table ── */}
          <ScrollView horizontal={!isShortTable} showsHorizontalScrollIndicator={false}>
            <View style={{
              borderRadius: 16, overflow: 'hidden',
              borderWidth: 1, borderColor: '#E2E8F0',
              width: isShortTable ? SCREEN_WIDTH - 40 : undefined,
              shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
              backgroundColor: '#fff',
            }}>
              {/* Header row */}
              {headers.length > 0 && (
                <LinearGradient colors={['#2563EB', '#3B82F6']} style={{ flexDirection: 'row' }}>
                  <View style={{ width: 44, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)' }} />
                  {headers.map((h, i) => (
                    <View key={i} style={{
                      paddingVertical: 14, paddingHorizontal: 10,
                      alignItems: 'center', justifyContent: 'center',
                      flex: isShortTable ? 1 : undefined,
                      width: isShortTable ? undefined : 120,
                      borderRightWidth: i < headers.length - 1 ? 1 : 0,
                      borderRightColor: 'rgba(255,255,255,0.2)',
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.5 }}>{h}</Text>
                    </View>
                  ))}
                </LinearGradient>
              )}

              {/* Data rows */}
              {data.map((row, index) => {
                const isSelected = selectedItems.some(i => i.rowIndex === index)
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleSelection(row, index)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      borderTopWidth: 1, borderTopColor: '#F1F5F9',
                      backgroundColor: isSelected ? '#EFF6FF' : '#fff',
                    }}
                  >
                    {/* Checkbox */}
                    <View style={{
                      width: 44, paddingVertical: 18,
                      alignItems: 'center', justifyContent: 'center',
                      borderRightWidth: 1, borderRightColor: isSelected ? '#BFDBFE' : '#F1F5F9',
                    }}>
                      <View style={{
                        width: 22, height: 22, borderRadius: 6,
                        borderWidth: 2, borderColor: isSelected ? '#2563EB' : '#CBD5E1',
                        backgroundColor: isSelected ? '#2563EB' : 'transparent',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <Ionicons name="checkmark" size={13} color="#fff" />}
                      </View>
                    </View>

                    {/* Values */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row' }}>
                        {headers.map((header, i) => {
                          let key = header === 'PRICE'
                            ? (Object.keys(row).find(k => k.startsWith('price')) || 'price_sgd')
                            : header.toLowerCase().replace(/ /g, '_')
                          let value = row[key]
                          if (key === 'duration_hours' && value) value = `${value} hrs`
                          if (key === 'duration_minutes' && value) value = `${value} mins`
                          const isPrice = key.startsWith('price')
                          return (
                            <View key={i} style={{
                              paddingVertical: 16, paddingHorizontal: 10,
                              alignItems: 'center', justifyContent: 'center',
                              flex: isShortTable ? 1 : undefined,
                              width: isShortTable ? undefined : 120,
                              borderRightWidth: i < headers.length - 1 ? 1 : 0,
                              borderRightColor: isSelected ? '#BFDBFE' : '#F1F5F9',
                            }}>
                              <Text style={{
                                fontSize: 13,
                                color: isPrice ? '#2563EB' : '#1E293B',
                                fontWeight: isPrice ? '700' : '400',
                                textAlign: 'center',
                              }}>
                                {value ? `${isPrice ? '$' : ''}${value}` : '—'}
                              </Text>
                            </View>
                          )
                        })}
                      </View>

                      {/* Qty for add-on */}
                      {isAddOn && isSelected && (
                        <View style={{
                          flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'center', paddingVertical: 10,
                          borderTopWidth: 1, borderTopColor: '#BFDBFE',
                          backgroundColor: '#F0F7FF',
                        }}>
                          <TouchableOpacity
                            onPress={() => updateQuantity(index, 'dec')}
                            style={{
                              width: 32, height: 32, borderRadius: 10,
                              backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Ionicons name="remove" size={16} color="#2563EB" />
                          </TouchableOpacity>
                          <Text style={{ marginHorizontal: 16, fontSize: 15, fontWeight: '700', color: '#1E293B' }}>
                            {selectedItems.find(i => i.rowIndex === index)?.quantity || 1}
                          </Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(index, 'inc')}
                            style={{
                              width: 32, height: 32, borderRadius: 10,
                              backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Ionicons name="add" size={16} color="#fff" />
                          </TouchableOpacity>
                          <Text style={{ marginLeft: 14, fontSize: 13, fontWeight: '700', color: '#2563EB' }}>
                            = ${((selectedItems.find(i => i.rowIndex === index)?.quantity || 1) * (getMinPrice(getPriceValue(row)) || 0)).toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>

          {/* ── Gallery ── */}
          {item?.multiple_images?.length > 0 && (() => {
            const imgs = item.multiple_images
            const hero = imgs[0]
            const gallery = imgs.slice(1)
            return (
              <View style={{ marginTop: 28 }}>
                <Divider />
                <SectionTitle title="Our Work" />
                {hero && (
                  <View style={{
                    borderRadius: 20, overflow: 'hidden',
                    marginBottom: 10,
                    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.12, shadowRadius: 16, elevation: 4,
                  }}>
                    <GalleryTile img={hero} height={220} rounded={20} />
                  </View>
                )}
                {gallery.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {gallery.map((img, i) => {
                      const isLastOdd = gallery.length % 2 === 1 && i === gallery.length - 1
                      return (
                        <View key={img.id || img.image_url} style={{
                          width: isLastOdd ? '100%' : '48.5%',
                          borderRadius: 14, overflow: 'hidden',
                          shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.08, shadowRadius: 10, elevation: 2,
                        }}>
                          <GalleryTile img={img} height={isLastOdd ? 170 : 132} rounded={14} />
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>
            )
          })()}

          {/* ── Terms ── */}
          {parsed?.terms_and_conditions && (
            <>
              <Divider />
              <SectionTitle title="Terms & Conditions" />
              {renderTerms(parsed.terms_and_conditions)}
            </>
          )}

          {/* ── Deposit ── */}
          {parsed?.deposit_policy && (
            <>
              <Divider />
              <SectionTitle title="Deposit Policy" />
              {renderList(parsed.deposit_policy)}
            </>
          )}

          {/* ── Refund ── */}
          {parsed?.refund_policy && (
            <>
              <Divider />
              <SectionTitle title="Refund Policy" />
              {renderRefund(parsed.refund_policy)}
            </>
          )}

          {/* ── Additional ── */}
          {parsed?.additional_conditions && (
            <>
              <Divider />
              <SectionTitle title="Additional Conditions" />
              {renderTerms(parsed.additional_conditions)}
            </>
          )}

          {/* ── Policies ── */}
          {parsed?.policies && (
            <>
              <Divider />
              <SectionTitle title="Policies" />
              {Object.entries(parsed.policies).map(([key, value], i) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="lock-closed-outline" size={13} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                  {renderList(value)}
                </View>
              ))}
            </>
          )}

        </View>
      </ScrollView>

      {/* ── Sticky Add to Cart ── */}
      {selectedItems.length > 0 && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
          paddingBottom: Platform.OS === 'ios' ? 28 : 14,
          borderTopWidth: 1, borderTopColor: '#F1F5F9',
          shadowColor: '#0F172A', shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.08, shadowRadius: 16, elevation: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#94A3B8', marginRight: 4 }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#2563EB' }}>
                ${cartTotal.toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            activeOpacity={0.88}
            style={{ borderRadius: 14, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={['#2563EB', '#3B82F6']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 15, flexDirection: 'row',
                alignItems: 'center', justifyContent: 'center', borderRadius: 14,
              }}
            >
              <Ionicons name="cart-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                Add to Basket
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

export default PackageDetail