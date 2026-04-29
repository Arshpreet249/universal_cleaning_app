import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
const [cartCount, setCartCount] = useState(0)
const [basketItems, setBasketItems] = useState([])

  // Load user from storage
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user')
       const storedBasket = await AsyncStorage.getItem('basket')
      if (storedUser) {
         const parsedUser = JSON.parse(storedUser) // ✅ parse first

        setUser(parsedUser)
        setToken(parsedUser?.access_token) // ✅ direct access
      }
        if (storedBasket) {
          const parsedBasket = JSON.parse(storedBasket)
          setBasketItems(parsedBasket)
          setCartCount(parsedBasket.length)
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


  // Logout
  const logout = async () => {
    await AsyncStorage.removeItem('user')
     await AsyncStorage.removeItem('basket')

    setUser(null)
    setToken(null)
    setBasketItems([])
    setCartCount(0)
  }

  return (
    <AuthContext.Provider value={{ user, 
    token,
     setUser, 
     setToken,
      logout,
       loading ,
       setCartCount,
       cartCount,
        basketItems, 
        setBasketItems    }}>
      {children}
    </AuthContext.Provider>
  )
}