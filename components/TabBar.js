import React, { useContext } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AuthContext } from '../context/AuthContext'

const TabBar = ({ state, navigation }) => {
  
  const { cartCount } = useContext(AuthContext)

  const iconMap = {
    Home: 'home',
    Booking: 'calendar',
     Premium: 'diamond',
    Basket: 'basket', // ✅ FIXED
    Profile: 'person',
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isActive = state.index === index

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => navigation.navigate(route.name)}
            >
              <View style={{ position: 'relative' }}>
                <Ionicons
                  name={iconMap[route.name]}
                  size={22}
                  color={isActive ? '#0096c7' : '#999'}
                />

                {/* 🔥 BADGE */}
                {route.name === 'Basket' && cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default TabBar

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    width: '95%',
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
    elevation: 5,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    color: '#999',
  },
  activeLabel: {
    color: '#000',
    fontWeight: '600',
  },

  // 🔥 BADGE STYLE
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
})