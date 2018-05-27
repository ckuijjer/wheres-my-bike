import React from 'react'
import {
  Animated,
  AsyncStorage,
  Dimensions,
  Image,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Camera, Permissions, FileSystem, SecureStore } from 'expo'

import CameraButton from './CameraButton'

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    photo_uri: null,
    dy: new Animated.Value(0),
    scale: new Animated.Value(1),
  }

  async componentDidMount() {
    this.panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.dy.setOffset(this.state.dy._value)
        this.state.dy.setValue(0)

        Animated.spring(this.state.scale, { toValue: 1.1, friction: 3 }).start()
      },

      onPanResponderMove: Animated.event([null, { dy: this.state.dy }]),

      onPanResponderRelease: (e, { vx, vy }) => {
        Animated.spring(this.state.dy, { toValue: 0 }).start()
        Animated.spring(this.state.scale, { toValue: 1, friction: 3 }).start()
      },
    })

    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })

    const photo_uri = await SecureStore.getItemAsync('photo_uri')
    this.setState({ photo_uri })
  }

  handleSnap = async () => {
    if (this.camera) {
      const photo = await this.camera.takePictureAsync()
      const from = photo.uri

      const fileName = from.split('/').pop()
      const to = FileSystem.documentDirectory + fileName

      // try {
      //   console.log('copyAsync', { from, to })
      //   await FileSystem.copyAsync({
      //     from,
      //     to,
      //   })
      // } catch (error) {
      //   console.log('copyAsync error', error)
      // }

      await SecureStore.setItemAsync('photo_uri', from)
      this.setState({ photo_uri: from })
    }
  }

  // - get the gps data from the image => impossible, you need Location.getCurrentPositionAsync
  // - click on the image preview should open the image bigger
  // - and show the gps data
  // - try saving the image to the documentDirectory, using the copyAsync
  // - let the image preview rotate on rotate of the screen
  // - geofencing and remembering often used parking locations
  render() {
    const scale = this.state.scale

    const { width, height } = Dimensions.get('window')

    // use dy to calculate the position of
    // - top: window.height - 64 ... 0
    // - left: 16
    // - right: window.width - 112 - 16 ... 16
    // - bottom: 0 ... 64
    // - dy inputrange = window.height for now?

    const inputRange = [-height, 0]
    const top = this.state.dy.interpolate({
      inputRange,
      outputRange: [0, height - 64 - 112],
      // outputRange: [0, 64],
      extrapolate: 'clamp',
    })
    const left = 24
    const right = this.state.dy.interpolate({
      inputRange,
      outputRange: [24, width - 112 - 24],
    })
    const bottom = this.state.dy.interpolate({
      inputRange,
      outputRange: [64, 0],
      extrapolate: 'clamp',
    })

    const modalStyle = {
      // width: 112,
      // height: 112,
      opacity: 0.85,
      position: 'absolute',
      top,
      right,
      bottom,
      left,
      backgroundColor: '#f99',
      // transform: [{ scale }],
    }

    return (
      <View style={styles.container}>
        <Camera ref={ref => (this.camera = ref)} style={styles.camera} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeAreaInner}>
            <View style={styles.buttons}>
              <CameraButton onPress={this.handleSnap} />
            </View>
            <Animated.View
              style={modalStyle}
              {...(this.panResponder ? this.panResponder.panHandlers : {})}
            >
              {false && this.state.photo_uri ? (
                <Image
                  style={styles.image}
                  source={{ uri: this.state.photo_uri }}
                />
              ) : null}
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  safeAreaInner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageContainer: {
    width: 112,
    height: 112,
    opacity: 1, //0.85,
    position: 'absolute',
    left: 24,
    bottom: 0,
    backgroundColor: '#f99',
  },
  image: {
    flex: 1,
  },
  camera: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  buttons: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
})
