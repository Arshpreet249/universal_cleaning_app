import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Home from './screens/Home'
import AllPackages from './screens/AllPackages'
import SignIn from './screens/SignIn'
import SignUp from './screens/SignUp'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
       <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="AllPackages" component={AllPackages} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />

      </Stack.Navigator>

      <StatusBar style="auto" />
    </NavigationContainer>
    </SafeAreaProvider>
  )
}