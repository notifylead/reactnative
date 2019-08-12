import React, { Component } from 'react'

import {
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator, Dimensions, Linking,
  SafeAreaView,
  ScrollView
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../../Common/Header'
import { Button } from 'react-native-elements';
import firebase from 'firebase'
import { styles } from './styles'

let logo = require('../../../Assets/img/logo_png/old_add_form_logo.png')
const { width, height } = Dimensions.get('window')

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  render() {
    return (
      <SafeAreaView style={{flex: 1,}}>
      <ScrollView>
      <View style={styles.container}>
        <Header title="Get Started" navigateClick={() => this.props.navigation.navigate("DrawerOpen")} iconame='menu' />
        <View style={styles.adsLogo}>
          <Image source={logo} style={{ alignSelf: 'center' }} />
        </View>
        <View style={styles.textView1}>
          <Text style={styles.textProps}>
            Add Lead Ads Form
            </Text>
          <View style={styles.textView2}>
            <Text style={styles.textProps1}>
              To get started add a lead ads from that you have created on your Facebook account.
            </Text>
              </View>
              <View style={styles.buttonView}>
                <Button
                  title='Get Started'
                  color='white'
                  onPress={() => this.props.navigation.navigate('SelectFbPage')}
                  buttonStyle={{
                    backgroundColor: "#5890ff",
                    borderRadius: 5
                  }}
                  textStyle={{ fontWeight: 'bold' }}
                />
              </View>


        </View>
      </View>
      </ScrollView>
      </SafeAreaView>
    );
  }
}

export default Home
