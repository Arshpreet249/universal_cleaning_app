import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const TabBar = () => {
  const tabs = [
    { name: 'Home', icon: 'home' },
    { name: 'Booking', icon: 'calendar' },
    { name: 'Chat', icon: 'chatbubble-ellipses' },
    { name: 'Profile', icon: 'person' },
  ]

  const activeTab = 'Home'

  return (
    <View className="absolute bottom-0 w-full items-center">
      
      <View className="flex-row justify-between bg-white w-[95%] mb-4 px-6 py-3 rounded-full shadow-lg">

        {tabs.map((tab, index) => {
          const isActive = tab.name === activeTab

          return (
            <TouchableOpacity key={index} className="items-center">
              
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? '#0096c7' : '#999'}
              />

              <Text
                className={`text-xs mt-1 ${
                  isActive ? 'text-black font-semibold' : 'text-gray-400'
                }`}
              >
                {tab.name}
              </Text>

            </TouchableOpacity>
          )
        })}

      </View>

    </View>
  )
}

export default TabBar