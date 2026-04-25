// import React, { useState } from 'react'
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native'
// import { useNavigation } from '@react-navigation/native'
// const PackageDetail = ({ route }) => {
//   const { item } = route.params
//   const navigation = useNavigation()

//   const [selectedItems, setSelectedItems] = useState([])

//   // ✅ SAFE PARSE
//   const parseDescription = (data) => {
//     try {
//       return typeof data === 'string' ? JSON.parse(data) : data
//     } catch {
//       return null
//     }
//   }

//   const parsed = parseDescription(item.description)

//   // ✅ GET DATA ARRAY
//   const getDataArray = (parsed) => {
//     if (!parsed) return []

//     if (Array.isArray(parsed.pricing)) return parsed.pricing
//     if (Array.isArray(parsed.packages)) return parsed.packages
//     if (Array.isArray(parsed.sub_packages)) return parsed.sub_packages
//     if (parsed.pricing_options?.option_b) return parsed.pricing_options.option_b

//     return []
//   }

//   const data = getDataArray(parsed)

//   // ✅ DYNAMIC HEADERS FROM API KEYS
//   const getHeaders = (data) => {
//     if (!data.length) return []

//     const sample = data[0]

//     return Object.keys(sample)
//       .filter(
//         key =>
//           key !== 'payment_type' // ignore internal field
//       )
//       .map(key =>
//         key === 'price_sgd'
//           ? 'PRICE'
//           : key.toUpperCase().replace(/_/g, ' ')
//       )
//   }

//   const headers = getHeaders(data)

//   // ✅ RENDER ROW VALUES DYNAMICALLY
//   const renderRowValues = (item, headers) => {
//     return headers.map((header, index) => {
//       let key =
//         header === 'PRICE'
//           ? 'price_sgd'
//           : header.toLowerCase().replace(/ /g, '_')

//       let value = item[key]

//       // formatting
//       if (key === 'duration_hours' && value)
//         value = `${value} hrs`

//       if (key === 'duration_minutes' && value)
//         value = `${value} mins`

//       return (
//         <Text key={index} style={styles.cell}>
//           {value ? `${key === 'price_sgd' ? '$' : ''}${value}` : '-'}
//         </Text>
//       )
//     })
//   }

//   // ✅ MULTI SELECT
//   const toggleSelection = (row, index) => {
//     const exists = selectedItems.find(i => i.id === index)

//     if (exists) {
//       setSelectedItems(selectedItems.filter(i => i.id !== index))
//     } else {
//       setSelectedItems([...selectedItems, { ...row, id: index }])
//     }
//   }

//   // ✅ ADD TO BASKET
// const addToBasket = () => {
//   navigation.navigate('Main', {
//     screen: 'Basket',
//     params: {
//       items: selectedItems,
//     },
//   })
// }
//   return (
//     <ScrollView style={styles.container}>
//       {/* IMAGE */}
//       <Image
//         source={{
//           uri:
//             item.icon_url 
//         }}
//         style={styles.image}
//       />

//       <View style={styles.content}>
//         {/* TITLE */}
//         <Text style={styles.title}>
//           {parsed?.package_name || 'Package'}
//         </Text>

//         {/* HORIZONTAL SCROLL FOR TABLE */}
//         <ScrollView horizontal>
//           <View>
//             {/* HEADER */}
//             {headers.length > 0 && (
//               <View style={styles.tableHeader}>
//                 <View style={{ width: 30 }} />
//                 {headers.map((h, i) => (
//                   <Text key={i} style={styles.headerText}>
//                     {h}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             {/* ROWS */}
//             {data.map((row, index) => {
//               const isSelected = selectedItems.some(
//                 i => i.id === index
//               )

//               return (
//                 <TouchableOpacity
//                   key={index}
//                   style={[
//                     styles.row,
//                     isSelected && styles.selectedRow,
//                   ]}
//                   onPress={() => toggleSelection(row, index)}
//                 >
                

