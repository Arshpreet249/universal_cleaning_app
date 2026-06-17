import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL } from '../components/variable'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '../components/BackButton'


const PackageDetail = ({ route }) => {
  const { item } = route.params
  const navigation = useNavigation()
  const { token, basketItems, setBasketItems } = useContext(AuthContext)

  const [selectedItems, setSelectedItems] = useState([])

  const parseDescription = (data) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data
    } catch {
      return null
    }
  }

  const parsed = parseDescription(item.description)

  const getMinPrice = (price) => {
    if (!price) return null
    const str = String(price).toLowerCase().trim()
    const cleaned = str.replace(/from/g, '').trim()
    if (cleaned.includes('+')) {
      return parseFloat(cleaned.replace('+', '').trim())
    }
    if (/[–-]/.test(cleaned)) {
      return parseFloat(cleaned.split(/[–-]/)[0])
    }
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
    let prices = data
      .map(item => {
        let price = item.price_sgd
        if (typeof price === 'string') {
          const num = price.split(/[–-]/)[0]
          return parseFloat(num)
        }
        return price
      })
      .filter(Boolean)
    return Math.min(...prices)
  }

  const startingPrice = getStartingPrice(data)

  const getHeaders = (data) => {
    if (!data.length) return []
    const sample = data[0]
    return Object.keys(sample)
      .filter(key => key !== 'payment_type')
      .map(key =>
        key === 'price_sgd'
          ? 'PRICE'
          : key.toUpperCase().replace(/_/g, ' ')
      )
  }

  const headers = getHeaders(data)
  const isShortTable = headers.length <= 3

  const isAddOn =
    parsed?.package_name?.toLowerCase().includes('add on') || false

  const toggleSelection = (row, index) => {
    const exists = selectedItems.find(i => i.rowIndex === index)
    if (isAddOn) {
      if (exists) {
        setSelectedItems(prev => prev.filter(i => i.rowIndex !== index))
      } else {
        setSelectedItems(prev => [...prev, { ...row, rowIndex: index, quantity: 1 }])
      }
    } else {
      if (exists) {
        setSelectedItems([])
      } else {
        setSelectedItems([{ ...row, rowIndex: index, quantity: 1 }])
      }
    }
  }

  const updateQuantity = (index, type) => {
    setSelectedItems(prev =>
      prev.map(item => {
        if (item.rowIndex === index) {
          let qty = item.quantity || 1
          if (type === 'inc') qty++
          if (type === 'dec' && qty > 1) qty--
          return { ...item, quantity: qty }
        }
        return item
      })
    )
  }

  const handleAddToCart = async () => {
    if (selectedItems.length === 0) return
    try {
      if (!token) {
        Alert.alert('Login Required', 'Please login first!')
        return
      }

      let newItems = []

      for (let row of selectedItems) {
        let price = getMinPrice(row.price_sgd)
        if (price === null || isNaN(price)) {
          Alert.alert('Invalid Plan', 'This plan requires a custom quote.')
          return
        }

        price = Number(price)
        const { price_sgd, ...cleanRow } = row
        const qty = row.quantity || 1
        const total = price * qty

        const itemToAdd = {
          package_id: item.id,
          service: parsed?.package_name || 'Package',
          ...cleanRow,
          price,
          quantity: qty,
          totalPrice: total,
        }

        const res = await fetch(`${REACT_APP_HOST_API_URL}/api/booking/add/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            note: JSON.stringify(itemToAdd),
            price: itemToAdd.totalPrice,
          }),
        })

        const data = await res.json()

        if (data.status !== 200) {
          Alert.alert('Error', data.message || 'Booking failed')
          return
        }

        newItems.push(itemToAdd)
      }

      setBasketItems([...basketItems, ...newItems])

      navigation.navigate('Main', {
        screen: 'Basket',
      })

    } catch (err) {
      Alert.alert('Error', 'Something went wrong!')
    }
  }

  const SectionTitle = ({ title }) => (
    <Text className="text-[20px] font-bold mt-5 mb-2 text-blue-600">
      {title}
    </Text>
  )

  const renderList = (data) => {
    if (!data) return null
    return data.map((item, index) => (
      <Text
        key={index}
        className="text-[13px] text-gray-700 mb-2 leading-[18px] bg-gray-100 p-3 rounded-xl"
      >
        • {typeof item === 'string' ? item : item.description || '-'}
      </Text>
    ))
  }

  const renderTerms = (terms) => {
    if (!terms) return null
    return terms.map((item, index) => (
      <View key={index} className="mb-2">
        <Text className="text-[14px] font-semibold text-blue-600 mb-1">
          {item.heading || item.condition}
        </Text>
        {Array.isArray(item.description)
          ? item.description.map((d, i) => (
            <Text
              key={i}
              className="text-[13px] text-gray-700 mb-2 leading-[18px] bg-gray-100 p-3 rounded-xl"
            >
              • {d}
            </Text>
          ))
          : (
            <Text className="text-[13px] text-gray-700 mb-2 leading-[18px] bg-gray-100 p-3 rounded-xl">
              • {item.description}
            </Text>
          )}
      </View>
    ))
  }

  const renderRefund = (refund) => {
    if (!refund) return null
    return Object.entries(refund).map(([key, value], index) => (
      <Text
        key={index}
        className="text-[13px] text-gray-700 mb-2 leading-[18px] bg-gray-100 p-3 rounded-xl"
      >
        • {key.replace(/_/g, ' ').toUpperCase()} : {value}
      </Text>
    ))
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="px-4 py-2">
        <BackButton />
      </View>
      <ScrollView className="flex-1">
        <Text className="text-2xl font-bold text-center mt-4 mb-4 text-primary">
          Package Details
        </Text>

        {/* IMAGE */}
        <Image
          source={{ uri: item.view_images_url }}
          className="w-full h-[220px]"
        />

        <View className="bg-white -mt-5 rounded-t-2xl p-4">

          {/* TITLE */}
          <Text className="text-[22px] font-bold mb-4 text-blue-600">
            {parsed?.package_name}
          </Text>

          {/* STARTING PRICE */}
          {startingPrice && (
            <View className="flex-row justify-between items-center mb-5">
              <View>
                <Text className="text-[12px] text-gray-500">Starting from</Text>
                <Text className="text-[26px] font-bold text-blue-600">
                  ${startingPrice}
                  <Text className="text-[14px] text-gray-500"></Text>
                </Text>
              </View>
            </View>
          )}

          {/* DESCRIPTION */}
          {parsed?.description && (
            <>
              <SectionTitle title="Description" />
              {Array.isArray(parsed.description)
                ? renderList(parsed.description)
                : (
                  <Text className="text-[13px] text-gray-700 mb-2 bg-gray-100 p-3 rounded-xl">
                    {parsed.description}
                  </Text>
                )}
            </>
          )}


          {/* SELECTION INFO */}
          <Text className="text-gray-500 mb-3 text-[12px]">
            {isAddOn
              ? 'You can select multiple add-on services'
              : 'Select one package'}
          </Text>

          {/* TABLE */}
          <ScrollView
            horizontal={!isShortTable}
            showsHorizontalScrollIndicator={false}
          >
            <View className={`${isShortTable ? 'w-full' : ''} border border-gray-200 rounded-xl overflow-hidden`}>

              {/* HEADER */}
              {headers.length > 0 && (
                <View className="flex-row bg-blue-600">
                  {/* Checkbox column placeholder */}
                  <View className="w-10 border-r border-blue-400" />

                  {headers.map((h, i) => (
                    <View
                      key={i}
                      className={`py-3 px-2 items-center justify-center
                        ${isShortTable ? 'flex-1' : 'w-[110px]'}
                        ${i < headers.length - 1 ? 'border-r border-blue-400' : ''}
                      `}
                    >
                      <Text className="text-[12px] font-bold text-white text-center">
                        {h}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* ROWS */}
              {data.map((row, index) => {
                const isSelected = selectedItems.some(i => i.rowIndex === index)

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleSelection(row, index)}
                    className={`flex-row items-center border-t
                      ${isSelected
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'}
                    `}
                  >
                    {/* CHECKBOX — same w-10 as header placeholder */}
                    <View className={`w-10 py-4 items-center justify-center border-r
                      ${isSelected ? 'border-blue-200' : 'border-gray-200'}
                    `}>
                      <View className="w-5 h-5 border border-blue-600 rounded items-center justify-center">
                        <Text className="text-blue-600 font-bold text-[11px]">
                          {isSelected ? '✓' : ''}
                        </Text>
                      </View>
                    </View>

                    {/* VALUES */}
                    <View className="flex-1">
                      <View className="flex-row">
                        {headers.map((header, i) => {
                          let key = header === 'PRICE'
                            ? 'price_sgd'
                            : header.toLowerCase().replace(/ /g, '_')

                          let value = row[key]

                          if (key === 'duration_hours' && value) value = `${value} hrs`
                          if (key === 'duration_minutes' && value) value = `${value} mins`

                          return (
                            <View
                              key={i}
                              className={`py-4 px-2 items-center justify-center
                                ${isShortTable ? 'flex-1' : 'w-[110px]'}
                                ${i < headers.length - 1
                                  ? isSelected ? 'border-r border-blue-200' : 'border-r border-gray-200'
                                  : ''}
                              `}
                            >
                              <Text className="text-[13px] text-gray-900 text-center">
                                {value ? `${key === 'price_sgd' ? '$' : ''}${value}` : '-'}
                              </Text>
                            </View>
                          )
                        })}
                      </View>

                      {/* QTY (ADD-ON only) */}
                      {isAddOn && isSelected && (
                        <>
                          <View className="flex-row items-center justify-center mt-2">
                            <TouchableOpacity
                              onPress={() => updateQuantity(index, 'dec')}
                              className="px-3 py-1 bg-gray-200 rounded-md"
                            >
                              <Text className="text-black font-bold">-</Text>
                            </TouchableOpacity>

                            <Text className="mx-4 text-base font-semibold">
                              {selectedItems.find(i => i.rowIndex === index)?.quantity || 1}
                            </Text>

                            <TouchableOpacity
                              onPress={() => updateQuantity(index, 'inc')}
                              className="px-3 py-1 bg-gray-200 rounded-md"
                            >
                              <Text className="text-black font-bold">+</Text>
                            </TouchableOpacity>
                          </View>

                          <Text className="text-center mt-2 mb-2 text-blue-600 font-semibold">
                            Total: $
                            {(
                              (selectedItems.find(i => i.rowIndex === index)?.quantity || 1) *
                              (getMinPrice(row.price_sgd) || 0)
                            ).toFixed(2)}
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}

            </View>
          </ScrollView>

          {/* MULTIPLE IMAGES - VERTICAL */}
          {/* {item?.multiple_images?.length > 0 && (
            <>
              <SectionTitle title="Our Work" />

              <View className="mt-3 mb-5 px-2">
                {item.multiple_images.map((img) => (
                  <Image
                    key={img.id}
                    source={{ uri: img.image_url }}
                    className="w-full h-[200px] rounded mb-3"
                    resizeMode="cover"
                  />
                ))}
              </View>
            </>
          )} */}

          {item?.multiple_images?.length > 0 && (() => {
            const imgs = item.multiple_images
            const hero = imgs[0]
            const pair1 = imgs.slice(1, 3)
            const wide = imgs[3]
            const pair2 = imgs.slice(4, 6)

            return (
              <View style={{ marginTop: 32, marginBottom: 8 }}>
                {/* Eyebrow */}
                <SectionTitle title="Our Work" />


                {/* Hero */}
                {hero && (
                  <View style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 10 }}>
                    <Image source={{ uri: hero.image_url }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
                    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0)', justifyContent: 'flex-end' }}>
                      <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 10, color: '#fff', fontWeight: '500', letterSpacing: 1 }}>Featured</Text>
                      </View>
                      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: 'rgba(0,0,0,0.4)' }} />
                      <View style={{ position: 'absolute', bottom: 14, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#fff' }}></Text>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>1 / {imgs.length}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Pair 1 */}
                {pair1.length > 0 && (
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                    {pair1.map((img, i) => (
                      <View key={img.id} style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
                        <Image source={{ uri: img.image_url }} style={{ width: '100%', height: 130 }} resizeMode="cover" />
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                        <Text style={{ position: 'absolute', bottom: 9, right: 10, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                          {i + 2} / {imgs.length}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Wide */}
                {wide && (
                  <View style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                    <Image source={{ uri: wide.image_url }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.4)' }} />
                    <View style={{ position: 'absolute', bottom: 12, left: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.5)', paddingLeft: 7 }}>
                      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '500', letterSpacing: 0.8 }}></Text>
                    </View>
                  </View>
                )}

                {/* Pair 2 */}
                {pair2.length > 0 && (
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    {pair2.map((img, i) => (
                      <View key={img.id} style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
                        <Image source={{ uri: img.image_url }} style={{ width: '100%', height: 130 }} resizeMode="cover" />
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                        <Text style={{ position: 'absolute', bottom: 9, right: 10, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                          {i + 5} / {imgs.length}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Footer */}
                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {[0,1,2].map(i => (
            <View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: i === 0 ? '#111827' : '#d1d5db' }} />
          ))}
        </View>
        <TouchableOpacity style={{ borderWidth: 0.5, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 5 }}>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>View all photos</Text>
        </TouchableOpacity>
      </View> */}
              </View>
            )
          })()}

          {/* TERMS */}
          {parsed?.terms_and_conditions && (
            <>
              <SectionTitle title="Terms & Conditions" />
              {renderTerms(parsed.terms_and_conditions)}
            </>
          )}

          {/* DEPOSIT */}
          {parsed?.deposit_policy && (
            <>
              <SectionTitle title="Deposit Policy" />
              {renderList(parsed.deposit_policy)}
            </>
          )}

          {/* REFUND */}
          {parsed?.refund_policy && (
            <>
              <SectionTitle title="Refund Policy" />
              {renderRefund(parsed.refund_policy)}
            </>
          )}

          {/* ADDITIONAL */}
          {parsed?.additional_conditions && (
            <>
              <SectionTitle title="Additional Conditions" />
              {renderTerms(parsed.additional_conditions)}
            </>
          )}

          {/* POLICIES */}
          {parsed?.policies && (
            <>
              <SectionTitle title="Policies" />
              {Object.entries(parsed.policies).map(([key, value], i) => (
                <View key={i} className="mb-2">
                  <Text className="text-[14px] font-semibold text-blue-600 mb-1">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  {renderList(value)}
                </View>
              ))}
            </>
          )}

        </View>
      </ScrollView>

      {/* ADD TO CART BUTTON */}
      {selectedItems.length > 0 && (
        <View className="p-3 bg-white">
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-xl items-center"
            onPress={handleAddToCart}
          >
            <Text className="text-white font-bold">
              Add {selectedItems.length} items
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

export default PackageDetail