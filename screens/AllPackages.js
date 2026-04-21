

// import React from 'react'
// import { View, Text, ScrollView, Image, StyleSheet } from 'react-native'

// const AllPackages = ({ route }) => {
//   const { item } = route.params

//     const parseDescription = (data) => {
//     try {
//       return typeof data === 'string' ? JSON.parse(data) : data
//     } catch {
//       return null
//     }
//   }

//   const parsed = parseDescription(item.description)

//   const pricingData =
//     parsed?.pricing ||
//     parsed?.packages ||
//     parsed?.sub_packages ||
//     parsed?.type ||
//     parsed?.duration_hours ||
//     parsed?.price_sgd ||
//     []

//   return (
//     <ScrollView style={styles.container}>

//       {/* HEADER IMAGE */}
//       <Image
//         source={{
//           uri:
//             item.icon_url ||
//             'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542',
//         }}
//         style={styles.image}
//         resizeMode="cover"
//       />

//       <View style={styles.content}>

//         {/* PACKAGE NAME */}
//         <Text style={styles.title}>
//           {parsed?.package_name}
//         </Text>

//         <Text style={styles.subText}>

//         </Text>

//         {/* PRICING SECTION */}
//         <Text style={styles.sectionTitle}>
//           Pricing Plans
//         </Text>

//         {Array.isArray(pricingData) &&
//           pricingData.map((p, index) => (
//             <View key={index} style={styles.card}>
//               <Text style={styles.cardText}>
//                 {typeof p === 'object' ? JSON.stringify(p) : p}
//               </Text>
//             </View>
//           ))
//         }

//         {/* TERMS */}
//         {parsed?.terms_and_conditions && (
//           <>
//             <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
//               Terms & Conditions
//             </Text>

//             {parsed.terms_and_conditions.map((t, i) => (
//               <View key={i} style={styles.termBox}>
//                 <Text style={styles.termTitle}>
//                   {t.heading}
//                 </Text>

//                 <Text style={styles.termDesc}>
//                   {typeof t.description === 'string'
//                     ? t.description
//                     : JSON.stringify(t.description)}
//                 </Text>
//               </View>
//             ))}
//           </>
//         )}

//       </View>
//     </ScrollView>
//   )
// }

// export default AllPackages
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },

//   image: {
//     width: '100%',
//     height: 260,
//   },

//   content: {
//     padding: 16,
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#000',
//   },

//   subText: {
//     fontSize: 14,
//     color: '#6b7280',
//     marginBottom: 16,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#111',
//   },

//   card: {
//     backgroundColor: '#f3f4f6',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//   },

//   cardText: {
//     fontSize: 13,
//     color: '#111',
//   },

//   termBox: {
//     marginBottom: 12,
//   },

//   termTitle: {
//     fontWeight: 'bold',
//     fontSize: 14,
//     marginBottom: 4,
//     color: '#000',
//   },

//   termDesc: {
//     fontSize: 13,
//     color: '#6b7280',
//   },
// })

import React from 'react'
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native'

const AllPackages = ({ route }) => {
  const { item } = route.params

  // ✅ SAFE PARSE
  const parseDescription = (data) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data
    } catch {
      return null
    }
  }

  const parsed = parseDescription(item.description)

  // ✅ NORMALIZE PRICING DATA
  const getPricingData = () => {
    if (!parsed) return []

    // Case 1: Proper pricing array
    if (Array.isArray(parsed.pricing)) {
      return parsed.pricing
    }

    // Case 2: packages / sub_packages
    if (Array.isArray(parsed.packages)) {
      return parsed.packages
    }

    if (Array.isArray(parsed.sub_packages)) {
      return parsed.sub_packages
    }

    // Case 3: Single object fallback
    if (parsed.duration_minutes || parsed.price_sgd) {
      return [
        {
          duration_minutes: parsed.duration_minutes,
          price_sgd: parsed.price_sgd,
        },
      ]
    }

    return []
  }

  const pricingData = getPricingData()

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER IMAGE */}
      <Image
        source={{
          uri:
            item.icon_url ||
            'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542',
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>

        {/* PACKAGE NAME */}
        <Text style={styles.title}>
          {parsed?.package_name || 'Package'}
        </Text>

        {/* PRICING SECTION */}
        <Text style={styles.sectionTitle}>
          Pricing Plans
        </Text>

        {pricingData.length > 0 ? (
          pricingData.map((p, index) => (
            <View key={index} style={styles.card}>
              
              {/* Duration */}
              <Text style={styles.cardText}>
                {p.duration_minutes
                  ? `${p.duration_minutes} mins`
                  : p.duration_hours
                  ? `${p.duration_hours} hrs`
                  : `${p.size}`
                  ? `${p.type}`
                  : 'N/A'}
              </Text>

              {/* Price */}
              <Text style={styles.cardPrice}>
                {p.price_sgd ? `$${p.price_sgd}` : 'N/A'}
              </Text>

            </View>
          ))
        ) : (
          <Text style={styles.noData}>
            No pricing available
          </Text>
        )}

        {/* TERMS */}
        {Array.isArray(parsed?.terms_and_conditions) && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Terms & Conditions
            </Text>

            {parsed.terms_and_conditions.map((t, i) => (
              <View key={i} style={styles.termBox}>
                
                <Text style={styles.termTitle}>
                  {t.heading || 'Note'}
                </Text>

                <Text style={styles.termDesc}>
                  {typeof t.description === 'string'
                    ? t.description
                    : JSON.stringify(t.description)}
                </Text>

              </View>
            ))}
          </>
        )}

      </View>
    </ScrollView>
  )
}

export default AllPackages

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  image: {
    width: '100%',
    height: 260,
  },

  content: {
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111',
  },

  card: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  cardText: {
    fontSize: 14,
    color: '#374151',
  },

  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#16a34a',
  },

  noData: {
    fontSize: 14,
    color: '#9ca3af',
  },

  termBox: {
    marginBottom: 12,
  },

  termTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#000',
  },

  termDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
})