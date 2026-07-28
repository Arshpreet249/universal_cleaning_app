import React, { useState, useContext, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../context/AuthContext'
import { apiBaseUrl, REACT_APP_HOST_API_URL } from '../components/variable'
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '../components/BackButton'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/* ─── Theme builder: light theme by default, dark+gold for premium packages ─── */
const buildTheme = (isPremium) => ({
  isPremium,
  screenBg: isPremium ? '#2A3348' : '#F0F4FF',
  cardBg: isPremium ? '#333E58' : '#fff',
  cardShadow: isPremium ? '#000' : '#0F172A',
  textPrimary: isPremium ? '#F8FAFC' : '#0F172A',
  textSecondary: isPremium ? '#CBD5E1' : '#64748B',
  textMuted: isPremium ? '#94A3B8' : '#94A3B8',
  heading: isPremium ? '#F8FAFC' : '#1E293B',
  accent: isPremium ? '#FBBF24' : '#2563EB',
  accentDark: isPremium ? '#B45309' : '#1D4ED8',
  accentSoftBg: isPremium ? 'rgba(251,191,36,0.14)' : '#EFF6FF',
  accentSoftBorder: isPremium ? 'rgba(251,191,36,0.4)' : '#BFDBFE',
  border: isPremium ? '#465067' : '#F1F5F9',
  bulletBg: isPremium ? '#3C4763' : '#F8FAFC',
  bulletBorder: isPremium ? '#6B4A17' : '#BFDBFE',
  bulletDot: isPremium ? '#FBBF24' : '#3B82F6',
  tableGradient: isPremium ? ['#B45309', '#FBBF24'] : ['#2563EB', '#3B82F6'],
  tableBorder: isPremium ? '#1E293B' : '#E2E8F0',
  rowSelectedBg: isPremium ? 'rgba(251,191,36,0.12)' : '#EFF6FF',
  rowSelectedBorder: isPremium ? 'rgba(251,191,36,0.35)' : '#BFDBFE',
  checkboxOff: isPremium ? '#8492AC' : '#CBD5E1',
  pillBg: isPremium ? 'rgba(251,191,36,0.16)' : '#EFF6FF',
  pillText: isPremium ? '#FBBF24' : '#2563EB',
  ctaTextOnAccent: isPremium ? '#1F2937' : '#fff',
  badgeLabel: isPremium ? 'PREMIUM PACKAGE' : 'REGULAR PACKAGE',
  addOnStripBg: isPremium ? 'rgba(251,191,36,0.12)' : '#F0F7FF',
})

/* ─── Icon map: matches common service keywords to icons ─── */
const getSectionIcons = (theme) => ({
  'Description': { name: 'document-text-outline', color: theme.accent },
  'Terms & Conditions': { name: 'shield-checkmark-outline', color: theme.isPremium ? '#A78BFA' : '#6366F1' },
  'Deposit Policy': { name: 'wallet-outline', color: '#F59E0B' },
  'Refund Policy': { name: 'return-down-back-outline', color: '#10B981' },
  'Additional Conditions': { name: 'information-circle-outline', color: theme.isPremium ? '#A78BFA' : '#8B5CF6' },
  'Policies': { name: 'lock-closed-outline', color: '#EF4444' },
  'Our Work': { name: 'images-outline', color: theme.accent },
  'Feedback': { name: 'chatbubble-ellipses-outline', color: '#F59E0B' },
})

const SectionIcon = ({ title, theme }) => {
  const cfg = getSectionIcons(theme)[title]
  if (!cfg) return null
  return (
    <View style={{
      width: 32, height: 32, borderRadius: 10,
      backgroundColor: cfg.color + '18',
      alignItems: 'center', justifyContent: 'center',
      marginRight: 8,
    }}>
      <Ionicons name={cfg.name} size={17} color={cfg.color} />
    </View>
  )
}

/* ─── Divider ─── */
const Divider = ({ theme }) => (
  <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 20 }} />
)

/* ─── Section Title ─── */
const SectionTitle = ({ title, theme }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
    <SectionIcon title={title} theme={theme} />
    <Text style={{ fontSize: 16, fontWeight: '700', color: theme.heading, letterSpacing: 0.2 }}>
      {title}
    </Text>
  </View>
)

