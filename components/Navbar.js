// import React, { useState } from 'react'
// import { View, Image, TouchableOpacity, TextInput, Text, Modal } from 'react-native'
// import { useNavigation } from '@react-navigation/native'

// const Navbar = () => {
//   const navigation = useNavigation()
//   const [menuVisible, setMenuVisible] = useState(false)

//   const [isLoggedIn, setIsLoggedIn] = useState(false)

//   const handleSignOut = () => {
//     setIsLoggedIn(false)
//     setMenuVisible(false)
//   }

//   return (
//     <View style={{ paddingTop: 40, paddingHorizontal: 16 }}>

//       <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

//         {/* Search Bar */}
//         <View style={{
//           flex: 1,
//           backgroundColor: 'white',
//           borderRadius: 50,
//           paddingHorizontal: 12,
//           paddingVertical: 4,
//           flexDirection: 'row',
//           alignItems: 'center',
//           shadowColor: '#000',
//           shadowOpacity: 0.1,
//           shadowRadius: 6,
//           elevation: 3
//         }}>

//           <Image
//             source={require('../assets/images/logo.png')}
//             style={{ width: 40, height: 40, marginRight: 6 }}
//             resizeMode="contain"
//           />

//           <TextInput
//             placeholder="Search for services"
//             style={{ flex: 1, color: '#374151', fontSize: 16 }}
//             placeholderTextColor="#9CA3AF"
//           />

//           <Image
//             source={require('../assets/images/search.png')}
//             style={{ width: 20, height: 20, marginLeft: 8 }}
//             resizeMode="contain"
//           />
//         </View>

//         {/* User Icon */}
//         <TouchableOpacity
//           style={{ marginLeft: 12 }}
//           onPress={() => setMenuVisible(!menuVisible)}
//         >
//           <Image
//             source={require('../assets/icons/user.png')}
//             style={{ width: 32, height: 32 }}
//             resizeMode="contain"
//           />
//         </TouchableOpacity>

//       </View>

//       {/* Dropdown Menu */}
//       <Modal transparent visible={menuVisible} animationType="fade">
//         <TouchableOpacity
//           style={{
//             flex: 1,
//             backgroundColor: 'rgba(0,0,0,0.2)',
//             justifyContent: 'flex-start',
//             alignItems: 'flex-end',
//             paddingTop: 90,
//             paddingRight: 20
//           }}
//           onPress={() => setMenuVisible(false)}
//           activeOpacity={1}
//         >

//           <View style={{
//             backgroundColor: 'white',
//             borderRadius: 10,
//             padding: 10,
//             width: 150,
//             elevation: 5
//           }}>

//             {!isLoggedIn ? (
//               <>
//                 <TouchableOpacity
//                   style={{ padding: 10 }}
//                   onPress={() => {
//                     setMenuVisible(false)
//                     navigation.navigate('SignIn')
//                   }}
//                 >
//                   <Text>Sign In</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={{ padding: 10 }}
//                   onPress={() => {
//                     setMenuVisible(false)
//                     navigation.navigate('SignUp')
//                   }}
//                 >
//                   <Text>Sign Up</Text>
//                 </TouchableOpacity>
//               </>
//             ) : (
//               <TouchableOpacity
//                 style={{ padding: 10 }}
//                 onPress={handleSignOut}
//               >
//                 <Text style={{ color: 'red' }}>Sign Out</Text>
//               </TouchableOpacity>
//             )}

//           </View>
//         </TouchableOpacity>
//       </Modal>

//     </View>
//   )
// }

// export default Navbar

import React from 'react'
import { View, Image, TouchableOpacity, TextInput } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const Navbar = () => {
  const navigation = useNavigation()

  return (
    <View style={{ paddingTop: 40, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Search Bar */}
        <View style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: 50,
          paddingHorizontal: 12,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
          elevation: 3
        }}>
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 40, height: 40, marginRight: 6 }}
          />

          <TextInput placeholder="Search for services" style={{ flex: 1 }} />

          <Image
            source={require('../assets/images/search.png')}
            style={{ width: 20, height: 20 }}
          />
        </View>

        {/* User Icon */}
        <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
          <Image
            source={require('../assets/icons/user.png')}
            style={{ width: 32, height: 32 }}
          />
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default Navbar