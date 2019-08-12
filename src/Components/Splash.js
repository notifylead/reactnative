import React, { Component } from 'react'

import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native'
import logo from '../Assets/img/logo_png/logo_with-name.png'
import notifyleadImg from '../Assets/img/notifylead_logo.png'
const {width,height} = Dimensions.get('window')
class Splash extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <SafeAreaView style={{flex: 1, }}>
      <View style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignContent: 'center' }}>
        <Image source={notifyleadImg} resizeMode="contain" style={{
          alignSelf: 'center',
            width:width-60,
          // width: 100
        }} />
      </View>
      </SafeAreaView>
    );
  }
}

export default Splash
