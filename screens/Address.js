// import React, { useEffect, useState, useContext } from 'react'
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Modal,
// } from 'react-native'
// import * as Location from 'expo-location'
// import { AuthContext } from '../context/AuthContext'
// import { REACT_APP_HOST_API_URL } from '../components/variable'
// import { SafeAreaView } from 'react-native-safe-area-context'

// const Address = () => {
//   const { token,
//     loading,
//     addresses,
//     setAddresses,
//     selectedAddress,
//     setSelectedAddress, } = useContext(AuthContext)

//   // const [addresses, setAddresses] = useState([])
//   // const [selectedAddress, setSelectedAddress] = useState(null)
//   const [locLoading, setLocLoading] = useState(false)
//   const [showForm, setShowForm] = useState(false)
//   const [editingId, setEditingId] = useState(null)
//   const [saving, setSaving] = useState(false)

//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [deleteId, setDeleteId] = useState(null)

//   const [form, setForm] = useState({
//     name: '',
//     mobile: '',
//     street: '',
//     city: '',
//     zip_code: '',
//     lat: '',
//     lon: '',
//   })

//   // ================= FETCH =================
//   const fetchAddresses = async () => {
//     if (!token) return

//     try {
//       const res = await fetch(
//         `${REACT_APP_HOST_API_URL}/api/address/list/`,
//         {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       )

//       const data = await res.json()

//       if (res.status === 200) {
//         setAddresses(data.data || [])
//         // if (data.data?.length > 0) {
//         //   setSelectedAddress(data.data[0])
//         // }
//         if (data.data?.length > 0 && !selectedAddress) {
//           setSelectedAddress(data.data[0])
//         }
//       }
//     } catch (err) { }
//   }

//   useEffect(() => {
//     if (!loading && token) {
//       fetchAddresses()
//     }
//   }, [loading, token])

//   // ================= LOCATION =================

//   const getLocation = async () => {
//     try {
//       setLocLoading(true)
//       let { status } = await Location.getForegroundPermissionsAsync()

//       if (status !== 'granted') {
//         const res = await Location.requestForegroundPermissionsAsync()
//         status = res.status
//       }

//       if (status !== 'granted') {
//         Alert.alert(
//           'Permission required',
//           'Please enable location access in settings'
//         )
//         return
//       }

//       // 2. Get location with better accuracy
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       })

//       console.log('LOCATION:', location)

//       // 3. Set values safely
//       setForm((prev) => ({
//         ...prev,
//         lat: String(location.coords.latitude),
//         lon: String(location.coords.longitude),
//       }))

//     } catch (err) {
//       console.log('LOCATION ERROR:', err)
//       Alert.alert('Error', 'Unable to fetch location')
//     }
//     finally {
//       setLocLoading(false)   // 🔥 stop loading
//     }
//   }

//   // ================= SAVE =================
//   const handleSave = async () => {

//     if (!form.name || !form.mobile || !form.street) {
//       Alert.alert('Error', 'Please fill all required fields')
//       return
//     }
//     if (!token) return

//     try {
//       setSaving(true)

//       const endpoint = editingId
//         ? `${REACT_APP_HOST_API_URL}/api/address/${editingId}/update/`
//         : `${REACT_APP_HOST_API_URL}/api/address/add/`

//       const method = editingId ? 'PUT' : 'POST'

//       const res = await fetch(endpoint, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           name: form.name,
//           mobile: form.mobile,
//           address: `${form.street}, ${form.city}`,
//           zip_code: form.zip_code,
//           ...(form.lat && { lat: form.lat }),
//           ...(form.lon && { lon: form.lon }),
//         }),
//       })

//       const data = await res.json()
//       console.log("data", data)

//       if (data.status === 200) {
//         setShowForm(false)
//         setEditingId(null)

//         setForm({
//           name: '',
//           mobile: '',
//           street: '',
//           city: '',
//           zip_code: '',
//           lat: '',
//           lon: '',
//         })

//         fetchAddresses()
//         setSelectedAddress((prev) => prev)
//       }
//     } catch (err) {
//       console.log(err)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // ================= EDIT =================
//   const handleEdit = (addr) => {
//     const parts = addr.address?.split(',') || []

