import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native'
import * as Location from 'expo-location'
import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL } from '../components/variable'
import Toast from 'react-native-toast-message'

const Address = () => {
  const { token, loading } = useContext(AuthContext)

  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    street: '',
    city: '',
    zip_code: '',
    lat: '',
    lon: '',
  })

  // ================= FETCH =================
//   const fetchAddresses = async () => {
//     if (!token) return
//     console.log("token>>>>>>>>>>",token)

//     try {
//       const res = await fetch(`${REACT_APP_HOST_API_URL}/api/address/list/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       const data = await res.json()
//       console.log("data>>>>>>>>>", data)

//       if (data.status === 200) {
//         setAddresses(data.data)
//         if (data.data.length > 0) {
//           setSelectedAddress(data.data[0])
//         }
//       } else {
//        console.log("failed to fetch address, ")
//       }
//     } catch (err) {
//       console.log("error", error)
//     }
//   }

const fetchAddresses = async () => {
  if (!token) {
    console.log(" No token");
    return;
  }

  try {
    console.log(" Calling API...");

    const res = await fetch(
      `${REACT_APP_HOST_API_URL}/api/address/list/`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(" Status:", res.status);

    const data = await res.json();
    console.log(" Response:", data);

    // ✅ Use HTTP status (more reliable)
    if (res.status === 200) {
      setAddresses(data.data || []);

      if (data.data && data.data.length > 0) {
        setSelectedAddress(data.data[0]);
      }
    } else {
      console.log(" API Error:", data);
    }

  } catch (err) {
    console.log(" Fetch Error:", err);
  }
};

  useEffect(() => {
    if (!loading && token) {
      fetchAddresses()
    }
  }, [loading, token])

  // ================= LOCATION =================
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Location permission is required',
        })
        return
      }

      const location = await Location.getCurrentPositionAsync({})

      setForm((prev) => ({
        ...prev,
        lat: location.coords.latitude.toString(),
        lon: location.coords.longitude.toString(),
      }))
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Unable to fetch location',
      })
    }
  }

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.name || !form.mobile || !form.street) {
      Toast.show({
        type: 'info',
        text1: 'Missing Fields ⚠️',
        text2: 'Please fill required fields',
      })
      return
    }

    if (!token) return

    try {
      setSaving(true)

      const endpoint = editingId
        ? `${REACT_APP_HOST_API_URL}/api/address/${editingId}/update/`
        : `${REACT_APP_HOST_API_URL}/api/address/add/`

      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          mobile: form.mobile,
          address: `${form.street}, ${form.city}`,
          zip_code: form.zip_code,
          lat: form.lat,
          lon: form.lon,
        }),
      })

      const data = await res.json()

      if (data.status === 200) {
        Toast.show({
          type: 'success',
          text1: editingId ? 'Updated ✅' : 'Added ✅',
          text2: data.message || 'Address saved successfully',
        })

        setShowForm(false)
        setEditingId(null)

        setForm({
          name: '',
          mobile: '',
          street: '',
          city: '',
          zip_code: '',
          lat: '',
          lon: '',
        })

        fetchAddresses()
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error ❌',
          text2: data.message || 'Failed to save address',
        })
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Network Error 🌐',
        text2: 'Something went wrong',
      })
    } finally {
      setSaving(false)
    }
  }

  // ================= EDIT =================
  const handleEdit = (addr) => {
    const parts = addr.address?.split(',') || []

    setForm({
      name: addr.name,
      mobile: addr.mobile,
      street: parts[0] || '',
      city: parts[1]?.trim() || '',
      zip_code: addr.zip_code,
      lat: addr.lat,
      lon: addr.lon,
    })

    setEditingId(addr.id)
    setShowForm(true)
  }

  // ================= DELETE =================
  const handleDelete = (id) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!token || !deleteId) return

    try {
      const res = await fetch(
        `${REACT_APP_HOST_API_URL}/api/address/${deleteId}/delete/`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await res.json()

      if (data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Deleted 🗑️',
          text2: data.message || 'Address removed successfully',
        })

        fetchAddresses()
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error ❌',
          text2: data.message || 'Failed to delete',
        })
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Network Error 🌐',
        text2: 'Something went wrong',
      })
    } finally {
      setShowDeleteModal(false)
      setDeleteId(null)
    }
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // ================= UI =================
  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold text-blue-600 mb-4 text-center">
        Your Address
      </Text>

      <View className="bg-white rounded-2xl p-4 shadow">
        <Text className="text-lg font-semibold mb-3">Service Address</Text>

        {addresses.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedAddress(item)}
            className={`border rounded-xl p-4 mb-3 ${
              selectedAddress?.id === item.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <View
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedAddress?.id === item.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-400'
                  }`}
                />
                <Text className="font-bold text-base">{item.name}</Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Text className="text-blue-500 font-medium">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text className="text-red-500 font-medium">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-gray-600 mt-2">{item.address}</Text>
            <Text className="text-gray-700 mt-2">📞 {item.mobile}</Text>
          </TouchableOpacity>
        ))}

        {!showForm && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            className="border border-blue-500 py-3 rounded-lg mt-2"
          >
            <Text className="text-blue-500 text-center font-semibold">
              + Add New Address
            </Text>
          </TouchableOpacity>
        )}

        {showForm && (
          <View className="mt-4">
            {[
              { key: 'name', placeholder: 'Full Name' },
              { key: 'mobile', placeholder: 'Mobile Number' },
              { key: 'street', placeholder: 'Street' },
              { key: 'city', placeholder: 'Town/Area' },
              { key: 'zip_code', placeholder: 'Zip Code' },
            ].map((field) => (
              <TextInput
                key={field.key}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChangeText={(text) =>
                  setForm({ ...form, [field.key]: text })
                }
                className="border border-gray-300 p-3 rounded-lg mb-3 bg-gray-50"
              />
            ))}

            <TouchableOpacity
              onPress={getLocation}
              className="border border-blue-500 py-3 rounded-lg mb-3"
            >
              <Text className="text-blue-500 text-center font-semibold">
                Use Current Location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-blue-500 py-3 rounded-lg mb-3"
            >
              <Text className="text-white text-center font-semibold">
                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Address'
                  : 'Save Address'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="border border-gray-400 py-3 rounded-lg"
            >
              <Text className="text-gray-600 text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* PREMIUM DELETE MODAL */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full bg-white rounded-3xl p-6 shadow-xl">

            <View className="items-center mb-3">
              <View className="bg-red-100 p-4 rounded-full">
                <Text className="text-2xl">🗑️</Text>
              </View>
            </View>

            <Text className="text-lg font-bold text-center mb-2">
              Delete Address?
            </Text>

            <Text className="text-gray-500 text-center mb-5">
              This action cannot be undone.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-300 py-3 rounded-xl"
              >
                <Text className="text-center font-semibold text-gray-600">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmDelete}
                className="flex-1 bg-red-500 py-3 rounded-xl"
              >
                <Text className="text-center font-semibold text-white">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

export default Address