
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


const PackageDetail = ({ route }) => {
  const { item } = route.params
  const navigation = useNavigation()
  const { token, basketItems, setBasketItems } = useContext(AuthContext)

  const [selectedItems, setSelectedItems] = useState([])

  // ✅ SAFE PARSE
  const parseDescription = (data) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data
    } catch {
      return null
    }
  }

  const parsed = parseDescription(item.description)

  // ✅ GET DATA ARRAY
  const getDataArray = (parsed) => {
    if (!parsed) return []

    if (Array.isArray(parsed.pricing)) return parsed.pricing
    if (Array.isArray(parsed.packages)) return parsed.packages
    if (Array.isArray(parsed.sub_packages)) return parsed.sub_packages
    if (parsed.pricing_options?.option_b)
      return parsed.pricing_options.option_b

    return []
  }

  const data = getDataArray(parsed)

  // ✅ GET STARTING PRICE
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

  // ✅ HEADERS
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

  // ✅ ROW VALUES
  const renderRowValues = (item, headers) => {
    return headers.map((header, index) => {
      let key =
        header === 'PRICE'
          ? 'price_sgd'
          : header.toLowerCase().replace(/ /g, '_')

      let value = item[key]

      if (key === 'duration_hours' && value)
        value = `${value} hrs`

      if (key === 'duration_minutes' && value)
        value = `${value} mins`

      return (
        <Text key={index} className="w-[110px] text-[13px] text-gray-900">
          {value ? `${key === 'price_sgd' ? '$' : ''}${value}` : '-'}
        </Text>
      )
    })
  }

  // ✅ SELECT
  const toggleSelection = (row, index) => {
    const exists = selectedItems.find(i => i.id === index)

    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.id !== index))
    } else {
      setSelectedItems([...selectedItems, { ...row, id: index }])
    }
  }

  // ✅ API ADD TO CART
  const handleAddToCart = async () => {
    if (selectedItems.length === 0) return

    try {
      if (!token) {
        Alert.alert('Login Required', 'Please login first!')
        return
      }

      let newItems = []

      for (let row of selectedItems) {
        let price = row.price_sgd

        if (!price || isNaN(Number(price))) {
          Alert.alert(
            'Invalid Plan',
            'This plan requires a custom quote.'
          )
          return
        }

        price = Number(price)
        const { id,price_sgd, ...cleanRow } = row
        const itemToAdd = {
          service: parsed?.package_name || 'Package',
          ...cleanRow,
          price,
          quantity: 1,
          totalPrice: price,
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

      // ✅ Update Context
      setBasketItems([...basketItems, ...newItems])

      // Alert.alert('Success', 'Added to cart')

      navigation.navigate('Main', {
        screen: 'Basket',
      })

    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Something went wrong!')
    }
  }



  // =========================
  // 🔥 EXTRA UI FUNCTIONS
  // =========================

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
            {parsed?.package_name || 'Package'}
          </Text>

          {/* STARTING PRICE */}
          {startingPrice && (
            <View className="flex-row justify-between items-center mb-5">
              <View>
                <Text className="text-[12px] text-gray-500">
                  Starting from
                </Text>
                <Text className="text-[26px] font-bold text-blue-600">
                  ${startingPrice}
                  <Text className="text-[14px] text-gray-500">
                    {' '} /hr(s)
                  </Text>
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

          {/* TABLE */}
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className=''>
              {headers.length > 0 && (
                <View className="flex-row bg-gray-100 py-3 px-3 rounded-xl mb-2">
                  <Text className="w-[40px] text-center" />
                  {headers.map((h, i) => (
                    <Text
                      key={i}
                      className="w-[110px] text-[12px] font-bold text-blue-600"
                    >
                      {h}
                    </Text>
                  ))}
                </View>
              )}

              {data.map((row, index) => {
                const isSelected = selectedItems.some(
                  i => i.id === index
                )

                return (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row items-center bg-white py-4 px-3 rounded-xl mb-2  ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-600'
                        : ''
                    }`}
                    onPress={() => toggleSelection(row, index)}
                  >
                    <View className="w-6 h-6 border-[1.5px] border-blue-600 mr-2 items-center justify-center rounded-md">
                      <Text className="text-blue-600 font-bold">
                        {isSelected ? '✓' : ''}
                      </Text>
                    </View>

                    <View className="flex-row">
                      {renderRowValues(row, headers)}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
            
          </ScrollView> */}


          <ScrollView
            horizontal={!isShortTable}
            showsHorizontalScrollIndicator={false}
          >
            <View className={`${isShortTable ? 'w-full' : ''}`}>

              {/* HEADER */}
              {headers.length > 0 && (
                <View className="flex-row bg-gray-100 py-3 px-3 rounded-xl mb-2">
                  <Text className="w-10 text-center" />

                  {headers.map((h, i) => (
                    <Text
                      key={i}
                      className={`text-[12px] font-bold text-blue-600 ${isShortTable ? 'flex-1 text-center' : 'w-[110px]'
                        }`}
                    >
                      {h}
                    </Text>
                  ))}
                </View>
              )}

              {/* ROWS */}
              {data.map((row, index) => {
                const isSelected = selectedItems.some(i => i.id === index)

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleSelection(row, index)}
                    className={`flex-row items-center py-4 px-2 rounded-xl mb-2 ${isSelected
                      ? 'bg-blue-50 border border-blue-600  '
                      : 'bg-white'
                      }`}
                  >
                    {/* CHECKBOX */}
                    <View className="w-6 h-6 border-[1.5px] border-blue-600 mr-2 items-center justify-center rounded-md">
                      <Text className="text-blue-600 font-bold">
                        {isSelected ? '✓' : ''}
                      </Text>
                    </View>

                    {/* VALUES */}
                    <View className="flex-row flex-1">
                      {headers.map((header, i) => {
                        let key =
                          header === 'PRICE'
                            ? 'price_sgd'
                            : header.toLowerCase().replace(/ /g, '_')

                        let value = row[key]

                        return (
                          <Text
                            key={i}
                            className={`text-[13px] text-gray-900 ${isShortTable
                              ? 'flex-1 text-center'
                              : 'w-[110px]'
                              }`}
                          >
                            {value ? `${key === 'price_sgd' ? '$' : ''}${value}` : '-'}
                          </Text>
                        )
                      })}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>


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

      {/* BUTTON */}
      {/* {selectedItems.length > 0 && (
        <View className="p-3 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-xl items-center"
            onPress={addToBasket}
          >
            <Text className="text-white font-bold text-[16px]">
              Add {selectedItems.length} items to Basket
            </Text>
          </TouchableOpacity>
        </View>
      )} */}

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