//     setForm({
//       name: addr.name ? String(addr.name) : '',
//       mobile: addr.mobile ? String(addr.mobile) : '',   // ✅ FIX HERE
//       street: parts[0] || '',
//       city: parts[1]?.trim() || '',
//       zip_code: addr.zip_code ? String(addr.zip_code) : '',
//       lat: addr.lat ? String(addr.lat) : '',
//       lon: addr.lon ? String(addr.lon) : '',
//     })

//     setEditingId(addr.id)
//     setShowForm(true)
//   }

//   // ================= DELETE =================
//   const handleDelete = (id) => {
//     setDeleteId(id)
//     setShowDeleteModal(true)
//   }

//   const confirmDelete = async () => {
//     if (!token || !deleteId) return

//     try {
//       const res = await fetch(
//         `${REACT_APP_HOST_API_URL}/api/address/${deleteId}/delete/`,
//         {
//           method: 'DELETE',
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       )

//       const data = await res.json()

//       if (data.status === 200) {
//         fetchAddresses()
//       }
//     } catch (err) {
//     } finally {
//       setShowDeleteModal(false)
//       setDeleteId(null)
//     }
//   }

//   // ================= LOADING =================
//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" />
//       </View>
//     )
//   }

//   // ================= UI =================
//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       <View className="flex-1 px-4 pb-24">

//         <Text className="text-2xl font-bold text-center mt-4 mb-4 text-primary">
//           Your Address
//         </Text>

//         <ScrollView showsVerticalScrollIndicator={false}>
//           <View className="bg-white rounded-2xl p-4 shadow-sm">
//             <Text className="text-lg font-semibold mb-3">Service Address</Text>

//             {addresses.map((item) => (
//               <TouchableOpacity
//                 key={item.id}
//                 onPress={() => setSelectedAddress(item)}
//                 className={`border rounded-xl p-4 mb-3 ${selectedAddress?.id === item.id
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-gray-200'
//                   }`}
//               >
//                 <View className="flex-row justify-between items-center">
//                   <View className="flex-row items-center gap-2">
//                     <View
//                       className={`w-4 h-4 rounded-full border-2 ${selectedAddress?.id === item.id
//                         ? 'border-blue-500 bg-blue-500'
//                         : 'border-gray-400'
//                         }`}
//                     />
//                     <Text className="font-bold text-base">{item.name}</Text>
//                   </View>

//                   <View className="flex-row gap-3">
//                     <TouchableOpacity onPress={() => handleEdit(item)}>
//                       <Text className="text-blue-500 font-medium">Edit</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity onPress={() => handleDelete(item.id)}>
//                       <Text className="text-red-500 font-medium">Delete</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 <Text className="text-gray-600 mt-2">{item.address}</Text>
//                 <Text className="text-gray-700 mt-2">📞 {item.mobile}</Text>
//                 <Text className="text-gray-500 text-xs mt-2">
//                   📍 {item.lat}, {item.lon}
//                 </Text>

//               </TouchableOpacity>
//             ))}