/* ─── Pill Badge ─── */
const Pill = ({ label, icon, theme }) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.pillBg, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, marginBottom: 8,
  }}>
    {icon && <Ionicons name={icon} size={12} color={theme.pillText} style={{ marginRight: 4 }} />}
    <Text style={{ fontSize: 11, fontWeight: '600', color: theme.pillText }}>{label}</Text>
  </View>
)

/* ─── Bullet card ─── */
const BulletCard = ({ text, theme }) => (
  <View style={{
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: theme.bulletBg, borderRadius: 12,
    padding: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: theme.bulletBorder,
  }}>
    <View style={{
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: theme.bulletDot, marginTop: 5, marginRight: 10, flexShrink: 0,
    }} />
    <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 19, flex: 1 }}>
      {typeof text === 'string' ? text : text.description || '-'}
    </Text>
  </View>
)

/* ─── Gallery Tile ─── */
const GalleryTile = ({ img, height, rounded = 16, style }) => (
  <View style={[{ height, borderRadius: rounded, overflow: 'hidden', backgroundColor: '#E2E8F0' }, style]}>
    <Image source={{ uri: img.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
  </View>
)

/* ─── Feedback Card ─── */
const FeedbackCard = ({ feedback, theme }) => (
  <View style={{
    backgroundColor: theme.bulletBg, borderRadius: 12, padding: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: '#F59E0B',
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: theme.heading, flex: 1 }} numberOfLines={1}>
        {feedback.user_name || feedback.name || 'Anonymous'}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < Math.round(feedback.rating || 0) ? 'star' : 'star-outline'}
            size={12}
            color="#F59E0B"
          />
        ))}
      </View>
    </View>
    {!!feedback.comment && (
      <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 17 }}>
        {feedback.comment}
      </Text>
    )}
    {!!feedback.created_at && (
      <Text style={{ fontSize: 10, color: theme.textMuted, marginTop: 6 }}>
        {new Date(feedback.created_at).toLocaleDateString()}
      </Text>
    )}
  </View>
)

