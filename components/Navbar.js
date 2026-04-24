// import React from 'react'
// import { View, Image, TouchableOpacity, TextInput } from 'react-native'
// import { useNavigation } from '@react-navigation/native'

// const Navbar = () => {
//   const navigation = useNavigation()

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
//           elevation: 3
//         }}>
//           <Image
//             source={require('../assets/images/logo.png')}
//             style={{ width: 40, height: 40, marginRight: 6 }}
//           />

//           <TextInput placeholder="Search for services" style={{ flex: 1 }} />

//           <Image
//             source={require('../assets/images/search.png')}
//             style={{ width: 20, height: 20 }}
//           />
//         </View>

//         {/* User Icon */}
//         <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
//           <Image
//             source={require('../assets/icons/user1.png')}
//             style={{ width: 32, height: 32 ,marginLeft: 6}}
//           />
//         </TouchableOpacity>

//       </View>
//     </View>
//   )
// }

// export default Navbar


import React from 'react'
import { View, Image, TextInput } from 'react-native'

const Navbar = () => {
  return (
    <View style={{ paddingTop: 40, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>

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

      </View>
    </View>
  )
}

export default Navbar