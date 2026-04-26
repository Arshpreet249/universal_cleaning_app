import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from storage
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user')
      if (storedUser) {
         const parsedUser = JSON.parse(storedUser) // ✅ parse first

        setUser(parsedUser)
        setToken(parsedUser?.access_token) // ✅ direct access
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  // Logout
  const logout = async () => {
    await AsyncStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}