
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
    ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL, apiBaseUrl } from '../components/variable'

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
    const [loading, setLoading] = useState(false)

    // ================= FETCH ADDRESSES =================
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
            } else {
                console.log('ADDRESS ERROR:', result)
            }
        } catch (err) {
            console.log('ADDRESS FETCH ERROR:', err)
        }
    }

    useEffect(() => {
        if (token) {
            fetchAddresses()
        }
    }, [token])

    // ================= CREATE APPOINTMENT =================
    const handleSubmit = async () => {
        if (appointmentData.length === 0) {
            Alert.alert('Error', 'No appointment data found')
            return
        }

        if (!selectedAddress) {
            Alert.alert('Error', 'Please select address')
            return
        }

        setLoading(true)

        // ✅ FINAL PAYLOAD (MATCHES BACKEND)
        const payload = {
            data: appointmentData.map((item) => ({
                title: "Appointment",
                address: selectedAddress.address,
                // description: `Notes: ${notes || 'N/A'} | Package: ${item.package_names?.join(', ') || 'None'}`,
                description: `Notes: ${notes || 'N/A'}\nPackage: ${item.package_names?.join(', ') || 'None'}`,
                start_date: item.start_date,
                end_date: item.start_date,

                startTime: item.startTime,
                endTime: item.endTime,

                // ✅ REQUIRED
                assigned_to_usernames: item.assigned_to_usernames || [],

                // ✅ LOCATION
                location: {
                    latitude: Number(selectedAddress.lat),
                    longitude: Number(selectedAddress.lon),
                },

                // ✅ IMPORTANT: SEND IDS ONLY
                package: item.package_ids || [],
            })),
        }

        console.log(" FINAL PAYLOAD:", JSON.stringify(payload, null, 2))

        try {
            const res = await fetch(
                `${apiBaseUrl}create-appointment-by-client/`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            )

            const text = await res.text()
            console.log(" RAW RESPONSE:", text)

            let result = null
            try {
                result = JSON.parse(text)
            } catch {
                console.log("Not JSON response")
            }

            console.log("STATUS:", res.status)

            if (res.status === 200 || res.status === 201) {
                navigation.navigate('Payment', {
                    payload,
                    notes,
                    selectedAddress,
                })
            }
            else {
                Alert.alert(
                    'Failed ',
                    result?.message || 'Could not create appointment'
                )
            }

        } catch (err) {
            console.log(" ERROR:", err)
            Alert.alert('Error ', 'Something went wrong')
        }

        setLoading(false)
    }

    // ================= UI =================
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
                    <View className="mb-6">
                        <Text className="text-3xl font-bold text-primary text-center">
                            Additional Notes
                        </Text>
                        <Text className="text-gray-500 mt-2 text-base text-center">
                            Add any instructions for your appointment.
                        </Text>
                    </View>

                    {/* ADDRESS */}
                    <View className="bg-white rounded-2xl p-5 mb-5">
                        <Text className="text-lg font-bold mb-4">
                            Select Address
                        </Text>

                        {addresses.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setSelectedAddress(item)}
                                className={`p-4 mb-3 rounded-xl ${selectedAddress?.id === item.id
                                        ? 'bg-blue-50 border border-blue-500'
                                        : 'border border-gray-200'
                                    }`}
                            >
                                <Text className="font-bold">{item.name}</Text>
                                <Text>{item.address}</Text>
                                <Text>📞 {item.mobile}</Text>
                            </TouchableOpacity>
                        ))}

                        {addresses.length === 0 && (
                            <Text className="text-center text-gray-400">
                                No addresses found
                            </Text>
                        )}
                    </View>

                    {/* NOTES */}
                    <View className="bg-white rounded-2xl p-5">
                        <Text className="text-lg font-bold mb-3">
                            Notes / Instructions
                        </Text>

                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            placeholder="Write your notes..."
                            className="bg-gray-100 p-4 rounded-xl min-h-[150px]"
                        />
                    </View>
                </ScrollView>

                {/* BUTTON */}
                <View className="p-4 bg-white">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className={`p-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-blue-600'
                            }`}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-center font-bold">
                                Create Appointment & Continue
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Notes