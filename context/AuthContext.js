// import React, { createContext, useState, useEffect } from 'react'
// import AsyncStorage from '@react-native-async-storage/async-storage'

// export const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [token, setToken] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [cartCount, setCartCount] = useState(0)
//   const [basketItems, setBasketItems] = useState([])
//   const [selectedAddress, setSelectedAddress] = useState(null)
//   const [addresses, setAddresses] = useState([])

//   // Load user from storage
//   useEffect(() => {
//     const loadUser = async () => {
//       const storedUser = await AsyncStorage.getItem('user')
//       const storedBasket = await AsyncStorage.getItem('basket')
//       const storedAddress = await AsyncStorage.getItem('selectedAddress')

//       if (storedUser) {
//         const parsedUser = JSON.parse(storedUser) // ✅ parse first

//         setUser(parsedUser)
//         setToken(parsedUser?.access_token) // ✅ direct access
//       }
//       if (storedBasket) {
//         const parsedBasket = JSON.parse(storedBasket)
//         setBasketItems(parsedBasket)
//         setCartCount(parsedBasket.length)
//       }
//       setLoading(false)
//       if (storedAddress) {
//         setSelectedAddress(JSON.parse(storedAddress))
//       }
//     }
//     loadUser()
//   }, [])


//   // ✅ Persist cart
//   useEffect(() => {
//     AsyncStorage.setItem('basket', JSON.stringify(basketItems))
//     setCartCount(basketItems.length)
//   }, [basketItems])

//   useEffect(() => {
//     if (selectedAddress) {
//       AsyncStorage.setItem(
//         'selectedAddress',
//         JSON.stringify(selectedAddress)
//       )
//     }
//   }, [selectedAddress])
//   // Logout
//   const logout = async () => {
//     // await AsyncStorage.removeItem('user')
//     // await AsyncStorage.removeItem('basket')
//      await AsyncStorage.multiRemove([
//     'user',
//     'basket',
//     'selectedAddress'
//   ])

//     setUser(null)
//     setToken(null)
//     setBasketItems([])
//     setCartCount(0)
//      setSelectedAddress(null)
//      setAddresses([])

//   }

//   return (
//     <AuthContext.Provider value={{
//       user,
//       token,
//       setUser,
//       setToken,
//       logout,
//       loading,
//       setCartCount,
//       cartCount,
//       basketItems,
//       setBasketItems,
//       selectedAddress,
//       setSelectedAddress,
//       addresses,
//       setAddresses,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'

export const AuthContext = createContext()

// ✅ CHECK TOKEN EXPIRY
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token)
    
    return decoded.exp * 1000 < Date.now()
  } catch (error) {
    // console.log('JWT ERROR:', error)
    return true
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const [basketItems, setBasketItems] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [addresses, setAddresses] = useState([])

  // 🔥 LOAD USER + CHECK TOKEN
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user')
        const storedBasket = await AsyncStorage.getItem('basket')
        const storedAddress = await AsyncStorage.getItem('selectedAddress')

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          const savedToken = parsedUser?.access_token

          // ✅ CHECK EXPIRY HERE
          if (savedToken && !isTokenExpired(savedToken)) {
            setUser(parsedUser)
            setToken(savedToken)
          } else {
            // console.log('Token expired → logging out')

            await AsyncStorage.multiRemove([
              'user',
              'basket',
              'selectedAddress'
            ])

            setUser(null)
            setToken(null)
          }
        }

        if (storedBasket) {
          const parsedBasket = JSON.parse(storedBasket)
          setBasketItems(parsedBasket)
          setCartCount(parsedBasket.length)
        }

        if (storedAddress) {
          setSelectedAddress(JSON.parse(storedAddress))
        }

      } catch (error) {
        console.log('LOAD USER ERROR:', error)
      }

      setLoading(false)
    }

    loadUser()
  }, [])

  // ✅ Persist cart
  useEffect(() => {
    AsyncStorage.setItem('basket', JSON.stringify(basketItems))
    setCartCount(basketItems.length)
  }, [basketItems])

  // ✅ Persist address
  useEffect(() => {
    if (selectedAddress) {
      AsyncStorage.setItem(
        'selectedAddress',
        JSON.stringify(selectedAddress)
      )
    }
  }, [selectedAddress])

  // 🔥 LOGOUT
  const logout = async () => {
    await AsyncStorage.multiRemove([
      'user',
      'basket',
      'selectedAddress'
    ])

    setUser(null)
    setToken(null)
    setBasketItems([])
    setCartCount(0)
    setSelectedAddress(null)
    setAddresses([])
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      setUser,
      setToken,
      logout,
      loading,
      setCartCount,
      cartCount,
      basketItems,
      setBasketItems,
      selectedAddress,
      setSelectedAddress,
      addresses,
      setAddresses,
    }}>
      {children}
    </AuthContext.Provider>
  )
}