//                   {/* DYNAMIC CELLS */}
//                   {renderRowValues(row, headers)}

//                     {/* CHECKBOX */}
//                   <View style={styles.checkbox}>
//                     <Text style={{ color: '#2563eb' }}>
//                       {isSelected ? '✓' : ''}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//               )
//             })}
//           </View>
//         </ScrollView>

//         {/* ADD TO BASKET */}
//         {selectedItems.length > 0 && (
//           <TouchableOpacity
//             style={styles.cartBtn}
//             onPress={addToBasket}
//           >
//             <Text style={styles.cartText}>
//               Add {selectedItems.length} packages to Basket
//             </Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </ScrollView>
//   )
// }

// export default PackageDetail

// // 🎨 STYLES
// const styles = StyleSheet.create({
//   container: { flex: 1 },

//   image: { width: '100%', height: 220 },

//   content: {
//     backgroundColor: '#fff',
//     marginTop: -20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 16,
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },

//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#e5e7eb',
//     padding: 10,
//     borderRadius: 10,
//   },

//   headerText: {
//     minWidth: 100,
//     fontSize: 11,
//     fontWeight: 'bold',
//     color: '#2563eb',
//   },

//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderColor: '#e5e7eb',
//   },

//   selectedRow: {
//     backgroundColor: '#dbeafe',
//     borderRadius: 10,
//   },

//   checkbox: {
//     width: 24,
//     height: 24,
//     borderWidth: 1,
//     borderColor: '#2563eb',
//     marginRight: 6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 4,
//     padding: 4
//   },

//   cell: {
//     minWidth: 100,
//     fontSize: 12,
//     color: '#374151',
//   },

//   cartBtn: {
//     marginTop: 20,
//     backgroundColor: '#2563eb',
//     padding: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//   },

//   cartText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// })

import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'

const PackageDetail = ({ route }) => {
  const { item } = route.params
  const navigation = useNavigation()

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

  // ✅ DYNAMIC HEADERS
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
        <Text key={index} style={styles.cell}>
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

  // ✅ ADD TO BASKET
  const addToBasket = () => {
    navigation.navigate('Main', {
      screen: 'Basket',
      params: {
        items: selectedItems,
      },
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* IMAGE */}
        <Image
          source={{ uri: item.view_images_url }}
          style={styles.image}
        />

        <View style={styles.content}>
          {/* TITLE */}
          <Text style={styles.title}>
            {parsed?.package_name || 'Package'}
          </Text>

          {/* TABLE */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* HEADER */}
              {headers.length > 0 && (
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, { width: 40 }]} />
                  {headers.map((h, i) => (
                    <Text key={i} style={styles.headerText}>
                      {h}
                    </Text>
                  ))}
                </View>
              )}

              {/* ROWS */}
              {data.map((row, index) => {
                const isSelected = selectedItems.some(
                  i => i.id === index
                )

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.rowCard,
                      isSelected && styles.selectedRow,
                    ]}
                    onPress={() =>
                      toggleSelection(row, index)
                    }
                  >
                    {/* CHECKBOX */}
                    <View style={styles.checkbox}>
                      <Text style={styles.checkText}>
                        {isSelected ? '✓' : ''}
                      </Text>
                    </View>

                    {/* CELLS */}
                    <View style={{ flexDirection: 'row' }}>
                      {renderRowValues(row, headers)}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* ADD TO BASKET BUTTON */}
      {selectedItems.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={addToBasket}
          >
            <Text style={styles.cartText}>
              Add {selectedItems.length} items to Basket
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default PackageDetail

// 🎨 STYLES
const styles = StyleSheet.create({
  container: { flex: 1 },

  image: {
    width: '100%',
    height: 220,
  },

  content: {
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },

  headerText: {
    width: 110,
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },

  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  selectedRow: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },

  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },

  checkText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },

  cell: {
    width: 110,
    fontSize: 13,
    color: '#111827',
  },

  bottomBar: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },

  cartBtn: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  cartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})