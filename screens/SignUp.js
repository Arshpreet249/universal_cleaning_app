import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { REACT_APP_HOST_API_URL } from '../components/variable'

const SignUp = () => {
  const navigation = useNavigation()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleRegister = async () => {
    if (formData.password !== formData.confirm_password) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${REACT_APP_HOST_API_URL}/auth/create-user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          role: 'User'
        })
      })

      const data = await res.json()

      if (res.ok) {
        Alert.alert('Success', data.message || 'Check your email for OTP')
        navigation.navigate('OtpScreen', { email: formData.email }) // optional
      } else {
        Alert.alert('Error', data.error || 'Registration failed')
      }
    } catch (err) {
      console.log(err)
      Alert.alert('Error', 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <Image
        source={require('../assets/images/login.webp')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={formData.username}
          onChangeText={(text) => handleChange('username', text)}
        />

        <TextInput
          placeholder="Phone Number"
          style={styles.input}
          keyboardType="phone-pad"
          maxLength={10}
          value={formData.mobile}
          onChangeText={(text) => handleChange('mobile', text)}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
        />

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
          value={formData.confirm_password}
          onChangeText={(text) => handleChange('confirm_password', text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{ color: '#6B7280' }}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signinText}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

export default SignUp

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8'
  },

  headerImage: {
    width: '100%',
    height: 350,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },

  card: {
    backgroundColor: '#fff',
    marginTop: -30,
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 20,
    elevation: 5
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#3B2F2F'
  },

  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15
  },

  button: {
    backgroundColor: '#0096c7',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 10,
    alignItems: 'center'
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15
  },

  signinText: {
    color: '#0096c7',
    fontWeight: '600'
  }
})