/* ════════════════════════════════════════════════════════════ */
const PackageDetail = ({ route }) => {
  const { item } = route.params
  const navigation = useNavigation()
  const { token, basketItems, setBasketItems } = useContext(AuthContext)
  const [selectedItems, setSelectedItems] = useState([])
  const [packageFeedback, setPackageFeedback] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)

  const isPremium = !!item.is_premium
  const theme = buildTheme(isPremium)

  /* ── Helpers ── */
  const parseDescription = (data) => {
    try { return typeof data === 'string' ? JSON.parse(data) : data } catch { return null }
  }
  const parsed = parseDescription(item.description)

  const getPriceValue = (row) => {
    // Support both price_sgd and price_sgd_per_hour (and any other price_ key)
    const priceKey = Object.keys(row).find(k => k.startsWith('price'))
    if (!priceKey) return null
    return row[priceKey]
  }

  const getMinPrice = (price) => {
    if (!price) return null
    const str = String(price).toLowerCase().trim()
    const cleaned = str.replace(/from/g, '').trim()
    if (cleaned.includes('+')) return parseFloat(cleaned.replace('+', '').trim())
    if (/[–-]/.test(cleaned)) return parseFloat(cleaned.split(/[–-]/)[0])
    return parseFloat(cleaned)
  }

  const getDataArray = (parsed) => {
    if (!parsed) return []
    if (Array.isArray(parsed.pricing)) return parsed.pricing
    if (Array.isArray(parsed.packages)) return parsed.packages
    if (Array.isArray(parsed.sub_packages)) return parsed.sub_packages
    if (parsed.pricing_options?.option_b) return parsed.pricing_options.option_b
    return []
  }
  const data = getDataArray(parsed)

  const rowHasQty = (row) => row?.quantity_enabled === true

  const allowMultiSelect = isAddOn || data.some(rowHasQty)


  const getStartingPrice = (data) => {
    if (!data || data.length === 0) return null
    const prices = data.map(row => {
      const raw = getPriceValue(row)
      if (raw == null) return null
      if (typeof raw === 'number') return raw
      return parseFloat(String(raw).split(/[–-]/)[0])
    }).filter(v => v != null && !isNaN(v))
    if (!prices.length) return null
    return Math.min(...prices)
  }
  const startingPrice = getStartingPrice(data)

  const getHeaders = (data) => {
    if (!data.length) return []
    return Object.keys(data[0])
      .filter(k => k !== 'payment_type'&& k !== 'id' && k !== 'package_id'  && k !== 'validity_in_months' )
      .map(k => k.startsWith('price') ? 'PRICE' : k.toUpperCase().replace(/_/g, ' '))
  }
  const headers = getHeaders(data)
  const isShortTable = headers.length <= 3
  const isAddOn = parsed?.package_name?.toLowerCase().includes('add on') || false

  // const toggleSelection = (row, index) => {
  //   const exists = selectedItems.find(i => i.rowIndex === index)
  //   if (isAddOn) {
  //     setSelectedItems(prev => exists ? prev.filter(i => i.rowIndex !== index) : [...prev, { ...row, rowIndex: index, quantity: 1 }])
  //   } else {
  //     setSelectedItems(exists ? [] : [{ ...row, rowIndex: index, quantity: 1 }])
  //   }
  // }

  const toggleSelection = (row, index) => {
  const exists = selectedItems.find(i => i.rowIndex === index)
  if (allowMultiSelect) {
    setSelectedItems(prev => exists ? prev.filter(i => i.rowIndex !== index) : [...prev, { ...row, rowIndex: index, quantity: 1 }])
  } else {
    setSelectedItems(exists ? [] : [{ ...row, rowIndex: index, quantity: 1 }])
  }
}

  const updateQuantity = (index, type) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.rowIndex !== index) return i
      let qty = i.quantity || 1
      if (type === 'inc') qty++
      if (type === 'dec' && qty > 1) qty--
      return { ...i, quantity: qty }
    }))
  }

  const handleAddToCart = async () => {
    if (selectedItems.length === 0) return
    try {
      if (!token) { Alert.alert('Login Required', 'Please login first!'); return }
      let newItems = []
      for (let row of selectedItems) {
        let price = getMinPrice(getPriceValue(row))
        if (price === null || isNaN(price)) { Alert.alert('Invalid Plan', 'This plan requires a custom quote.'); return }
        price = Number(price)
        const { price_sgd, ...cleanRow } = row
        const qty = row.quantity || 1
        const total = price * qty

        const itemToAdd = {
          package_id: item.id,
          service: parsed?.package_name || 'Package',
          ...cleanRow,
          price,
          quantity: qty,
          totalPrice: total
        }

        console.log('Adding to basket:', itemToAdd)
        
        const res = await fetch(`${REACT_APP_HOST_API_URL}/api/booking/add/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ note: JSON.stringify(itemToAdd), price: itemToAdd.totalPrice, package_id: item.id }),
        })
        const data = await res.json()
        if (data.status !== 200) { Alert.alert('Error', data.message || 'Booking failed'); return }
        newItems.push(itemToAdd)
      }
      setBasketItems([...basketItems, ...newItems])
      navigation.navigate('Main', { screen: 'Basket' })
    } catch { Alert.alert('Error', 'Something went wrong!') }
  }

  /* ── Fetch feedback for this package ── */
  useEffect(() => {
    let isMounted = true
    const fetchFeedback = async () => {
      setFeedbackLoading(true)
      try {
        const res = await fetch(`${REACT_APP_HOST_API_URL}/api/booking/feedback/?package_id=${item.id}`)
        const json = await res.json()
        const list = Array.isArray(json?.results)
          ? json.results
          : Array.isArray(json)
            ? json
            : []
        if (isMounted) setPackageFeedback(list)
      } catch {
        if (isMounted) setPackageFeedback([])
      } finally {
        if (isMounted) setFeedbackLoading(false)
      }
    }
    fetchFeedback()
    return () => { isMounted = false }
  }, [item.id])

  const renderList = (data) => {
    if (!data) return null
    return data.map((item, i) => <BulletCard key={i} text={item} theme={theme} />)
  }

  const renderTerms = (terms) => {
    if (!terms) return null
    return terms.map((item, i) => (
      <View key={i} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Ionicons name="chevron-forward-circle" size={15} color={theme.isPremium ? '#A78BFA' : '#6366F1'} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.heading }}>
            {item.heading || item.condition}
          </Text>
        </View>
        {Array.isArray(item.description)
          ? item.description.map((d, j) => <BulletCard key={j} text={d} theme={theme} />)
          : <BulletCard text={item.description} theme={theme} />}
      </View>
    ))
  }

  const renderRefund = (refund) => {
    if (!refund) return null
    return Object.entries(refund).map(([key, value], i) => (
      <View key={i} style={{
        flexDirection: 'row', justifyContent: 'space-between',
        backgroundColor: theme.bulletBg, borderRadius: 12, padding: 12, marginBottom: 8,
        borderLeftWidth: 3, borderLeftColor: '#10B981',
      }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary, flex: 1 }}>
          {key.replace(/_/g, ' ').toUpperCase()}
        </Text>
        <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '600', flex: 1, textAlign: 'right' }}>
          {value}
        </Text>
      </View>
    ))
  }

  /* ─── Selected total for non-addon ─── */
  const cartTotal = selectedItems.reduce((sum, i) => sum + (getMinPrice(getPriceValue(i)) || 0) * (i.quantity || 1), 0)

  /* ──────────────────────── RENDER ──────────────────────── */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.screenBg }}>
      <StatusBar barStyle={isPremium ? 'light-content' : 'dark-content'} />

      {/* ── Floating Back Button ── */}
      <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? 52 : 26, left: 16, zIndex: 99 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: isPremium ? 'rgba(17,26,46,0.85)' : 'rgba(255,255,255,0.92)',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12, shadowRadius: 8, elevation: 5,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={isPremium ? '#F8FAFC' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── Hero Image with gradient overlay ── */}
        <View style={{ height: 280, width: '100%', position: 'relative' }}>
          <Image source={{ uri: item.view_images_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', isPremium ? 'rgba(11,17,32,0.9)' : 'rgba(15,23,42,0.72)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 }}
          />
          {/* Category / premium pill on hero */}
          <View style={{ position: 'absolute', top: 18, right: 16 }}>
            {isPremium ? (
              <LinearGradient
                colors={['#FDE68A', '#F59E0B']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
                }}
              >
                <Ionicons name="diamond" size={11} color="#78350F" style={{ marginRight: 5 }} />
                <Text style={{ color: '#78350F', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                  {theme.badgeLabel}
                </Text>
              </LinearGradient>
            ) : (
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
              }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
                  {theme.badgeLabel}
                </Text>
              </View>
            )}
          </View>
          {/* Package name on hero */}
          <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3, lineHeight: 28 }}>
              {parsed?.package_name}
            </Text>
          </View>
        </View>

        {/* ── Main card ── */}
        <View style={{
          backgroundColor: theme.cardBg, marginTop: -20,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120,
          shadowColor: theme.cardShadow, shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isPremium ? 0.3 : 0.06, shadowRadius: 12,
        }}>

          {/* ── Price + Book strip ── */}
          {startingPrice && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: theme.accentSoftBg,
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 14,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.accentSoftBorder,
              }}
            >
              {/* Left Side */}
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: theme.textSecondary,
                    fontWeight: '500',
                    marginBottom: 2,
                  }}
                >
                  Starting from
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: '800',
                      color: theme.accent,
                      lineHeight: 32,
                    }}
                  >
                    ${startingPrice}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.textMuted,
                      marginLeft: 4,
                      marginBottom: 4,
                    }}
                  >
                    SGD
                  </Text>
                </View>

                {/* Package Type */}
                {parsed?.package_type && (
                  <Text
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      lineHeight: 20,
                      color: theme.textSecondary,
                      fontWeight: '600',
                    }}
                  >
                    {parsed.package_type}
                  </Text>
                )}
              </View>

              {/* Right Side */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 6,
                }}
              >
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Ionicons name="star-half" size={14} color="#F59E0B" />

                <Text
                  style={{
                    fontSize: 11,
                    color: theme.textMuted,
                    marginLeft: 4,
                  }}
                >
                  4.8
                </Text>
              </View>
            </View>
          )}



          {/* ── Trust badges ── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <Pill label="Verified Service" icon="shield-checkmark-outline" theme={theme} />
            <Pill label="Instant Booking" icon="flash-outline" theme={theme} />
            <Pill label="Secure Payment" icon="lock-closed-outline" theme={theme} />
            <Pill label="5★ Rated" icon="star-outline" theme={theme} />
          </ScrollView>

          <Divider theme={theme} />



          {/* ── Description ── */}
          {parsed?.description && (
            <>
              <SectionTitle title="Description" theme={theme} />
              {Array.isArray(parsed.description)
                ? renderList(parsed.description)
                : (
                  <View style={{
                    backgroundColor: theme.bulletBg, borderRadius: 14,
                    padding: 14, borderLeftWidth: 3, borderLeftColor: theme.bulletBorder, marginBottom: 8,
                  }}>
                    <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 19 }}>
                      {parsed.description}
                    </Text>
                  </View>
                )}
              <Divider theme={theme} />
            </>
          )}



          {/* ── Package selection ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name={isAddOn ? 'add-circle-outline' : 'radio-button-on-outline'} size={15} color={theme.accent} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>
              {/* {isAddOn ? 'Select one or more add-ons' : 'Select one package to continue'} */}
                {allowMultiSelect ? 'Select one or more items' : 'Select one package to continue'}

            </Text>
          </View>

          {/* ── Pricing Table ── */}
          <ScrollView horizontal={!isShortTable} showsHorizontalScrollIndicator={false}>
            <View style={{
              borderRadius: 16, overflow: 'hidden',
              borderWidth: 1, borderColor: theme.tableBorder,
              width: isShortTable ? SCREEN_WIDTH - 40 : undefined,
              shadowColor: theme.cardShadow, shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isPremium ? 0.25 : 0.06, shadowRadius: 10, elevation: 2,
              backgroundColor: theme.cardBg,
            }}>
              {/* Header row */}
              {headers.length > 0 && (
                <LinearGradient colors={theme.tableGradient} style={{ flexDirection: 'row' }}>
                  <View style={{ width: 44, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)' }} />
                  {headers.map((h, i) => (
                    <View key={i} style={{
                      paddingVertical: 14, paddingHorizontal: 10,
                      alignItems: 'center', justifyContent: 'center',
                      flex: isShortTable ? 1 : undefined,
                      width: isShortTable ? undefined : 120,
                      borderRightWidth: i < headers.length - 1 ? 1 : 0,
                      borderRightColor: 'rgba(255,255,255,0.2)',
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isPremium ? '#1F2937' : '#fff', letterSpacing: 0.5 }}>{h}</Text>
                    </View>
                  ))}
                </LinearGradient>
              )}

              {/* Data rows */}
              {data.map((row, index) => {
                const isSelected = selectedItems.some(i => i.rowIndex === index)
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleSelection(row, index)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      borderTopWidth: 1, borderTopColor: theme.border,
                      backgroundColor: isSelected ? theme.rowSelectedBg : theme.cardBg,
                    }}
                  >
                    {/* Checkbox */}
                    <View style={{
                      width: 44, paddingVertical: 18,
                      alignItems: 'center', justifyContent: 'center',
                      borderRightWidth: 1, borderRightColor: isSelected ? theme.rowSelectedBorder : theme.border,
                    }}>
                      <View style={{
                        width: 22, height: 22, borderRadius: 6,
                        borderWidth: 2, borderColor: isSelected ? theme.accent : theme.checkboxOff,
                        backgroundColor: isSelected ? theme.accent : 'transparent',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <Ionicons name="checkmark" size={13} color={isPremium ? '#1F2937' : '#fff'} />}
                      </View>
                    </View>

                    {/* Values */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row' }}>
                        {headers.map((header, i) => {
                          let key = header === 'PRICE'
                            ? (Object.keys(row).find(k => k.startsWith('price')) || 'price_sgd')
                            : header.toLowerCase().replace(/ /g, '_')
                          let value = row[key]
                          if (key === 'duration_hours' && value) value = `${value} hrs`
                          if (key === 'duration_minutes' && value) value = `${value} mins`
                          const isPrice = key.startsWith('price')
                          return (
                            <View key={i} style={{
                              paddingVertical: 16, paddingHorizontal: 10,
                              alignItems: 'center', justifyContent: 'center',
                              flex: isShortTable ? 1 : undefined,
                              width: isShortTable ? undefined : 120,
                              borderRightWidth: i < headers.length - 1 ? 1 : 0,
                              borderRightColor: isSelected ? theme.rowSelectedBorder : theme.border,
                            }}>
                              <Text style={{
                                fontSize: 13,
                                color: isPrice ? theme.accent : theme.heading,
                                fontWeight: isPrice ? '700' : '400',
                                textAlign: 'center',
                              }}>
                                {value ? `${isPrice ? '$' : ''}${value}` : '—'}
                              </Text>
                            </View>
                          )
                        })}
                      </View>

                      {/* Qty for add-on */}
                      {/* {isAddOn && isSelected && ( */}
                      {(isAddOn || rowHasQty(row)) && isSelected && (

                        <View style={{
                          flexDirection: 'row', alignItems: 'center',
                          justifyContent: 'center', paddingVertical: 10,
                          borderTopWidth: 1, borderTopColor: theme.rowSelectedBorder,
                          backgroundColor: theme.addOnStripBg,
                        }}>
                          <TouchableOpacity
                            onPress={() => updateQuantity(index, 'dec')}
                            style={{
                              width: 32, height: 32, borderRadius: 10,
                              backgroundColor: theme.accentSoftBg, alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Ionicons name="remove" size={16} color={theme.accent} />
                          </TouchableOpacity>
                          <Text style={{ marginHorizontal: 16, fontSize: 15, fontWeight: '700', color: theme.heading }}>
                            {selectedItems.find(i => i.rowIndex === index)?.quantity || 1}
                          </Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(index, 'inc')}
                            style={{
                              width: 32, height: 32, borderRadius: 10,
                              backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Ionicons name="add" size={16} color={isPremium ? '#1F2937' : '#fff'} />
                          </TouchableOpacity>
                          <Text style={{ marginLeft: 14, fontSize: 13, fontWeight: '700', color: theme.accent }}>
                            = ${((selectedItems.find(i => i.rowIndex === index)?.quantity || 1) * (getMinPrice(getPriceValue(row)) || 0)).toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>

          {/* SCOPE OF WORK */}
          {parsed?.scope_of_work && (

            <>
              <Divider theme={theme} />
              <SectionTitle title="Scope of Work" theme={theme} />
              {Object.entries(parsed.scope_of_work).map(([section, items], index) => (
                <View key={index} style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={theme.accent} />
                    <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '700', color: theme.heading, textTransform: 'capitalize' }}>
                      {section.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  {Array.isArray(items) &&
                    items.map((it, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: 'row', backgroundColor: theme.bulletBg, borderRadius: 12,
                          borderLeftWidth: 4, borderLeftColor: theme.bulletBorder,
                          paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8,
                        }}
                      >
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.bulletDot, marginTop: 6, marginRight: 12 }} />
                        <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: theme.textSecondary }}>
                          {it}
                        </Text>
                      </View>
                    ))}
                </View>
              ))}
            </>
          )}

          {/* ── Gallery ── */}
          {item?.multiple_images?.length > 0 && (() => {
            const imgs = item.multiple_images
            const hero = imgs[0]
            const gallery = imgs.slice(1)
            return (
              <View style={{ marginTop: 28 }}>
                <Divider theme={theme} />
                <SectionTitle title="Our Work" theme={theme} />
                {hero && (
                  <View style={{
                    borderRadius: 20, overflow: 'hidden',
                    marginBottom: 10,
                    shadowColor: theme.cardShadow, shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isPremium ? 0.3 : 0.12, shadowRadius: 16, elevation: 4,
                  }}>
                    <GalleryTile img={hero} height={220} rounded={20} />
                  </View>
                )}
                {gallery.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {gallery.map((img, i) => {
                      const isLastOdd = gallery.length % 2 === 1 && i === gallery.length - 1
                      return (
                        <View key={img.id || img.image_url} style={{
                          width: isLastOdd ? '100%' : '48.5%',
                          borderRadius: 14, overflow: 'hidden',
                          shadowColor: theme.cardShadow, shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: isPremium ? 0.25 : 0.08, shadowRadius: 10, elevation: 2,
                        }}>
                          <GalleryTile img={img} height={isLastOdd ? 170 : 132} rounded={14} />
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>
            )
          })()}

          {/* ── Terms ── */}
          {parsed?.terms_and_conditions && (
            <>
              <Divider theme={theme} />
              <SectionTitle title="Terms & Conditions" theme={theme} />
              {renderTerms(parsed.terms_and_conditions)}
            </>
          )}

          {/* ── Deposit ── */}
          {parsed?.deposit_policy && (
            <>
              <Divider theme={theme} />
              <SectionTitle title="Deposit Policy" theme={theme} />
              {renderList(parsed.deposit_policy)}
            </>
          )}

          {/* ── Refund ── */}
          {parsed?.refund_policy && (
            <>
              <Divider theme={theme} />
              <SectionTitle title="Refund Policy" theme={theme} />
              {renderRefund(parsed.refund_policy)}
            </>
          )}

          {/* ── Additional ── */}
          {parsed?.additional_conditions && (
            <>
              <Divider theme={theme} />
              <SectionTitle title="Additional Conditions" theme={theme} />
              {renderTerms(parsed.additional_conditions)}
            </>
          )}

          {/* ── Policies ── */}
          {parsed?.policies && (
            <>
              <Divider theme={theme} />
              <SectionTitle title="Policies" theme={theme} />
              {Object.entries(parsed.policies).map(([key, value], i) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="lock-closed-outline" size={13} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.heading }}>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                  {renderList(value)}
                </View>
              ))}
            </>
          )}

          {/* ── Feedback ── */}
          <Divider theme={theme} />
          <View style={{ marginTop: 4, marginBottom: 8 }}>
            <SectionTitle title="Feedback" theme={theme} />

            {feedbackLoading ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator color={theme.accent} />
              </View>
            ) : packageFeedback.length > 0 ? (
              <>
                {packageFeedback.slice(0, 4).map((feedback, i) => (
                  <FeedbackCard key={feedback.id ?? i} feedback={feedback} theme={theme} />
                ))}

                {packageFeedback.length > 4 && (
                  <TouchableOpacity
                    onPress={() => setFeedbackModalVisible(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: theme.accent,
                      borderRadius: 12,
                      paddingVertical: 11,
                      alignItems: 'center',
                      marginTop: 2,
                    }}
                  >
                    <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 13 }}>
                      See more feedback ({packageFeedback.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View
                style={{
                  backgroundColor: theme.bulletBg,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
                  No feedback yet.
                </Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* ── Full Feedback Modal ── */}
      <Modal
        visible={feedbackModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: theme.cardBg,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxHeight: '80%', paddingTop: 16,
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 20, paddingBottom: 12,
              borderBottomWidth: 1, borderBottomColor: theme.border,
            }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.heading }}>
                All Feedback ({packageFeedback.length})
              </Text>
              <TouchableOpacity
                onPress={() => setFeedbackModalVisible(false)}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: theme.bulletBg, alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 20, paddingTop: 14 }} contentContainerStyle={{ paddingBottom: 30 }}>
              {packageFeedback.map((feedback, i) => (
                <FeedbackCard key={feedback.id ?? i} feedback={feedback} theme={theme} />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Sticky Add to Cart ── */}
      {selectedItems.length > 0 && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: theme.cardBg, paddingHorizontal: 20, paddingVertical: 14,
          paddingBottom: Platform.OS === 'ios' ? 28 : 14,
          borderTopWidth: 1, borderTopColor: theme.border,
          shadowColor: theme.cardShadow, shadowOffset: { width: 0, height: -6 },
          shadowOpacity: isPremium ? 0.3 : 0.08, shadowRadius: 16, elevation: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: theme.textMuted }}>
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: theme.textMuted, marginRight: 4 }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: theme.accent }}>
                ${cartTotal.toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            activeOpacity={0.88}
            style={{ borderRadius: 14, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={theme.tableGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 15, flexDirection: 'row',
                alignItems: 'center', justifyContent: 'center', borderRadius: 14,
              }}
            >
              <Ionicons name="cart-outline" size={18} color={theme.ctaTextOnAccent} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.ctaTextOnAccent, fontWeight: '700', fontSize: 15 }}>
                Add to Basket
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

export default PackageDetail