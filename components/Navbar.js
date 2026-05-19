
import React, { useContext } from 'react'
import { View, Image, TextInput } from 'react-native'
import { ProductContext } from '../context/ProductContext'

const Navbar = () => {
  // const { searchText, setSearchText } = React.useContext(ProductContext)

  const {
    products,
    setSearchText,
    setFilteredProducts
  } =useContext(ProductContext)

  const handleSearch = (text) => {
    setSearchText(text)

     if (text.trim() === '') {
      setFilteredProducts([])
      return
    } 

    const filtered = products.filter((item) => {
      try{
        const parsed = JSON.parse(item.description)

        return parsed?.package_name?.toLowerCase().includes(text.toLowerCase())

      }catch (e){
        return false
      }
    })

    setFilteredProducts(filtered)
  }

  return (
    <View style={{ paddingTop: 40, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>

        {/* Search Bar */}
        <View style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: 50,
          paddingHorizontal: 12,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
          elevation: 3
        }}>
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 40, height: 40, marginRight: 6 }}
          />

          <TextInput placeholder="Search for services"
           style={{ flex: 1 }} 
           onChangeText={handleSearch}
           />

          <Image
            source={require('../assets/images/search.png')}
            style={{ width: 20, height: 20 }}
          />
        </View>

      </View>
    </View>
  )
}

export default Navbar