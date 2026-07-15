import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from './screens/Home'
import Bookings from './screens/Bookings'
import Basket  from './screens/Basket'
import Profile from './screens/Profile'

import TabBar from './components/TabBar'
import Premium from './screens/Premium'


const Tab = createBottomTabNavigator()

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Booking" component={Bookings} />
        <Tab.Screen name='Premium' component={Premium}/>
      <Tab.Screen name="Basket" component={Basket} />
      <Tab.Screen name="Profile" component={Profile} />
    
    </Tab.Navigator>
  )
}