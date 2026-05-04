import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const Welcome = () => {
  const navigation = useNavigation()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    // Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start()

    // ⏱ Redirect to Home after 2 sec
    const timer = setTimeout(() => {
      navigation.replace('Main') 
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View className="flex-1 bg-white justify-center items-center">
      
      <Animated.Image
        source={require('../assets/images/horizontal_logo.png')}
        className="w-60 h-60 mb-5"
        resizeMode="contain"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      />


    </View>
  )
}

export default Welcome