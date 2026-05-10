import React, { useState, useContext, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL } from '../components/variable'
import { Ionicons } from '@expo/vector-icons'

const Notes = ({ route, navigation }) => {
    const {
        token,
        selectedAddress,
        setSelectedAddress,
        addresses,
        setAddresses,
    } = useContext(AuthContext)

    const appointmentData = route?.params?.appointmentData || []
    const [notes, setNotes] = useState('')

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`${REACT_APP_HOST_API_URL}/api/address/list/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            const result = await res.json()

            if (res.status === 200) {
                setAddresses(result.data || [])
                if (result.data?.length > 0 && !selectedAddress) {
                    setSelectedAddress(result.data[0])
                }
            }
        } catch (err) {
            console.log('ADDRESS FETCH ERROR:', err)
        }
    }

    useEffect(() => {
        if (token) fetchAddresses()
    }, [token])

    const handleSubmit = () => {
        if (appointmentData.length === 0) {
            Alert.alert('Error', 'No appointment data found')
            return
        }

        if (!selectedAddress) {
            Alert.alert('Error', 'Please select address')
            return
        }

        navigation.navigate('Payment', {
            appointmentData,
            notes,
            selectedAddress,
        })
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* HEADER */}
                    <View className="mb-8 items-center">
                        <Text className="text-2xl font-bold text-primary">
                            Notes
                        </Text>
                        <Text className="text-gray-500 mt-2 text-center">
                            Add instructions for a smoother experience
                        </Text>
                    </View>

                    {/* ADDRESS CARD */}
                    <View className="bg-white rounded-2xl p-4 mb-5">
                        <Text className="text-lg font-semibold mb-4">
                            📍 Select Address
                        </Text>

                        {addresses.map((item) => {
                            const isSelected = selectedAddress?.id === item.id
                            const iconColor = isSelected ? '#4f46e5' : '#6b7280'

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => setSelectedAddress(item)}
                                    className={`p-4 mb-3 rounded-xl border ${
                                        isSelected
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    <View className="gap-2">

                                        {/* NAME */}
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name="person-circle-outline"
                                                size={18}
                                                color={iconColor}
                                            />
                                            <Text className="ml-2 text-[15px] font-bold text-gray-900">
                                                {item.name}
                                            </Text>
                                        </View>

                                        {/* ADDRESS */}
                                        <View className="flex-row items-start">
                                            <Ionicons
                                                name="location-outline"
                                                size={18}
                                                color={iconColor}
                                            />
                                            <Text className="ml-2 text-gray-600 flex-1">
                                                {item.address}
                                            </Text>
                                        </View>

                                        {/* PHONE */}
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name="call-outline"
                                                size={16}
                                                color={iconColor}
                                            />
                                            <Text className="ml-2 text-gray-800">
                                                {item.mobile}
                                            </Text>
                                        </View>

                                    </View>
                                </TouchableOpacity>
                            )
                        })}

                        {addresses.length === 0 && (
                            <Text className="text-center text-gray-400 mt-2">
                                No addresses found
                            </Text>
                        )}
                    </View>

                    {/* NOTES CARD */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-semibold mb-3">
                            📝 Notes / Instructions
                        </Text>

                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            placeholder="E.g. Please call before arriving..."
                            className="bg-gray-50 p-4 rounded-xl min-h-[140px] border border-gray-200 text-gray-800"
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                {/* BUTTON */}
                <View className="p-4 bg-white border-t border-gray-200">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-indigo-600 p-4 rounded-xl shadow-md"
                    >
                        <Text className="text-white text-center font-bold text-base">
                            Continue to Payment →
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Notes