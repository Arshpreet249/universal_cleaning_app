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

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'


export default function Profile() {
  const navigation = useNavigation()
  const { user, token, logout } = useContext(AuthContext)

  // console.log(user)
  // console.log('token::', token)


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

        <Text className="text-2xl font-bold my-5  text-primary text-center">
          Profile
        </Text>

         {!token ? (
          <MenuItem
            icon={require('../assets/icons/signin.png')}
            title="Login / Register"
            subtitle="Access or create your account"
            onPress={() => navigation.navigate('Auth')}
          />
        ) : (
          <>
            {/* USER HEADER */}
            <View className=" flex-row items-center justify-between">
              <View className= 'p-4'>
                <Text className="text-lg font-semibold text-gray-800">
                Welcome 👋 {user?.user?.full_name || 'User'}
              </Text>
              <Text className="text-sm text-gray-500">
                Manage your account & orders
              </Text>
              </View>
             
              

            </View>

            <MenuItem
              icon={require('../assets/icons/address.png')}
              title="Address"
              subtitle="View and edit profile"
              onPress={() => navigation.navigate('Address')}
            />

            <MenuItem
              icon={require('../assets/icons/payment.png')}
              title="Payment History"
              subtitle="All Payment Transactions"
               onPress={() => navigation.navigate('PaymentTransaction')}
            />
            <MenuItem
              icon={require('../assets/icons/coin.png')}
              title="Coin History"
              subtitle="All Coin Transactions"
               onPress={() => navigation.navigate('CoinTransaction')}
            />

            <MenuItem
              icon={require('../assets/icons/logout.png')}
              title="Logout"
              danger
              onPress={logout}
            />
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}