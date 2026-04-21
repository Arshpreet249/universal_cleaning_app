import React from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'


const SignIn = () => {
  const navigation = useNavigation()

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
       

      {/* Top Image */}
      <Image
        source={require('../assets/images/signin.webp')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Form Card */}
      <View style={styles.card}>

        <Text style={styles.title}>Sign In</Text>

        {/* Email */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          keyboardType="email-address"
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
        />

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ color: '#6B7280' }}>Don't have an account?</Text>
          <TouchableOpacity  onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}> Sign Up</Text>
          </TouchableOpacity>
        </View>

      </View>

    </ScrollView>
  )
}

export default SignIn

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

  forgot: {
    alignItems: 'flex-end',
    marginBottom: 10
  },

  forgotText: {
    color: '#0096c7',
    fontSize: 13
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15
  },

  signupText: {
    color: '#0096c7',
    fontWeight: '600'
  }
})