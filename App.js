import React, { Component } from 'react'
import { View, AsyncStorage, AppState, Text, Platform, PushNotificationIOS, Alert, ActivityIndicator } from 'react-native'
// import PushNotification from 'react-native-push-notification';
import FCM, { FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType } from 'react-native-fcm';
import { NavigationActions } from 'react-navigation';
import { Provider } from 'react-redux'
import { createRootNavigator } from './src/Routes'
import OfflineNotice from './src/UtilityFunctions/OfflineNotice'

import getStore from './src/Store';
import Splash from './src/Components/Splash'
let store = getStore()
import * as firebase from 'firebase'
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';

import { config, GCMConfig } from './src/Config/index'
import { getCheckLeads, updateLead, listLeadForm, createLeads } from './src/Actions/LeadsAction'

import { checkFbPagesIsExits } from './src/Actions/AuthAction'

firebase.initializeApp(config)

FCM.requestPermissions({ badge: true, sound: true, alert: true });
FCM.on(FCMEvent.Notification, notif => {
  console.log(notif, "notifnotifnotifnotifnotifnotifnotifnotif")
  let payload = notif;
  let notification_payload = null;
  console.log("Notification", notif);
  if (notif.local_notification) {
  }
  if (notif.opened_from_tray) {
  }
  if (Platform.OS === 'ios') {
    notification_payload = {
      title: payload.title,
      show_in_foreground: true,
      message: payload.body,
      leadId: payload.leadId,
      formId: payload.formId,
    }

    switch (notif._notificationType) {

      case NotificationType.Remote:
        notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
        break;
      case NotificationType.NotificationResponse:
        notif.finish();
        break;
      case NotificationType.WillPresent:
        notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
        break;
    }
  }
  else {
    notification_payload = {
      title: notif.title,
      message: notif.body,
      leadId: (payload && payload.leadId) ? payload.leadId : '',
      formId: (payload && payload.formId) ? payload.formId : '',
    }
  }
  if (notification_payload) {

    Alert.alert(
      `${notification_payload.title}`,
      `${notification_payload.message}`,
      [
        {
          text: 'Cancel', onPress: () => {
          }, style: 'cancel'
        },
        {
          text: 'Ok', onPress: () => {
          }
        },
      ],
      { cancelable: false }
    )
  }
})
FCM.on(FCMEvent.RefreshToken, token => {
  console.log("TOKEN (refreshUnsubscribe)", token);
});
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      SignedIn: false,
      showStarted: false,
      appState: AppState.currentState
    }
  }
  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.setState({ appState: nextAppState });
  }
  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    let deviceId = DeviceInfo.getUniqueID()
    setTimeout(async () => {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          let retrievedItem = await AsyncStorage.getItem("user_info");
          let item = JSON.parse(retrievedItem);
          console.log(item, "jkjhkh")
          if (item) {
            let facebookID = item.facebookID
            let access_token = item.accessToken
            checkFbPagesIsExits(facebookID, access_token).then((res) => {
              this.setState({
                SignedIn: true,
                loading: false,
                showStarted: true
              })

            }).catch((err) => {
              this.setState({
                showStarted: false,
                SignedIn: true,
                loading: false,
              })
            })
          } else {
            this.setState({
              showStarted: false,
              SignedIn: true,
              loading: false,
            })
          }

        }
        else {
          this.setState({
            SignedIn: false,
            loading: false
          })
        }
      })
    }, 500);
    let fbPages = await AsyncStorage.getItem('fbPages');
    let itemVal = JSON.parse(fbPages);
    if (itemVal && itemVal.length > 0) {
      this.setState({ showStarted: true })
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  render() {

    if (this.state.loading) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            // height: Dimensions.get('window').height,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 1,
            backgroundColor: "rgba(0,0,0,0)"
          }}>
          <ActivityIndicator color='#5890FF' size='large' />
        </View>
        //  <Splash />
      )
    }
    // else {
    const Layout = createRootNavigator(this.state.SignedIn, this.state.showStarted);
    return (

      <Provider store={store}>
        <View style={{ flex: 1 }}>
          <OfflineNotice />
          <Layout />
        </View>
      </Provider>
    );
  }

  // }
}

