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

   // ✅ GET STARTING PRICE
  const getStartingPrice = (data) => {
    if (!data || data.length === 0) return null

    let prices = data
      .map(item => {
        let price = item.price_sgd

        // handle range like "590–650"
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

  // ✅ NAVIGATE
  const addToBasket = () => {
    navigation.navigate('Main', {
      screen: 'Basket',
      params: {
        items: selectedItems,
      },
    })
  }

  // =========================
  // 🔥 EXTRA UI FUNCTIONS
  // =========================

  const SectionTitle = ({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  )

  const renderList = (data) => {
    if (!data) return null

    return data.map((item, index) => (
      <Text key={index} style={styles.listItem}>
        • {typeof item === 'string' ? item : item.description || '-'}
      </Text>
    ))
  }

  const renderTerms = (terms) => {
    if (!terms) return null

    return terms.map((item, index) => (
      <View key={index} style={{ marginBottom: 10 }}>
        <Text style={styles.termHeading}>{item.heading || item.condition}</Text>

        {Array.isArray(item.description)
          ? item.description.map((d, i) => (
              <Text key={i} style={styles.listItem}>
                • {d}
              </Text>
            ))
          : (
            <Text style={styles.listItem}>
              • {item.description}
            </Text>
          )}
      </View>
    ))
  }

  const renderRefund = (refund) => {
    if (!refund) return null

    return Object.entries(refund).map(([key, value], index) => (
      <Text key={index} style={styles.listItem}>
        • {key.replace(/_/g, ' ').toUpperCase()} : {value}
      </Text>
    ))
  }

  return (
    <View style={{ flex: 1, }}>
      <ScrollView style={styles.container}>
        {/* IMAGE */}
        <Image source={{ uri: item.view_images_url}} style={styles.image} />

        <View style={styles.content}>
          {/* TITLE */}
          <Text style={styles.title}>
            {parsed?.package_name || 'Package'}
          </Text>

           {/* 🔥 STARTING PRICE UI */}
          {startingPrice && (
            <View style={styles.priceContainer}>
              <View>
                <Text style={styles.startingText}>Starting from</Text>
                <Text style={styles.price}>
                  ${startingPrice}
                  <Text style={styles.per}> /hr(s)</Text>
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
                : <Text style={styles.listItem}>{parsed.description}</Text>}
            </>
          )}

          {/* TABLE */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {headers.length > 0 && (
                <View style={styles.tableHeader}>
                  <Text style={{ width: 40 }} />
                  {headers.map((h, i) => (
                    <Text key={i} style={styles.headerText}>
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
                    style={[
                      styles.rowCard,
                      isSelected && styles.selectedRow,
                    ]}
                    onPress={() => toggleSelection(row, index)}
                  >
                    <View style={styles.checkbox}>
                      <Text style={styles.checkText}>
                        {isSelected ? '✓' : ''}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                      {renderRowValues(row, headers)}
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
                <View key={i} style={{ marginBottom: 10 }}>
                  <Text style={styles.termHeading}>
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
    color: '#2563eb',
    
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

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#2563eb',
    
  },

  listItem: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 18,
     backgroundColor: '#f1f5f9',
     padding: 12,
     borderRadius: 12
  },

  termHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 4,
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
    priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  startingText: {
    fontSize: 12,
    color: '#6b7280',
  },
    price: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2563eb',
  },

  per: {
    fontSize: 14,
    color: '#6b7280',
  },
  scopeImage: {
  width: '100%',
  height: 180,
},

imageCard: {
  marginTop: 12,
  borderRadius: 14,
  overflow: 'hidden',
  elevation: 3,
  backgroundColor: '#fff',
},
})