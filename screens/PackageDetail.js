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
    if (parsed.pricing_options?.option_b) return parsed.pricing_options.option_b

    return []
  }

  const data = getDataArray(parsed)

  // ✅ DYNAMIC HEADERS FROM API KEYS
  const getHeaders = (data) => {
    if (!data.length) return []

    const sample = data[0]

    return Object.keys(sample)
      .filter(
        key =>
          key !== 'payment_type' // ignore internal field
      )
      .map(key =>
        key === 'price_sgd'
          ? 'PRICE'
          : key.toUpperCase().replace(/_/g, ' ')
      )
  }

  const headers = getHeaders(data)

  // ✅ RENDER ROW VALUES DYNAMICALLY
  const renderRowValues = (item, headers) => {
    return headers.map((header, index) => {
      let key =
        header === 'PRICE'
          ? 'price_sgd'
          : header.toLowerCase().replace(/ /g, '_')

      let value = item[key]

      // formatting
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

  // ✅ MULTI SELECT
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
    <ScrollView style={styles.container}>
      {/* IMAGE */}
      <Image
        source={{
          uri:
            item.icon_url ||
            'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542',
        }}
        style={styles.image}
      />

      <View style={styles.content}>
        {/* TITLE */}
        <Text style={styles.title}>
          {parsed?.package_name || 'Package'}
        </Text>

        {/* HORIZONTAL SCROLL FOR TABLE */}
        <ScrollView horizontal>
          <View>
            {/* HEADER */}
            {headers.length > 0 && (
              <View style={styles.tableHeader}>
                <View style={{ width: 30 }} />
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
                    styles.row,
                    isSelected && styles.selectedRow,
                  ]}
                  onPress={() => toggleSelection(row, index)}
                >
                  {/* CHECKBOX */}
                  <View style={styles.checkbox}>
                    <Text style={{ color: '#2563eb' }}>
                      {isSelected ? '✓' : ''}
                    </Text>
                  </View>

                  {/* DYNAMIC CELLS */}
                  {renderRowValues(row, headers)}
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>

        {/* ADD TO BASKET */}
        {selectedItems.length > 0 && (
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={addToBasket}
          >
            <Text style={styles.cartText}>
              Add {selectedItems.length} packages to Basket
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

export default PackageDetail

// 🎨 STYLES
const styles = StyleSheet.create({
  container: { flex: 1 },

  image: { width: '100%', height: 220 },

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
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: 10,
    borderRadius: 10,
  },

  headerText: {
    minWidth: 100,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563eb',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  selectedRow: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#2563eb',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  cell: {
    minWidth: 100,
    fontSize: 12,
    color: '#374151',
  },

  cartBtn: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  cartText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})