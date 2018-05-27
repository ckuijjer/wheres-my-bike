import React from 'react'
import { TouchableOpacity, StyleSheet, View } from 'react-native'

const styles = StyleSheet.create({
  circle: {
    width: 64,
    height: 64,
    borderRadius: 64,
    borderWidth: 6,
    borderColor: '#fff',
    shadowColor: '#333',
    shadowRadius: 1,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
  },
})

const CameraButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.circle} />
  </TouchableOpacity>
)

export default CameraButton
