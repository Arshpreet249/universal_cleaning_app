import React from 'react'
import { View, Text, ScrollView, Image } from 'react-native'

const AllPackages = ({ route }) => {
  const { item, parsed } = route.params

  return (
    <ScrollView className="">

      {/* HEADER IMAGE */}
      <Image
        source={{
          uri:
            item.icon_url ||
            'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542'
        }}
        className="w-full h-64"
      />

      <View className="p-4">

        {/* PACKAGE NAME */}
        <Text className="text-2xl font-bold mb-2">
          {parsed?.package_name}
        </Text>

        <Text className="text-gray-500 mb-4">
          ID: {item.id}
        </Text>

        {/* PRICING SECTION */}
        <Text className="text-lg font-bold mb-2">
          Pricing Plans
        </Text>

        {(parsed?.pricing ||
          parsed?.packages ||
          parsed?.sub_packages ||
          parsed?.type ||
          parsed?.duration_hours ||
          parsed?.price_sgd ||
          []
        ).map((p, index) => (
          <View
            key={index}
            className="bg-gray-100 p-3 mb-2 rounded-lg"
          >
            <Text className="text-black">
              {JSON.stringify(p)}
            </Text>
          </View>
        ))}

        {/* TERMS (optional display) */}
        {parsed?.terms_and_conditions && (
          <>
            <Text className="text-lg font-bold mt-4 mb-2">
              Terms & Conditions
            </Text>

            {parsed.terms_and_conditions.map((t, i) => (
              <View key={i} className="mb-2">
                <Text className="font-bold">{t.heading}</Text>
                <Text className="text-gray-600">
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