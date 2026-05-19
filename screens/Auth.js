import React, { useState, useRef, useContext } from 'react'
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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../context/AuthContext'

const OTP_LENGTH = 6
const Auth = () => {
  const navigation = useNavigation()

  const { user, token, setUser, setToken, logout, setCartCount } = useContext(AuthContext)

  // login | register | otp | forgot | reset
  const [step, setStep] = useState('login')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: ''
  })

  // const [otp, setOtp] = useState('')
  // 🔐 REGISTER OTP
  const [otpArray, setOtpArray] = useState(Array(OTP_LENGTH).fill(''))
  const otpInputs = useRef([])

  // 🔐 RESET OTP
  const [resetOtpArray, setResetOtpArray] = useState(Array(OTP_LENGTH).fill(''))
  const resetInputs = useRef([])

  const [resetData, setResetData] = useState({
    email: '',
    otp_code: '',
    new_password: '',
    confirm_password: ''
  })
  const [referralCode, setReferralCode] = useState('')
  const [referralValid, setReferralValid] = useState(null)
  const [refLoading, setRefLoading] = useState(false)
  const [refUser, setRefUser] = useState(null)

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }


  // ================= OTP HANDLERS =================
  const handleOtpChange = (value, index, type = 'register') => {
    if (!/^[0-9]?$/.test(value)) return

    const array = type === 'register' ? otpArray : resetOtpArray
    const setArray = type === 'register' ? setOtpArray : setResetOtpArray
    const refs = type === 'register' ? otpInputs : resetInputs

    const newOtp = [...array]
    newOtp[index] = value
    setArray(newOtp)

    if (value && index < OTP_LENGTH - 1) {
      refs.current[index + 1].focus()
    }
  }
  const handleKeyPress = (e, index, type = 'register') => {
    const array = type === 'register' ? otpArray : resetOtpArray
    const refs = type === 'register' ? otpInputs : resetInputs

    if (e.nativeEvent.key === 'Backspace' && !array[index] && index > 0) {
      refs.current[index - 1].focus()
    }
  }

  const getOtpValue = () => otpArray.join('')
  const getResetOtpValue = () => resetOtpArray.join('')


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
        body: JSON.stringify({
          ...formData, role: 'User',
          referral_code_input: referralValid ? referralCode.trim() : null
        })
      })

      const data = await res.json()
      // console.log("data>>>>>>>>>>>>>>>>>>>>", data)

      if (res.ok) {
        Alert.alert('Success', 'OTP sent to email')
        setStep('otp')
      } else {
        Alert.alert('Error', data.error)
      }
    } catch {
      // console.log('REGISTER ERROR:', error)
      Alert.alert('Error', 'Registration failed')
    }
    setLoading(false)
  }


  // ================= Verify Refeeral =================
  const handleVerifyReferral = async () => {
    if (!referralCode.trim()) {
      return Alert.alert('Error', 'Enter referral code')
    }

    setRefLoading(true)

    try {
      const res = await fetch(`${REACT_APP_HOST_API_URL}/auth/referral-code-verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referral_code: referralCode.trim()
        })
      })

      const data = await res.json()
      // console.log("REF VERIFY:", data)

      if (res.ok) {
        setReferralValid(true)
        setRefUser(data?.user || null) // if backend returns referrer info

        Alert.alert('Success', data.message || 'Referral applied ')
      } else {
        setReferralValid(false)
        setRefUser(null)

        Alert.alert('Error', data.error || 'Invalid referral code')
      }

    } catch (error) {
      // console.log('REF ERROR:', error)
      Alert.alert('Error', error.message || 'Verification failed')
    }

    setRefLoading(false)
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
      // console.log(res.ok)

      if (res.ok) {
        // Alert.alert('Success', 'Login successful')

        await AsyncStorage.setItem('user', JSON.stringify(data))
        setUser(data)
        setToken(data?.access_token)
        setCartCount(data.user.cart_count)
        // console.log(data)
        navigation.replace('Main', {
          screen: 'Home'
        })

      } else {
        Alert.alert('Error', data.error)
      }
    } catch (error) {
      // console.log('LOGIN ERROR 👉', error)   // 
      Alert.alert('Error', 'Login failed')
    }
    setLoading(false)
  }

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async () => {
    const otpValue = getOtpValue()

    if (otpValue.length !== 6) {
      return Alert.alert('Error', 'Enter complete OTP')
    }

    setLoading(true)
    try {
      const res = await fetch(`${REACT_APP_HOST_API_URL}/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp_code: Number(otpValue)
        })
      })

      const data = await res.json()
      // console.log("data otp", data)

      if (res.ok) {
        Alert.alert('Success', 'Account verified')
        setStep('login')
      } else {
        Alert.alert('Error', data.error)
      }
    } catch {
      Alert.alert('Error', 'OTP failed')
      // console.log('eror', error)
    }
    setLoading(false)
  }


  const handleResendOtp = async () => {
    if (!formData.email) {
      return Alert.alert('Error', 'Email is required')
    }

    setLoading(true)

    try {
      const res = await fetch(`${REACT_APP_HOST_API_URL}/auth/resend-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await res.json()
      // console.log("RESEND OTP:", data)

      if (res.ok) {
        Alert.alert('Success', data.message || "OTP resent successfully")
      } else {
        Alert.alert('Error', data.error || "Failed to resend OTP")
      }

    } catch (error) {
      // console.log("RESEND ERROR:", error)
      Alert.alert('Error', error.message || "Error resending OTP")
    }

    setLoading(false)
  }
  // ================= FORGOT PASSWORD =================
  const handleForgotPassword = async () => {
    if (!resetData.email) {
      return Alert.alert('Error', 'Enter email')
    }

    setLoading(true)
    try {
      const res = await fetch(`${REACT_APP_HOST_API_URL}/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetData.email })
      })

      const data = await res.json()

      if (res.ok) {
        Alert.alert('Success', 'OTP sent')
        setStep('reset')
      } else {
        Alert.alert('Error', data.error)
      }
    } catch {
      Alert.alert('Error', 'Request failed')
    }
    setLoading(false)
  }

  // ================= RESET PASSWORD =================
  const handleResetPassword = async () => {
    const otpValue = getResetOtpValue()

    if (otpValue.length !== 6) {
      return Alert.alert('Error', 'Enter complete OTP')
    }

    if (resetData.new_password !== resetData.confirm_password) {
      return Alert.alert('Error', 'Passwords do not match')
    }

    setLoading(true)
    try {
      const res = await fetch(`${REACT_APP_HOST_API_URL}/auth/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetData.email,
          otp_code: Number(otpValue),
          new_password: resetData.new_password,
           confirm_password: resetData.confirm_password
        })
      })

      const data = await res.json()
      // console.log("reset password", data)

      if (res.ok) {
        Alert.alert('Success', 'Password reset successful')
        setStep('login')
      } else {
        Alert.alert('Error', data.error)
        // console.log(data.error)
      }
    } catch {
      Alert.alert('Error', 'Reset failed')
      // console.log(error)
    }
    setLoading(false)
  }

  return (
    <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={20}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <Image
          source={require('../assets/images/login.webp')}
          style={styles.headerImage}
        />

        <View style={styles.card}>

          <Text style={styles.title}>
            {step === 'login' ? 'Login' :
              step === 'register' ? 'Sign Up' :
                step === 'forgot' ? 'Forgot Password' :
                  step === 'reset' ? 'Reset Password' :
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

              <TouchableOpacity className='bg-primary px-1 py-3 rounded-2xl mt-3 items-center ' onPress={handleLogin}>
                {loading ? <ActivityIndicator color="#fff" /> :
                  <Text style={styles.buttonText}>Login</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('forgot')}>
                <Text className=' text-blue-500 text-center mt-3'
                //  style={{ color: '#2563EB', textAlign: 'center', marginTop: 10 }}
                >Forgot Password?</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text>Don't have an account?</Text>
                <TouchableOpacity onPress={() => setStep('register')}>
                  <Text className='text-blue-500'> Sign Up</Text>
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
              <TextInput placeholder="Phone" style={styles.input}
                onChangeText={(t) => handleChange('mobile', t)}
              />

              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                  <TextInput
                    placeholder="Referral Code (optional)"
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={referralCode}
                    onChangeText={(text) => {
                      setReferralCode(text)
                      setReferralValid(null) // reset on change
                    }}
                  />

                  <TouchableOpacity

                    className='bg-primary ml-2 py-3.5 px-3 rounded-xl'
                    onPress={handleVerifyReferral}
                  >
                    {refLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: '#fff', fontSize: 12 }}>Verify</Text>
                    )}
                  </TouchableOpacity>

                </View>

                {/* STATUS */}
                {referralValid === true && (
                  <Text style={{ color: 'green', marginTop: 5 }}>
                    ✓ Applied {refUser ? `(${refUser.username})` : ''}
                  </Text>
                )}

                {referralValid === false && (
                  <Text style={{ color: 'red', marginTop: 5 }}>
                    ✗ Invalid referral code
                  </Text>
                )}
              </View>
              <TextInput placeholder="Password" secureTextEntry style={styles.input}
                onChangeText={(t) => handleChange('password', t)}
              />
              <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input}
                onChangeText={(t) => handleChange('confirm_password', t)}
              />

              <TouchableOpacity className='bg-primary px-1 py-3 rounded-2xl mt-3 items-center ' onPress={handleRegister}>
                {loading ? <ActivityIndicator color="#fff" /> :
                  <Text style={styles.buttonText}>Create Account</Text>}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text>Already have an account?</Text>

                <TouchableOpacity onPress={() => setStep('login')}>
                  <Text className='text-blue-500'> Login</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* OTP VERIFY */}
          {step === 'otp' && (
            <>
              {/* <TextInput
                placeholder="Enter OTP"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={setOtp}
              /> */}

              <View style={styles.otpContainer}>
                {otpArray.map((digit, index) => (
                  <TextInput
                    key={index}
                    style={styles.otpBox}
                    keyboardType="numeric"
                    maxLength={1}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, index, 'register')}
                    onKeyPress={(e) => handleKeyPress(e, index, 'register')}
                    ref={(ref) => otpInputs.current[index] = ref}
                  />
                ))}
              </View>

              {/* ✅ Spam hint */}
              <Text style={styles.infoText}>
                If you did not receive OTP, please check your spam folder.
              </Text>

              <TouchableOpacity
                className='bg-primary px-1 py-3 rounded-2xl mt-3 items-center'
                onPress={handleVerifyOtp}
              >
                {loading ? <ActivityIndicator color="#fff" /> :
                  <Text style={styles.buttonText}>Verify OTP</Text>}
              </TouchableOpacity>

              {/* RESEND OTP */}
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={loading}
                style={{ marginTop: 15 }}
              >
                <Text style={{
                  color: '#0096c7',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  Didn't receive OTP? RESEND
                </Text>
              </TouchableOpacity>

            </>
          )}

          {/* FORGOT */}
          {step === 'forgot' && (
            <>
              <TextInput
                placeholder="Enter Email"
                style={styles.input}
                onChangeText={(t) =>
                  setResetData(prev => ({ ...prev, email: t }))
                }
              />

              <TouchableOpacity className='bg-primary px-1 py-3 rounded-2xl mt-3 items-center ' onPress={handleForgotPassword}>
                {loading ? <ActivityIndicator color="#fff" /> :
                  <Text style={styles.buttonText}>Send OTP</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                <Text style={{ color: '#2563EB', textAlign: 'center', marginTop: 10 }}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* RESET */}
          {step === 'reset' && (
            <>
              {/* <TextInput
                placeholder="OTP"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(t) =>
                  setResetData(prev => ({ ...prev, otp_code: t }))
                }
              /> */}
              <View style={styles.otpContainer}>
                {resetOtpArray.map((digit, index) => (
                  <TextInput
                    key={index}
                    style={styles.otpBox}
                    keyboardType="numeric"
                    maxLength={1}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, index, 'reset')}
                    onKeyPress={(e) => handleKeyPress(e, index, 'reset')}
                    ref={(ref) => resetInputs.current[index] = ref}
                  />
                ))}
              </View>

              {/* ✅ SAME MESSAGE HERE */}
              <Text style={styles.infoText}>
                If you did not receive OTP, please check your spam folder.
              </Text>

              {/* ✅ RESEND BUTTON */}
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={loading}
                style={{ marginBottom: 10 }}
              >
                <Text style={{
                  color: '#0096c7',
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  Didn't receive OTP? RESEND
                </Text>
              </TouchableOpacity>


              <TextInput
                placeholder="New Password"
                secureTextEntry
                style={styles.input}
                onChangeText={(t) =>
                  setResetData(prev => ({ ...prev, new_password: t }))
                }
              />

              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                style={styles.input}
                onChangeText={(t) =>
                  setResetData(prev => ({ ...prev, confirm_password: t }))
                }
              />

              <TouchableOpacity className='bg-primary px-1 py-3 rounded-2xl mt-3 items-center ' onPress={handleResetPassword}>
                {loading ? <ActivityIndicator color="#fff" /> :
                  <Text style={styles.buttonText}>Reset Password</Text>}
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
    // backgroundColor: '#caf0f8',
    paddingBottom: 20
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
    // elevation: 5
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
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },

  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold'
  },
  infoText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 10
  }

})

