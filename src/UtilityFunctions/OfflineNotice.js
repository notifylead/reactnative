import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  NetInfo,View,
  StatusBar,Animated,
  Easing,Text,AppState,
  StyleSheet,TouchableOpacity, Platform,ActivityIndicator  
} from "react-native";
// import {LoadWheel} from '../Assets/LoadWheel'

export default class OfflineNotice extends Component {
  static propTypes = {
    offlineText: PropTypes.string
  };

 
  setNetworkStatus = status => {
    this.setState({ isConnected: status });
  };

  state = {
    isConnected: true,
    isLoading: false
  };

  _handleAppStateChange = nextAppState => {
    if (nextAppState === "active") {
      NetInfo.isConnected.fetch().then(this.setNetworkStatus);
    }
  };

  componentWillMount() {
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.setNetworkStatus
    );
    AppState.addEventListener("change", this._handleAppStateChange);
    this.animation = new Animated.Value(0);
  }

  componentWillUnMount() {
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this.setNetworkStatus
    );
    AppState.removeEventListener("change", this._handleAppStateChange);
  }
 

  render() {
    return (
    
    <View>
      {/* <LoadWheel visible={this.state.isLoading}  onRequestClose={() => this.setState({ isLoading:false })} text={'Loading...'}/> */}
     {!this.state.isConnected ? 
      <TouchableOpacity onPress={() =>{
        this.setState({isLoading:true});
        setTimeout(() => {this.setState({isLoading:false})},1000);
      }}>
      
        <View style={{backgroundColor:'red', justifyContent:'center', alignItems:'center'}}>
              <Text style={{ color:'white',marginTop: (Platform.OS == 'ios') ? 20 : 0 }}>No Internet Connection</Text>
              {/* <Text style={{ color:'white' }}>
                {this.state.isLoading ? 'Reconnecting...' : 'Tap to Retry'}
              </Text> */}
            </View>

      </TouchableOpacity>
    : null}
    </View> 
    )
}
}
const styles = {
  container: {
    backgroundColor: 'red'
  },
  offlineText: {
    color: 'white',
    padding: 10,
    textAlign: 'center'
  }
}