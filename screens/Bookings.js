import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native'

const bookingsData = [
  {
    id: 1,
    title: 'Luxury Room',
    date: '25 April 2026',
    time: '02:00 PM',
    price: '₹2500',
    status: 'Confirmed',
  },
  {
    id: 2,
    title: 'Deluxe Package',
    date: '28 April 2026',
    time: '11:00 AM',
    price: '₹1800',
    status: 'Pending',
  },
  {
    id: 3,
    title: 'Spa Session',
    date: '30 April 2026',
    time: '05:00 PM',
    price: '₹1200',
    status: 'Cancelled',
  },
]

const Bookings = () => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return '#4CAF50'
      case 'Pending':
        return '#FF9800'
      case 'Cancelled':
        return '#F44336'
      default:
        return '#999'
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>My Bookings</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {bookingsData.map((item) => (
          <View key={item.id} style={styles.card}>
            
            {/* Title + Status */}
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            {/* Details */}
            <Text style={styles.detail}>📅 {item.date}</Text>
            <Text style={styles.detail}>⏰ {item.time}</Text>
            <Text style={styles.price}>{item.price}</Text>

            {/* Action Button */}
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>

          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default Bookings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 16,
  },

  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  detail: {
    marginTop: 6,
    color: '#555',
  },

  price: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },

  button: {
    marginTop: 12,
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
})