// import React from 'react'
// import { NavigationContainer } from '@react-navigation/native'
// import { createNativeStackNavigator } from '@react-navigation/native-stack'
// import { StatusBar } from 'expo-status-bar'
// import { SafeAreaProvider } from 'react-native-safe-area-context'
// import Home from './screens/Home'
// import AllPackages from './screens/AllPackages'
// import SignIn from './screens/SignIn'
// import SignUp from './screens/SignUp'
// import Menu from './screens/Menu'
// import BackButton from './components/BackButton'
// const Stack = createNativeStackNavigator()

// export default function App() {
//   return (
//        <SafeAreaProvider>
//     <NavigationContainer>
//       <Stack.Navigator 
//       screenOptions={{ headerShown: false }}>
        

//         <Stack.Screen name="Home" component={Home} />
//         <Stack.Screen name="Menu" component={Menu} />
//         <Stack.Screen name="AllPackages" component={AllPackages} />
//         <Stack.Screen name="SignIn" component={SignIn} />
//         <Stack.Screen name="SignUp" component={SignUp} />

//       </Stack.Navigator>

//       <StatusBar style="auto" />
//     </NavigationContainer>
//     </SafeAreaProvider>
//   )
// }

import React from 'react'
import { Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Screens
import Home from './screens/Home'
import AllPackages from './screens/AllPackages'
import SignIn from './screens/SignIn'
import SignUp from './screens/SignUp'
import Menu from './screens/Menu'
import Auth from './screens/Auth'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>

        <Stack.Navigator
          screenOptions={{
            // ✅ Platform correct alignment
            headerTitleAlign: Platform.OS === 'ios' ? 'center' : 'left',

            // ✅ Back arrow color
            headerTintColor: Platform.OS === 'ios' ? '#007AFF' : '#000',

            // ✅ Remove "Back" text
            headerBackTitleVisible: false,

            // ✅ Android layout fix (NO extra space)
            ...(Platform.OS === 'android' && {
              headerShadowVisible: false,
              headerStyle: {
                elevation: 0,
                height: 70
              }
            }),

            animation: 'slide_from_right'
          }}
        >

          {/* HOME */}
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>

          {/* SCREENS */}
          <Stack.Screen name="Menu" component={Menu} options={{ title: 'My Account' }}/>

          <Stack.Screen name="AllPackages" component={AllPackages} options={{ title: 'Packages' }}/>

          {/* <Stack.Screen name="SignIn" component={SignIn} options={{ title: 'Sign In' }}/>

          <Stack.Screen name="SignUp" component={SignUp} options={{ title: 'Sign Up' }}/> */}
          <Stack.Screen name='Auth' component={Auth} options={{title: 'Authentication'}} />

        </Stack.Navigator>

        <StatusBar style="auto" />

      </NavigationContainer>
    </SafeAreaProvider>
  )
}