// import React from 'react'
// import { View, Text, Button } from 'react-native'
// import { useNavigation } from '@react-navigation/native'

// export default function Profile() {
//   const navigation = useNavigation()

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Profile Screen</Text>

//       <Button 
//         title="Open Menu"
//         // onPress={() => navigation.navigate('Menu')}
//       />
//     </View>
//   )
// }


import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

export default function Profile() {
  const navigation = useNavigation()

  const isLoggedIn = false // 🔁 replace later with real auth

  const MenuItem = ({ icon, title, subtitle, onPress, danger }) => (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={icon} style={styles.icon} />

      <View style={{ flex: 1 }}>
        <Text style={[styles.title, danger && { color: 'red' }]}>
          {title}
        </Text>

        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.header}>My Account</Text>

        {!isLoggedIn ? (
          <MenuItem
            icon={require('../assets/icons/signin.png')}
            title="Login / Register"
            subtitle="Access or create your account"
            onPress={() => navigation.navigate('Auth')}
          />
        ) : (
          <>
            <TouchableOpacity style={{ padding: 15 }}>
                           <Text>My Profile</Text>
                         </TouchableOpacity>
           
                         <TouchableOpacity style={{ padding: 15 }}>
                           <Text>My Orders</Text>
                         </TouchableOpacity>
           
                         <TouchableOpacity style={{ padding: 15 }}>
                           <Text>Settings</Text>
                         </TouchableOpacity>
           
                        <TouchableOpacity style={{ padding: 15 }}>
                           <Text style={{ color: 'red' }}>Logout</Text>
                        </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
    resizeMode: 'contain'
  },
  title: {
    fontSize: 16,
    fontWeight: '600'
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  arrow: {
    fontSize: 20,
    color: '#9CA3AF'
  }
})