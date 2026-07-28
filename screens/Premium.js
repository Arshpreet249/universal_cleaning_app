
import React, { useContext, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'
import { ProductContext } from '../context/ProductContext'
import BackButton from '../components/BackButton'

/* ─── Helpers ─── */
const parseDescription = (description) => {
  try {
    return typeof description === 'string' ? JSON.parse(description) : description
  } catch {
    return {}
  }
}

const getPriceValue = (row) => {
  const priceKey = Object.keys(row).find((k) => k.startsWith('price'))
  return priceKey ? row[priceKey] : null
}

// const getStartingPrice = (pricing = []) => {
//   if (!pricing.length) return null
//   const prices = pricing
//     .map((row) => {
//       const raw = getPriceValue(row)
//       if (raw == null) return null
//       if (typeof raw === 'number') return raw
//       return parseFloat(String(raw).split(/[–-]/)[0])
//     })
//     .filter((v) => v != null && !isNaN(v))
//   if (!prices.length) return null
//   return Math.min(...prices)
// }

const getStartingPrice = (details = {}) => {
  const items = details.pricing || details.sub_packages || []

  if (!items.length) return null

  const prices = items
    .map((row) => {
      const raw =
        row.price_sgd ??
        row.price_per_session_sgd ??
        row.price_per_visit_sgd ??
        getPriceValue(row)

      if (raw == null) return null

      if (typeof raw === 'number') return raw

      return parseFloat(String(raw).split(/[–-]/)[0])
    })
    .filter((v) => v != null && !isNaN(v))

  return prices.length ? Math.min(...prices) : null
}

const truncate = (text = '', max = 90) =>
  text.length > max ? `${text.slice(0, max).trim()}…` : text

/* ─── Premium Card (redesigned — full-bleed hero with glass footer) ─── */
const PremiumCard = ({ item, onPress }) => {
  const details = parseDescription(item.description)
  // const startingPrice = getStartingPrice(details.pricing)
  const startingPrice = getStartingPrice(details)
  const desc = details.description?.[0] || ''
  const imageUrl = item.view_images_url || item.icon_url
  const sessionCount = details.pricing?.[0]?.total_sessions

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        borderRadius: 26,
        marginBottom: 20,
        overflow: 'hidden',
        backgroundColor: '#0F172A',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 6,
      }}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={{ width: '100%', height: 260 }}
        imageStyle={{ borderRadius: 26 }}
      >
        {/* Gold corner ribbon */}
        <View style={{ position: 'absolute', top: 16, left: 0 }}>
          <LinearGradient
            colors={['#FDE68A', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: 14,
              paddingRight: 16,
              paddingVertical: 7,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 4,
            }}
          >
            <Ionicons name="diamond" size={12} color="#78350F" style={{ marginRight: 5 }} />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#78350F', letterSpacing: 0.6 }}>
              PREMIUM
            </Text>
          </LinearGradient>
        </View>

        {/* Session count chip, top-right */}
        {sessionCount && (
          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(255,255,255,0.16)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.35)',
              borderRadius: 16,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
              {sessionCount} sessions
            </Text>
          </View>
        )}

        {/* Bottom glass panel */}
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.55)', 'rgba(15,23,42,0.96)']}
          locations={[0, 0.45, 1]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 18,
            paddingTop: 46,
            paddingBottom: 18,
            borderBottomLeftRadius: 26,
            borderBottomRightRadius: 26,
          }}
        >
          <Text
            style={{ fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.2 }}
            numberOfLines={1}
          >
            {details.package_name}
          </Text>

          <Text
            style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 17, marginTop: 6 }}
            numberOfLines={2}
          >
            {truncate(desc)}
          </Text>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 }} />

          {/* Footer: price + CTA */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {startingPrice != null ? (
              <View>
                <Text style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', fontWeight: '600', letterSpacing: 0.4 }}>
                  STARTS FROM
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 1 }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: '#FBBF24' }}>
                    ${startingPrice}
                  </Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginLeft: 4, marginBottom: 3 }}>
                    SGD
                  </Text>
                </View>
              </View>
            ) : (
              <View />
            )}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 22,
              }}
            >
              <Text style={{ color: '#0F172A', fontSize: 12.5, fontWeight: '800', marginRight: 6 }}>
                View Details
              </Text>
              <Ionicons name="arrow-forward" size={13} color="#0F172A" />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  )
}

/* ════════════════════════════════════════════════════════════ */
const Premium = () => {
  const { products } = useContext(ProductContext)
  const navigation = useNavigation()

  const premiumPackages = useMemo(() => {
    return products.filter((item) => item.is_premium && item.status)
  }, [products])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC'}}>
      {/* Header */}
      {/* <View className="px-4 py-2">
        <BackButton />
      </View> */}

      <Text className="text-2xl font-bold text-center mt-4 mb-4 text-primary">
        Premium Packages
      </Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 42 }}
        showsVerticalScrollIndicator={false}
      >
        {premiumPackages.map((item) => (
          <PremiumCard
            key={item.id}
            item={item}
            onPress={() => navigation.navigate('PackageDetail', { item })}
          />
        ))}

        {premiumPackages.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
            }}
          >
            <Ionicons name="star-outline" size={40} color="#CBD5E1" />
            <Text style={{ color: '#94A3B8', marginTop: 10, fontSize: 13 }}>
              No premium packages available.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Premium