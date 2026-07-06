import React, { useContext, useMemo, useState } from 'react'
import { View, Image, TextInput, Text, TouchableOpacity } from 'react-native'
import { ProductContext } from '../context/ProductContext'

const Navbar = () => {
  const [isSearchFocused, setSearchFocused] = useState(false)

  const {
    products,
    searchText,
    setSearchText,
    setFilteredProducts,
  } = useContext(ProductContext)

  const getPackageName = (item) => {
    try {
      return JSON.parse(item.description)?.package_name || ''
    } catch {
      return ''
    }
  }

  const searchSuggestions = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    return products
      .filter((item) => {
        const packageName = getPackageName(item).toLowerCase()
        return query ? packageName.includes(query) : packageName.length > 0
      })
      .slice(0, 6)
  }, [products, searchText])

  const handleSearch = (text) => {
    setSearchText(text)

    const query = text.trim().toLowerCase()

    if (!query) {
      setFilteredProducts([])
      return
    }

    const filtered = products.filter((item) =>
      getPackageName(item).toLowerCase().includes(query)
    )

    setFilteredProducts(filtered)
  }

  const handleSelectSuggestion = (item) => {
    const packageName = getPackageName(item)

    setSearchText(packageName)
    setFilteredProducts([item])
    setSearchFocused(false)
  }

  const clearSearch = () => {
    setSearchText('')
    setFilteredProducts([])
    setSearchFocused(false)
  }

  const showClearButton = isSearchFocused || searchText.trim().length > 0

  return (
    <View style={{ paddingTop: 40, paddingHorizontal: 16, zIndex: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 20 }}>

        {/* Search Bar */}
        <View
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 50,
            paddingHorizontal: 12,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            elevation: 3,
            zIndex: 20,
          }}
        >
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 40, height: 40, marginRight: 6 }}
          />

          <TextInput
            placeholder="Search for services"
            placeholderTextColor="#6B7280"
            value={searchText}
            style={{ flex: 1, color: '#111827' }}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
          />

          {showClearButton ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={clearSearch}
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: '#F1F5F9',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#64748B', fontSize: 17, fontWeight: '900', lineHeight: 20 }}>
                x
              </Text>
            </TouchableOpacity>
          ) : (
            <Image
              source={require('../assets/images/search.png')}
              style={{ width: 20, height: 20 }}
            />
          )}
        </View>
      </View>

      {isSearchFocused && searchSuggestions.length > 0 && (
        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: 92,
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            borderWidth: 1,
            borderColor: '#EEF2F6',
            paddingVertical: 6,
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 18,
            elevation: 8,
            zIndex: 30,
          }}
        >
          {searchSuggestions.map((item, index) => {
            const packageName = getPackageName(item)

            return (
              <TouchableOpacity
                key={item.id || index}
                activeOpacity={0.75}
                onPress={() => handleSelectSuggestion(item)}
                style={{
                  paddingVertical: 11,
                  paddingHorizontal: 14,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: '#F1F5F9',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }} numberOfLines={1}>
                  {packageName}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </View>
  )
}

export default Navbar