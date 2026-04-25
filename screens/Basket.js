import React, { useState, useMemo, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'

const Basket = ({ route }) => {
  const [items, setItems] = useState([])

  // ✅ LOAD & MERGE ITEMS
  useEffect(() => {
    if (route.params?.items) {
      const newItems = route.params.items.map((item, index) => ({
        ...item,
        id: item.id ?? index,
        quantity: 1,
      }))

      setItems(prev => {
        const merged = [...prev]

        newItems.forEach(newItem => {
          const exists = merged.find(i => i.id === newItem.id)
          if (!exists) merged.push(newItem)
        })

        return merged
      })
    }
  }, [route.params])

  // ✅ QTY FUNCTIONS
  const increaseQty = (id) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  const decreaseQty = (id) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    )
  }

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  // ✅ TOTAL
  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.price_sgd || item.price || 0)
      return sum + price * item.quantity
    }, 0)
  }, [items])

  // ✅ RENDER ITEM
  const renderItem = ({ item }) => (
    <View style={styles.card}>

      {/* IMAGE */}
      <Image
        source={{
          uri:
            item.package_image ||
            item.image ||
            'https://via.placeholder.com/100',
        }}
        style={styles.image}
      />

      {/* CONTENT */}
      <View style={{ flex: 1 }}>
        
        {/* PACKAGE NAME */}
        <Text style={styles.title}>
          {item.package_name || 'Package'}
        </Text>

        {/* UNIT TYPE */}
        {item.unit_type && (
          <Text style={styles.subText}>
            {item.unit_type}
          </Text>
        )}

        {/* PRICE */}
        <Text style={styles.price}>
          ${item.price_sgd || item.price}
        </Text>

        {/* QTY + REMOVE */}
        <View style={styles.bottomRow}>
          
          {/* QTY */}
          <View style={styles.qtyContainer}>
            <TouchableOpacity onPress={() => decreaseQty(item.id)}>
              <Text style={styles.qtyBtn}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>
              {item.quantity}
            </Text>

            <TouchableOpacity onPress={() => increaseQty(item.id)}>
              <Text style={styles.qtyBtn}>＋</Text>
            </TouchableOpacity>
          </View>

          {/* REMOVE */}
          <TouchableOpacity onPress={() => removeItem(item.id)}>
            <Text style={styles.remove}>Remove</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Your cart is empty 🛒
          </Text>
        }
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>
            ${total.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>
            Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Basket

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    elevation: 3,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
  },

  subText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 4,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  qtyBtn: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },

  qtyText: {
    fontSize: 16,
    marginHorizontal: 6,
  },

  remove: {
    color: '#ef4444',
    fontWeight: '500',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
  },

  total: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  checkoutBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  empty: {
    textAlign: 'center',
    marginTop: 80,
    fontSize: 16,
    color: '#6b7280',
  },
})  