import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { Camera, Permissions } from 'expo';

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    photo: null,
  };

  handleSnap = async () => {
    if (this.camera) {
      const photo = await this.camera.takePictureAsync();
      this.setState({ photo });
    }
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Camera ref={ref => (this.camera = ref)} style={styles.camera} />
          <Image style={styles.image} source={this.state.photo} />
          <View style={styles.buttons}>
            <TouchableHighlight onPress={this.handleSnap}>
              <View style={styles.snap} />
            </TouchableHighlight>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  inner: {
    flex: 1,
  },
  image: {
    width: 128,
    height: 128,
    opacity: 0.8,
    position: 'absolute',
    left: 16,
    top: 16,
  },
  camera: {
    backgroundColor: '#f99',
    width: '100%',
    flex: 1,
  },
  buttons: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snap: {
    width: 64,
    height: 64,
    borderRadius: 64,
    borderWidth: 6,
    borderColor: '#fff',
  },
});
