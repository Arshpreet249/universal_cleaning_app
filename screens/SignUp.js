import React from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

const SignUp = () => {
  const navigation = useNavigation()

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
          zIndex: 10,
          padding: 8,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',

        }}
      >
        <Ionicons name="arrow-back" size={22} color="#0096c7" />
      </TouchableOpacity>

      {/* Top Image */}
      <Image
        source={require('../assets/images/login.webp')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Form Card */}
      <View style={styles.card}>

        <Text style={styles.title}>Sign Up</Text>

        {/* Email */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        {/* Name */}
        <TextInput
          placeholder="Name"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          keyboardType="phone-pad"
          maxLength={10}
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
        />

        {/* Confirm Password */}
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
        />

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        {/* Footer */}
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