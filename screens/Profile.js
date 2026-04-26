import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

export default function Profile() {
  const navigation = useNavigation()

  const isLoggedIn = false // replace later

  const MenuItem = ({ icon, title, subtitle, onPress, danger }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-gray-50 p-4 rounded-xl mb-3 shadow-sm"
    >
      <Image source={icon} className="w-10 h-10 mr-3" />

      <View className="flex-1">
        <Text className={`text-base font-semibold ${danger ? 'text-red-500' : 'text-black'}`}>
          {title}
        </Text>

        {subtitle && (
          <Text className="text-xs text-gray-500 mt-1">
            {subtitle}
          </Text>
        )}
      </View>

      <Text className="text-lg text-gray-400">›</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text className="text-2xl font-bold my-5  text-primary">
          Profile
        </Text>

        {!isLoggedIn ? (
          <MenuItem
            icon={require('../assets/icons/signin.png')}
            title="Login / Register"
            subtitle="Access or create your account"
            onPress={() => navigation.navigate('Auth')}
          />
        ) : (
          <>
            <TouchableOpacity className="p-4">
              <Text>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-4">
              <Text>My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-4">
              <Text>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-4">
              <Text className="text-red-500">Logout</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}