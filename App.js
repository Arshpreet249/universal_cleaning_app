import React from 'react'
import { Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import MainTabs from './MainTabs'
import { ProductProvider } from './context/ProductContext'

import PackageDetail from './screens/PackageDetail'
import Auth from './screens/Auth'
import AllPackages from './screens/AllPackages'
import "./global.css"
import { AuthProvider } from './context/AuthContext'
import Address from './screens/Address'
import Toast from 'react-native-toast-message';
import BookAppointment from './screens/BookAppointment'
import Welcome from './screens/Welcome'
import Notes from './screens/Notes'
import Payment from './screens/Payment'
const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ProductProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerTitleAlign: Platform.OS === 'ios' ? 'center' : 'left',
                headerTintColor: Platform.OS === 'ios' ? '#007AFF' : '#000',
                headerBackTitleVisible: false,
                headerShown: false,

                ...(Platform.OS === 'android' && {
                  headerShadowVisible: false,
                  headerStyle: { elevation: 0, height: 70 }
                }),

                animation: 'slide_from_right'
              }}
            >
              <Stack.Screen
                name="Welcome"
                component={Welcome}
              />
              {/* MAIN APP (TABS) */}
              <Stack.Screen
                name="Main"
                component={MainTabs}
                options={{ headerShown: false }}
              />

              {/* OTHER SCREENS */}
              <Stack.Screen name="PackageDetail" component={PackageDetail} options={{ title: 'Packages' }} />
              <Stack.Screen name="Auth" component={Auth} options={{ title: 'Authentication' }} />
              <Stack.Screen name='AllPackages' component={AllPackages} options={{ title: 'Allpackages' }} />
              <Stack.Screen name='Address' component={Address} options={{ title: 'Address' }} />
              <Stack.Screen name='BookAppointment' component={BookAppointment} options={{ title: 'BookAppointment' }} />
              <Stack.Screen name='Notes' component={Notes} options={{title:'Notes'}}/>
              <Stack.Screen name='Payment' component={Payment} options={{title: 'payment'}}/>
            </Stack.Navigator>
            <Toast />
            <StatusBar style="auto" />
          </NavigationContainer>
        </ProductProvider>
      </SafeAreaProvider>

    </AuthProvider>
  )
}