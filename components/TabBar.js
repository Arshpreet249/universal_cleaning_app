
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Basket from '../screens/Basket'

const TabBar = ({ state, navigation }) => {

  const iconMap = {
    Home: 'home',
    Booking: 'calendar',
    Basket : 'basket',
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
              <Ionicons
                name={iconMap[route.name]}
                size={22}
                color={isActive ? '#0096c7' : '#999'}
              />

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

    elevation: 5, // Android shadow
  },
  tab: {
    alignItems: 'center',
    flex: 1, // ✅ evenly spaced
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
})