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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const Auth = () => {
  const navigation = useNavigation()

  const [step, setStep] = useState('login') // login | register | otp | forgot | reset
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: ''
  })

  const [otp, setOtp] = useState('')
  const [resetData, setResetData] = useState({
    email: '',
    otp_code: '',
    new_password: '',
    confirm_password: ''
  })

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // ================= REGISTER =================
  const handleRegister = async () => {
    if (formData.password !== formData.confirm_password) {
      return Alert.alert('Error', 'Passwords do not match')
    }

    setLoading(true)
    try {
      const res = await fetch(`${REACT_APP_HOST_API_URL}/auth/create-user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'User' })
      })

      const data = await res.json()

      if (res.ok) {
        Alert.alert('Success', 'OTP sent to email')
        setStep('otp')
      } else {
        Alert.alert('Error', data.error)
      }
    } catch {
      Alert.alert('Error', 'Registration failed')
    }
    setLoading(false)
  }

  // ================= LOGIN =================
  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${REACT_APP_HOST_API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.username || formData.email,
          password: formData.password
        })
      })

      const data = await res.json()

      if (res.ok) {
        Alert.alert('Success', 'Login successful')
        navigation.navigate('Home')
      } else {
        Alert.alert('Error', data.error)
      }
    } catch {
      Alert.alert('Error', 'Login failed')
    }
    setLoading(false)
  }

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${REACT_APP_HOST_API_URL}/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp_code: Number(otp)
        })
      })

      const data = await res.json()

      if (res.ok) {
        Alert.alert('Success', 'Account verified')
        setStep('login')
      } else {
        Alert.alert('Error', data.error)
      }
    } catch {
      Alert.alert('Error', 'OTP failed')
    }
    setLoading(false)
  }

  return (
    <KeyboardAwareScrollView
         enableOnAndroid
  extraScrollHeight={20}
  keyboardShouldPersistTaps="handled">
   
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* IMAGE HEADER */}
      <Image
        source={require('../assets/images/login.webp')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* CARD */}
      <View style={styles.card}>
        
        <Text style={styles.title}>
          {step === 'login' ? 'Welcome Back' :
           step === 'register' ? 'Sign Up' :
           'Verify OTP'}
        </Text>

        {/* LOGIN */}
        {step === 'login' && (
          <>
            <TextInput
              placeholder="Email / Username"
              style={styles.input}
              onChangeText={(t) => handleChange('username', t)}
            />

            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              onChangeText={(t) => handleChange('password', t)}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              {loading ? <ActivityIndicator color="#fff" /> :
                <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={{ color: '#6B7280' }}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => setStep('register')}>
                <Text style={styles.signinText}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* REGISTER */}
        {step === 'register' && (
          <>
            <TextInput placeholder="Email" style={styles.input}
              onChangeText={(t) => handleChange('email', t)}
            />

            <TextInput placeholder="Username" style={styles.input}
              onChangeText={(t) => handleChange('username', t)}
            />

            <TextInput placeholder="Phone Number" style={styles.input}
              keyboardType="phone-pad"
              onChangeText={(t) => handleChange('mobile', t)}
            />

            <TextInput placeholder="Password" secureTextEntry style={styles.input}
              onChangeText={(t) => handleChange('password', t)}
            />

            <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input}
              onChangeText={(t) => handleChange('confirm_password', t)}
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              {loading ? <ActivityIndicator color="#fff" /> :
                <Text style={styles.buttonText}>Create Account</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={{ color: '#6B7280' }}>Already have an account?</Text>
              <TouchableOpacity onPress={() => setStep('login')}>
                <Text style={styles.signinText}> Login</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* OTP */}
        {step === 'otp' && (
          <>
            <TextInput
              placeholder="Enter OTP"
              style={styles.input}
              keyboardType="numeric"
              onChangeText={setOtp}
            />

            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
              {loading ? <ActivityIndicator color="#fff" /> :
                <Text style={styles.buttonText}>Verify OTP</Text>}
            </TouchableOpacity>
          </>
        )}

      </View>
    </ScrollView>
     </KeyboardAwareScrollView>
  )
}

export default Auth

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

