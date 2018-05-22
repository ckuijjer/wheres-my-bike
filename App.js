import React from 'react'
import {
  AsyncStorage,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Camera, Permissions, FileSystem, SecureStore } from 'expo'

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    photo_uri: null,
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })

    const photo_uri = await SecureStore.getItemAsync('photo_uri')
    this.setState({ photo_uri })
  }

  handleSnap = async () => {
    if (this.camera) {
      const photo = await this.camera.takePictureAsync()
      console.log('photo', photo)
      const from = photo.uri

      const fileName = from.split('/').pop()
      const to = FileSystem.documentDirectory + fileName

      try {
        console.log('copyAsync', { from, to })
        await FileSystem.copyAsync({
          from,
          to,
        })
      } catch (error) {
        console.log('copyAsync error', error)
      }

      await SecureStore.setItemAsync('photo_uri', from)
      this.setState({ photo_uri: from })
    }
  }

  // - try saving the image to the documentDirectory, using the copyAsync
  render() {
    return (
      <View style={styles.container}>
        <Camera ref={ref => (this.camera = ref)} style={styles.camera} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.safeAreaInner}>
            {this.state.photo_uri ? (
              <Image
                style={styles.image}
                source={{ uri: this.state.photo_uri }}
              />
            ) : null}
            <View style={styles.buttons}>
              <View style={styles.snap} />
            </View>
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
  image: {
    width: 128,
    height: 128,
    opacity: 0.85,
    position: 'absolute',
    left: 16,
    bottom: 0,
    backgroundColor: '#333',
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
  snap: {
    width: 64,
    height: 64,
    borderRadius: 64,
    borderWidth: 6,
    borderColor: '#fff',
  },
})
