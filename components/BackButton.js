import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const BackButton = () => {
  const navigation = useNavigation()

  if (Platform.OS !== 'ios') return null

  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.container}>
      <Text style={styles.text}>‹ Back</Text>
    </TouchableOpacity>
  )
}

export default BackButton

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  text: {
    fontSize: 18,
    color: '#007AFF', 
    fontWeight: '500'
  }
})