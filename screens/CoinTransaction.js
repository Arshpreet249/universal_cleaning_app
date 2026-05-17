import React, { useEffect, useState, useContext } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { AuthContext } from '../context/AuthContext'
import { apiBaseUrl } from '../components/variable'
import { SafeAreaView } from 'react-native-safe-area-context'

const REMARKS_LABEL = {
  referral_bonus: 'Referral Bonus',
  purchase: 'Purchase',
  redemption: 'Redemption',
  cashback: 'Cashback',
  refund: 'Refund',
  adjustment: 'Adjustment',
}

const CoinTransaction = () => {
  const { token, loading } = useContext(AuthContext)

  const [transactions, setTransactions] = useState([])
  const [fetching, setFetching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchTransactions = async (isRefresh = false) => {
    if (!token) return
    try {
      isRefresh ? setRefreshing(true) : setFetching(true)
      setError(null)
      const res = await fetch(`${apiBaseUrl}coin-transaction-list/`, {
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
        setError('Failed to load coin transactions.')
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
    return d.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalCoins = transactions.reduce((sum, t) => {
    return t.credit_debit === 'C' ? sum + (t.coins || 0) : sum - (t.coins || 0)
  }, 0)

  const totalEarned = transactions
    .filter((t) => t.credit_debit === 'C')
    .reduce((sum, t) => sum + (t.coins || 0), 0)

  const totalSpent = transactions
    .filter((t) => t.credit_debit === 'D')
    .reduce((sum, t) => sum + (t.coins || 0), 0)

  const getRemarkLabel = (remarks) =>
    REMARKS_LABEL[remarks] ||
    (remarks
      ? remarks.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Transaction')

  if (loading || fetching) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#F59E0B" />
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
            colors={['#F59E0B']}
            tintColor="#F59E0B"
          />
        }
      >
        {/* ── Hero Balance Block ── */}
        <View className="px-6 pt-6 pb-8">

          <Text className="text-2xl font-bold text-center mt-4 mb-4 text-primary">
            Coins
          </Text>
          <Text className="text-xs tracking-widest text-gray-400 uppercase mb-1">
            Coin Balance
          </Text>
          <View className="flex-row items-end gap-2">
            <Text className="text-5xl font-black text-gray-900">{totalCoins}</Text>
            <Text className="text-2xl mb-1">🪙</Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row mt-5 gap-3">
            <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
              <Text className="text-xs text-gray-400 mb-1">Earned</Text>
              <Text className="text-lg font-bold text-emerald-500">+{totalEarned}</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
              <Text className="text-xs text-gray-400 mb-1">Spent</Text>
              <Text className="text-lg font-bold text-rose-400">-{totalSpent}</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3">
              <Text className="text-xs text-gray-400 mb-1">Total</Text>
              <Text className="text-lg font-bold text-gray-700">{transactions.length}</Text>
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
              <Text className="text-amber-500 text-center text-sm font-semibold">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Empty State ── */}
        {transactions.length === 0 && !error && (
          <View className="mx-6 mt-6 items-center py-16">
            <Text className="text-5xl mb-4">🪙</Text>
            <Text className="text-gray-700 font-semibold text-base">
              No transactions yet
            </Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              Earn coins through referrals and purchases.
            </Text>
          </View>
        )}

        {/* ── Transaction List ── */}
        <View className="px-6 pb-10">
          {transactions.map((item, index) => {
            const isCredit = item.credit_debit === 'C'
            const label = getRemarkLabel(item.remarks)
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

                <View className="flex-row items-center py-3.5">
                  {/* Icon */}
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isCredit ? 'bg-emerald-50' : 'bg-rose-50'
                      }`}
                  >
                    <Text
                      className={`text-base font-bold ${isCredit ? 'text-emerald-500' : 'text-rose-400'
                        }`}
                    >
                      {isCredit ? '↓' : '↑'}
                    </Text>
                  </View>

                  {/* Label + time */}
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-800">
                      {label}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-0.5">
                      {formatTime(item.created_at)}
                    </Text>
                  </View>

                  {/* Coin amount */}
                  <Text
                    className={`text-base font-bold ${isCredit ? 'text-emerald-500' : 'text-rose-400'
                      }`}
                  >
                    {isCredit ? '+' : '-'}{item.coins} 🪙
                  </Text>
                </View>

                {/* Row separator (skip last in group or last overall) */}
                {index < transactions.length - 1 &&
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

export default CoinTransaction