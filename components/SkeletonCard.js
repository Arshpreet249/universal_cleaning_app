import React from 'react'
import { View, Dimensions } from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

const { width } = Dimensions.get('window')

const SkeletonCard = () => {
  return (
    <SkeletonPlaceholder>
      <View style={{ marginBottom: 20 }}>
        {/* Image */}
        <View
          style={{
            width: width - 32,
            height: 180,
            borderRadius: 12,
          }}
        />

        {/* Title */}
        <View
          style={{
            marginTop: 10,
            width: '60%',
            height: 20,
            borderRadius: 6,
          }}
        />

        {/* Subtitle */}
        <View
          style={{
            marginTop: 6,
            width: '40%',
            height: 16,
            borderRadius: 6,
          }}
        />
      </View>
    </SkeletonPlaceholder>
  )
}

export default SkeletonCard