import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { AuthContext } from '../context/AuthContext'
import { apiBaseUrl } from '../components/variable'
import { SafeAreaView } from 'react-native-safe-area-context'

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const STATUS_CONFIG = {
  succeeded: {
    label: 'Paid',
    dot: 'bg-emerald-500',
    text: 'text-emerald-500',
    icon: '↓',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-500',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-amber-400',
    text: 'text-amber-500',
    icon: '…',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-400',
  },
  failed: {
    label: 'Failed',
    dot: 'bg-rose-400',
    text: 'text-rose-400',
    icon: '✕',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-400',
  },
}

const DetailRow = ({ label, value, valueStyle }) => (
  <View className="flex-row justify-between items-center py-2">
    <Text className="text-xs text-gray-400">{label}</Text>
    <Text className={`text-xs font-semibold text-gray-700 flex-shrink ml-4 text-right ${valueStyle || ''}`}>
      {value || '—'}
    </Text>
  </View>
)

const PaymentTransaction = () => {
  const { token, loading } = useContext(AuthContext)

  const [transactions, setTransactions] = useState([])
  const [fetching, setFetching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const fetchTransactions = async (isRefresh = false) => {
    if (!token) return
    try {
      isRefresh ? setRefreshing(true) : setFetching(true)
      setError(null)
      const res = await fetch(`${apiBaseUrl}payment-transaction-list/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      if (res.status === 200) {
        setTransactions(data.data || [])
      } else {
        setError('Failed to load transactions.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setFetching(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!loading && token) fetchTransactions()
  }, [loading, token])

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    return `${formatDate(dateStr)}, ${formatTime(dateStr)}`
  }

  const fmt = (amount, currency = 'SGD') => {
    if (amount === undefined || amount === null) return '—'
    const n = parseFloat(amount)
    if (isNaN(n)) return '—'
    return `${currency} ${n.toFixed(2)}`
  }

  const totalSucceeded = transactions
    .filter((t) => t.status === 'succeeded')
    .length
  const totalPending = transactions.filter((t) => t.status === 'pending').length
  const totalFailed = transactions.filter((t) => t.status === 'failed').length

  const getConfig = (status) =>
    STATUS_CONFIG[status] || {
      label: status,
      dot: 'bg-gray-400',
      text: 'text-gray-500',
      icon: '·',
      iconBg: 'bg-gray-50',
      iconText: 'text-gray-400',
    }

  if (loading || fetching) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-400 mt-3 text-sm tracking-wide">Loading…</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTransactions(true)}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      >
        {/* ── Header ── */}
        <View className="px-6 pt-6 pb-6">
          <Text className="text-2xl font-black text-primary text-center">Payments</Text>
          <Text className="text-xs text-gray-400 mt-1">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </Text>

          {/* Stats Row */}
          <View className="flex-row mt-4 gap-3">
            <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
              <Text className="text-xs text-gray-400 mb-1">Succeeded</Text>
              <Text className="text-lg font-bold text-emerald-500">{totalSucceeded}</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
              <Text className="text-xs text-gray-400 mb-1">Pending</Text>
              <Text className="text-lg font-bold text-amber-400">{totalPending}</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
              <Text className="text-xs text-gray-400 mb-1">Failed</Text>
              <Text className="text-lg font-bold text-rose-400">{totalFailed}</Text>
            </View>
          </View>
        </View>

        {/* ── Divider ── */}
        <View className="h-px bg-gray-100 mx-6 mb-4" />

        {/* ── Section Title ── */}
        <View className="px-6 mb-3">
          <Text className="text-xs tracking-widest text-gray-400 uppercase">
            Transaction History
          </Text>
        </View>

        {/* ── Error ── */}
        {error && (
          <View className="mx-6 mb-4 bg-rose-50 border border-rose-100 rounded-2xl p-4">
            <Text className="text-rose-500 text-sm text-center">{error}</Text>
            <TouchableOpacity onPress={() => fetchTransactions()} className="mt-2">
              <Text className="text-blue-500 text-center text-sm font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Empty State ── */}
        {transactions.length === 0 && !error && (
          <View className="mx-6 mt-6 items-center py-16">
            <Text className="text-5xl mb-4">💳</Text>
            <Text className="text-gray-700 font-semibold text-base">No transactions yet</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              Your payment history will appear here.
            </Text>
          </View>
        )}

        {/* ── Transaction List ── */}
        <View className="px-6 pb-10">
          {transactions.map((item, index) => {
            const cfg = getConfig(item.status)
            const isExpanded = expandedId === item.id
            const isSucceeded = item.status === 'succeeded'
            const showDateHeader =
              index === 0 ||
              formatDate(item.created_at) !== formatDate(transactions[index - 1]?.created_at)

            return (
              <View key={item.id}>
                {/* Date group header */}
                {showDateHeader && (
                  <Text className="text-xs text-gray-400 mt-4 mb-2 font-medium">
                    {formatDate(item.created_at)}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.7}
                >
                  {/* ── Main Row ── */}
                  <View className="flex-row items-center py-3.5">
                    {/* Icon */}
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${cfg.iconBg}`}
                    >
                      <Text className={`text-base font-bold ${cfg.iconText}`}>
                        {cfg.icon}
                      </Text>
                    </View>

                    {/* Label + meta */}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800">
                        {item.purpose || 'Purchase'}
                      </Text>
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <View className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <Text className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</Text>
                        <Text className="text-xs text-gray-300">·</Text>
                        <Text className="text-xs text-gray-400">{formatTime(item.created_at)}</Text>
                      </View>
                      {item.payment_method ? (
                        <Text className="text-xs text-gray-400 mt-0.5 capitalize">
                          {item.payment_method.replace(/_/g, ' ')}
                        </Text>
                      ) : null}
                    </View>

                    {/* Amount + chevron */}
                    <View className="items-end ml-2">
                      <Text className="text-sm font-bold text-gray-900">
                        {isSucceeded
                          ? fmt(item.final_amount, item.currency)
                          : fmt(item.amount, item.currency)}
                      </Text>
                      {isSucceeded && parseFloat(item.all_inclusive_fee) > 0 && (
                        <Text className="text-xs text-gray-400 mt-0.5">
                          fee {item.currency} {parseFloat(item.all_inclusive_fee).toFixed(2)}
                        </Text>
                      )}
                      <Text className="text-xs text-gray-300 mt-1">
                        {isExpanded ? '▲' : '▼'}
                      </Text>
                    </View>
                  </View>

                  {/* ── Expanded Detail Panel ── */}
                  {isExpanded && (
                    <View className="ml-14 mb-3 bg-gray-50 rounded-2xl px-4 pt-1 pb-2">
                      <DetailRow label="Reference No." value={item.reference_number} />
                      <View className="h-px bg-gray-100" />
                      <DetailRow label="Order ID" value={item.order_id} />
                      <View className="h-px bg-gray-100" />
                      <DetailRow
                        label="Original Amount"
                        value={fmt(item.amount, item.currency)}
                      />
                      {isSucceeded && (
                        <>
                          <View className="h-px bg-gray-100" />
                          <DetailRow
                            label="Discount Fee"
                            value={`- ${fmt(item.discount_fee, item.currency)} (${item.discount_fee_rate}%)`}
                          />
                          <View className="h-px bg-gray-100" />
                          <DetailRow
                            label="Fixed Fee"
                            value={fmt(item.fixed_fee, item.currency)}
                          />
                          <View className="h-px bg-gray-100" />
                          <DetailRow
                            label="Tax"
                            value={fmt(item.tax, item.currency)}
                          />
                          <View className="h-px bg-gray-100" />
                          <DetailRow
                            label="Total Fee"
                            value={fmt(item.all_inclusive_fee, item.currency)}
                          />
                          <View className="h-px bg-gray-100" />
                          <DetailRow
                            label="Final Charged"
                            value={fmt(item.final_amount, item.currency)}
                            valueStyle="text-emerald-600"
                          />
                        </>
                      )}
                      {item.refunded_amount && parseFloat(item.refunded_amount) > 0 && (
                        <>
                          <View className="h-px bg-gray-100" />
                          <DetailRow
                            label="Refunded"
                            value={fmt(item.refunded_amount, item.currency)}
                            valueStyle="text-rose-500"
                          />
                        </>
                      )}
                      <View className="h-px bg-gray-100" />
                      <DetailRow label="Email" value={item.email} />
                      <View className="h-px bg-gray-100" />
                      <DetailRow label="Created" value={formatDateTime(item.created_at)} />
                      <View className="h-px bg-gray-100" />
                      <DetailRow label="Updated" value={formatDateTime(item.updated_at)} />
                      {item.failed_reason && (
                        <>
                          <View className="h-px bg-gray-100" />
                          <DetailRow
                            label="Failure Reason"
                            value={item.failed_reason}
                            valueStyle="text-rose-500"
                          />
                        </>
                      )}
                    </View>
                  )}
                </TouchableOpacity>

                {/* Row separator within same date group */}
                {!isExpanded &&
                  index < transactions.length - 1 &&
                  formatDate(item.created_at) ===
                    formatDate(transactions[index + 1]?.created_at) && (
                    <View className="h-px bg-gray-50 ml-14" />
                  )}
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PaymentTransaction