//             {!showForm && (
//               <TouchableOpacity
//                 onPress={() => setShowForm(true)}
//                 className="border border-blue-500 py-3 rounded-lg mt-2"
//               >
//                 <Text className="text-blue-500 text-center font-semibold">
//                   + Add New Address
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {showForm && (
//               <View className="mt-4">
//                 {[
//                   { key: 'name', placeholder: 'Full Name' },
//                   { key: 'mobile', placeholder: 'Mobile Number' },
//                   { key: 'street', placeholder: 'Street' },
//                   { key: 'city', placeholder: 'Town/Area' },
//                   { key: 'zip_code', placeholder: 'Zip Code' },
//                   { key: 'lat', placeholder: 'Latitude (optional)' },
//                   { key: 'lon', placeholder: 'Longitude (optional)' },
//                 ].map((field) => (
//                   <TextInput
//                     key={field.key}
//                     placeholder={field.placeholder}
//                     value={form[field.key]}
//                     onChangeText={(text) =>
//                       setForm({ ...form, [field.key]: text })
//                     }

//                     editable={field.key === 'lat' || field.key === 'lon' ? false : true}

//                     keyboardType={
//                       field.key === 'lat' ||
//                         field.key === 'lon'
//                         ? 'numeric'
//                         : field.key === 'mobile'
//                           ? 'phone-pad'
//                           : 'default'
//                     }
//                     className="border border-gray-300 p-3 rounded-lg mb-3 bg-gray-50"
//                   />
//                 ))}


//                 <TouchableOpacity
//                   onPress={getLocation}
//                   disabled={locLoading}
//                   className="border border-blue-500 py-3 rounded-lg mb-3 items-center"
//                 >
//                   {locLoading ? (
//                     <ActivityIndicator color="#2563EB" />
//                   ) : (
//                     <Text className="text-blue-500 font-semibold">
//                       Use Current Location
//                     </Text>
//                   )}
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={handleSave}
//                   disabled={saving}
//                   className="bg-blue-500 py-3 rounded-lg mb-3"
//                 >
//                   <Text className="text-white text-center font-semibold">
//                     {saving
//                       ? 'Saving...'
//                       : editingId
//                         ? 'Update Address'
//                         : 'Save Address'}
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={() => {
//                     setShowForm(false)
//                     setEditingId(null)

//                     setForm({
//                       name: '',
//                       mobile: '',
//                       street: '',
//                       city: '',
//                       zip_code: '',
//                       lat: '',
//                       lon: '',
//                     })
//                   }}
//                   className="border border-gray-400 py-3 rounded-lg"
//                 >
//                   <Text className="text-gray-600 text-center font-semibold">
//                     Cancel
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>


//         </ScrollView>

//         {/* DELETE MODAL */}
//         <Modal transparent visible={showDeleteModal} animationType="fade">
//           <View className="flex-1 bg-black/40 justify-center items-center px-6">
//             <View className="w-full bg-white rounded-3xl p-6 shadow-xl">

//               <View className="items-center mb-3">
//                 <View className="bg-red-100 p-4 rounded-full">
//                   <Text className="text-2xl">🗑️</Text>
//                 </View>
//               </View>

//               <Text className="text-lg font-bold text-center mb-2">
//                 Delete Address?
//               </Text>

//               <Text className="text-gray-500 text-center mb-5">
//                 This action cannot be undone.
//               </Text>

//               <View className="flex-row gap-3">
//                 <TouchableOpacity
//                   onPress={() => setShowDeleteModal(false)}
//                   className="flex-1 border border-gray-300 py-3 rounded-xl"
//                 >
//                   <Text className="text-center font-semibold text-gray-600">
//                     Cancel
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={confirmDelete}
//                   className="flex-1 bg-red-500 py-3 rounded-xl"
//                 >
//                   <Text className="text-center font-semibold text-white">
//                     Delete
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//             </View>
//           </View>
//         </Modal>

//       </View>
//     </SafeAreaView>
//   )
// }

// export default Address



import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import * as Location from 'expo-location'
import { AuthContext } from '../context/AuthContext'
import { REACT_APP_HOST_API_URL } from '../components/variable'
import { SafeAreaView } from 'react-native-safe-area-context'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const FIELDS = [
  { key: 'name',     placeholder: 'Full Name',           keyboard: 'default',   editable: true },
  { key: 'mobile',   placeholder: 'Mobile Number',       keyboard: 'phone-pad', editable: true },
  { key: 'street',   placeholder: 'Street',              keyboard: 'default',   editable: true },
  { key: 'city',     placeholder: 'Town / Area',         keyboard: 'default',   editable: true },
  { key: 'zip_code', placeholder: 'Zip Code',            keyboard: 'default',   editable: true },
  { key: 'lat',      placeholder: 'Latitude (auto)',     keyboard: 'numeric',   editable: false },
  { key: 'lon',      placeholder: 'Longitude (auto)',    keyboard: 'numeric',   editable: false },
]

const EMPTY_FORM = { name: '', mobile: '', street: '', city: '', zip_code: '', lat: '', lon: '' }

const Address = () => {
  const {
    token,
    loading,
    addresses,
    setAddresses,
    selectedAddress,
    setSelectedAddress,
  } = useContext(AuthContext)

  const [locLoading, setLocLoading]       = useState(false)
  const [showForm, setShowForm]           = useState(false)
  const [editingId, setEditingId]         = useState(null)
  const [saving, setSaving]               = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId]           = useState(null)
  const [form, setForm]                   = useState(EMPTY_FORM)

  // ── FETCH ──────────────────────────────────────────────
  const fetchAddresses = async () => {
    if (!token) return
    try {
      const res  = await fetch(`${REACT_APP_HOST_API_URL}/api/address/list/`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (res.status === 200) {
        setAddresses(data.data || [])
        if (data.data?.length > 0 && !selectedAddress) setSelectedAddress(data.data[0])
      }
    } catch (err) {}
  }

  useEffect(() => { if (!loading && token) fetchAddresses() }, [loading, token])

  // ── LOCATION ───────────────────────────────────────────
  const getLocation = async () => {
    try {
      setLocLoading(true)
      let { status } = await Location.getForegroundPermissionsAsync()
      if (status !== 'granted') {
        const res = await Location.requestForegroundPermissionsAsync()
        status = res.status
      }
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable location access in settings')
        return
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setForm((prev) => ({
        ...prev,
        lat: String(location.coords.latitude),
        lon: String(location.coords.longitude),
      }))
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch location')
    } finally {
      setLocLoading(false)
    }
  }

  // ── SAVE ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name || !form.mobile || !form.street) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }
    if (!token) return
    try {
      setSaving(true)
      const endpoint = editingId
        ? `${REACT_APP_HOST_API_URL}/api/address/${editingId}/update/`
        : `${REACT_APP_HOST_API_URL}/api/address/add/`
      const res = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name:     form.name,
          mobile:   form.mobile,
          address:  `${form.street}, ${form.city}`,
          zip_code: form.zip_code,
          ...(form.lat && { lat: form.lat }),
          ...(form.lon && { lon: form.lon }),
        }),
      })
      const data = await res.json()
      if (data.status === 200) {
        closeForm()
        fetchAddresses()
        setSelectedAddress((prev) => prev)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setSaving(false)
    }
  }

  // ── EDIT ───────────────────────────────────────────────
  const handleEdit = (addr) => {
    const parts = addr.address?.split(',') || []
    setForm({
      name:     addr.name     ? String(addr.name)     : '',
      mobile:   addr.mobile   ? String(addr.mobile)   : '',
      street:   parts[0]      || '',
      city:     parts[1]?.trim() || '',
      zip_code: addr.zip_code ? String(addr.zip_code) : '',
      lat:      addr.lat      ? String(addr.lat)      : '',
      lon:      addr.lon      ? String(addr.lon)      : '',
    })
    setEditingId(addr.id)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setShowForm(true)
  }

  // ── DELETE ─────────────────────────────────────────────
  const handleDelete = (id) => { setDeleteId(id); setShowDeleteModal(true) }

  const confirmDelete = async () => {
    if (!token || !deleteId) return
    try {
      const res  = await fetch(`${REACT_APP_HOST_API_URL}/api/address/${deleteId}/delete/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.status === 200) fetchAddresses()
    } catch (err) {}
    finally { setShowDeleteModal(false); setDeleteId(null) }
  }

  const closeForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  // ── LOADING ────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  // ── UI ─────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-black text-gray-900">Addresses</Text>
          <Text className="text-xs text-gray-400 mt-1">
            {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
          </Text>
        </View>

        {/* ── Divider ── */}
        <View className="h-px bg-gray-100 mx-6 mb-2" />

        {/* ── Address List ── */}
        <View className="px-6 pt-2">
          {addresses.length === 0 && !showForm && (
            <View className="items-center py-12">
              <Text className="text-4xl mb-3">📍</Text>
              <Text className="text-gray-700 font-semibold text-base">No addresses yet</Text>
              <Text className="text-gray-400 text-sm mt-1 text-center">
                Add a delivery address to get started.
              </Text>
            </View>
          )}

          {addresses.map((item, index) => {
            const isSelected = selectedAddress?.id === item.id
            return (
              <View key={item.id}>
                <TouchableOpacity
                  onPress={() => setSelectedAddress(item)}
                  activeOpacity={0.75}
                >
                  <View className="flex-row items-start py-4">

                    {/* Selection dot */}
                    <View className="mt-0.5 mr-4">
                      <View
                        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                    </View>

                    {/* Content */}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-bold text-gray-900">{item.name}</Text>
                        <View className="flex-row gap-4">
                          <TouchableOpacity onPress={() => handleEdit(item)} hitSlop={8}>
                            <Text className="text-xs font-semibold text-blue-500">Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={8}>
                            <Text className="text-xs font-semibold text-rose-400">Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text className="text-xs text-gray-500 mt-1 leading-4">{item.address}</Text>
                      <Text className="text-xs text-gray-400 mt-1">📞 {item.mobile}</Text>

                      {item.lat && item.lon ? (
                        <Text className="text-xs text-gray-300 mt-1">
                          📍 {item.lat}, {item.lon}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Separator */}
                {index < addresses.length - 1 && (
                  <View className="h-px bg-gray-50 ml-9" />
                )}
              </View>
            )
          })}
        </View>

        {/* ── Add Button ── */}
        {!showForm && (
          <View className="px-6 mt-4 mb-2">
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                setShowForm(true)
              }}
              className="border border-blue-500 py-3.5 rounded-2xl"
            >
              <Text className="text-blue-500 text-center font-semibold text-sm">
                + Add New Address
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Form ── */}
        {showForm && (
          <View className="px-6 mt-4 pb-10">

            {/* ── Divider + label ── */}
            <View className="h-px bg-gray-100 mb-5" />
            <Text className="text-xs tracking-widest text-gray-400 uppercase mb-4">
              {editingId ? 'Edit Address' : 'New Address'}
            </Text>

            {FIELDS.map((field) => (
              <View key={field.key} className="mb-3">
                <Text className="text-xs text-gray-400 mb-1 ml-1">{field.placeholder}</Text>
                <TextInput
                  placeholder={field.placeholder}
                  placeholderTextColor="#d1d5db"
                  value={form[field.key]}
                  onChangeText={(text) => setForm({ ...form, [field.key]: text })}
                  editable={field.editable}
                  keyboardType={field.keyboard}
                  className={`border px-4 py-3 rounded-2xl text-sm text-gray-800 ${
                    field.editable
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-100 bg-gray-50 text-gray-400'
                  }`}
                />
              </View>
            ))}

            {/* Location button */}
            <TouchableOpacity
              onPress={getLocation}
              disabled={locLoading}
              className="border border-blue-400 py-3.5 rounded-2xl mb-3 items-center flex-row justify-center gap-2"
            >
              {locLoading ? (
                <ActivityIndicator color="#2563EB" size="small" />
              ) : (
                <>
                  <Text className="text-base">📍</Text>
                  <Text className="text-blue-500 font-semibold text-sm">
                    Use Current Location
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Save button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-blue-500 py-3.5 rounded-2xl mb-3"
            >
              <Text className="text-white text-center font-bold text-sm">
                {saving ? 'Saving…' : editingId ? 'Update Address' : 'Save Address'}
              </Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={closeForm}
              className="border border-gray-200 py-3.5 rounded-2xl"
            >
              <Text className="text-gray-400 text-center font-semibold text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Delete Modal ── */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full bg-white rounded-3xl p-6 shadow-xl">

            <View className="items-center mb-4">
              <View className="bg-rose-50 w-14 h-14 rounded-full items-center justify-center">
                <Text className="text-2xl">🗑️</Text>
              </View>
            </View>

            <Text className="text-base font-black text-gray-900 text-center mb-1">
              Delete Address?
            </Text>
            <Text className="text-xs text-gray-400 text-center mb-6">
              This action cannot be undone.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-200 py-3 rounded-2xl"
              >
                <Text className="text-center font-semibold text-gray-500 text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                className="flex-1 bg-rose-500 py-3 rounded-2xl"
              >
                <Text className="text-center font-semibold text-white text-sm">Delete</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default Address