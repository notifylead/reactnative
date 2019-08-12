import React, { Component } from 'react'

import {
  View,
  Alert,
  ImageBackground,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Linking,
  WebView,
  AsyncStorage,
  SafeAreaView,
  Platform, KeyboardAvoidingView, ScrollView
} from 'react-native'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';
import { FormLabel, Text, FormInput, Card, Button, FormValidationMessage } from 'react-native-elements'
const { height, width } = Dimensions.get('window')
// import DeviceInfo from 'react-native-device-info';
import FCM, { FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType } from 'react-native-fcm';
// logo
// import logo from '../../../Assets/img/logo_png/logo_with-name.png'
// import logo from '../../../Assets/img/logo_png/notifylead_Logo_icon.png'
// import logoText from '../../../Assets/img/logo_png/notifylead_text.png'
// import logo from '../../../Assets/img/logo_png/notifylead_Logo.jpg'
// import logo from '../../../Assets/img/logo_png/nllogonotifylead-icon.png'
import logo from '../../../Assets/img/logo_png/nllogonotifylead.png'
// import { fbLoginPermissions, firebase } from '../../../Config/firebase';
// import Auth from '../../../Config/auth';
import firebase from 'firebase'
import { LoginApiUrl } from '../../../Config';
import { getUserDetails, updateFacebookUser, addFacebookUser, addDeviceToken } from '../../../Actions/AuthAction'
const FBSDK = require('react-native-fbsdk');

const {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager
} = FBSDK;


class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loader: false, visibleModal: false,
      emailPublicProficeResult: null
    }
  }


  async FBGraphRequest(fields, callback) {

    const accessData = await AccessToken.getCurrentAccessToken();
    // Create a graph request asking for user information
    const infoRequest = new GraphRequest('/me', {
      accessToken: accessData.accessToken,
      parameters: {
        fields: {
          string: fields
        }
      }
    }, callback.bind(this));
    // Execute the graph request created above
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  handleFbLogin() {
    this.setState({ loader: true })
    LoginManager.logOut();
    // 'ads_management',
    LoginManager.logInWithPublishPermissions(['manage_pages']).then((result) => {
      if (result && result.isCancelled == false) {

        this._handleCallBack(null)
      } else {
        this.setState({ loader: false })

        alert('You cancelled the login. Please login to continue using app');
      }
    }).catch((err) => {

      ///this.setState({ visibleModal: false })
      alert('Something went wrong. Please log out from facebook.com from safari browser and then try again')
    });


    // LoginManager.logInWithReadPermissions(['email', 'public_profile'])
    //   .then((result) => {

    //     console.log('LoginManager.logInWithReadPermissions')
    //     AccessToken.getCurrentAccessToken().then(
    //       (data) => {

    //         // LoginManager.logInWithPublishPermissions(['manage_pages']).then((result) => {
    //         // this.showModal(result)
    //         console.log("Login data: ", data);
    //         const token = data.accessToken
    //         console.log("token", token)
    //         fetch('https://graph.facebook.com/v3.0/me?access_token=' + token, ['email', 'ads_management', 'manage_pages',])
    //           .then((response) => {
    //             if (response) {
    //               // console.log(result)

    //               Alert.alert(
    //                 'We need some permission to Manage your Pages',
    //                 ' Press continue to give access',
    //                 [
    //                   { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
    //                   {
    //                     text: 'Continue', onPress: () => {
    //                       this.manage_pages_permissionFunc(result)

    //                     }
    //                   },
    //                 ],
    //                 { cancelable: false }
    //               )

    //               //this.showModal(result)

    //               // LoginManager.logInWithPublishPermissions(['ads_management', 'manage_pages',]).then((success) => {
    //               //   if (success) {

    //               //     this._handleCallBack(result)
    //               //   } else {
    //               //     console.log("Error: ");
    //               //   }
    //               // })
    //               // this._handleCallBack(result)
    //             } else {
    //               console.log("Error: ");
    //             }
    //           }).catch((err) => {
    //             alert('Login fail with error: ' + err);
    //           })
    //         // }
    //         // ).catch((err) => {
    //         //   console.log(err)
    //         // })

    //       }).catch((err) => {

    //         alert('Something went wrong. Please log out from facebook.com from safari browser and then try again')

    //         console.log(err)
    //       })
    //   }




    //   ).catch((err) => {
    //     console.log(err)
    //   })
    // // LoginManager.logInWithPublishPermissions(['ads_management', 'manage_pages',])
    // //   .then((success) => {
    // //     if (success) {
    // //       console.log(result)
    // //       this._handleCallBack(result)
    // //     } else {
    // //       console.log("Error: ");
    // //     }
    // //   }),
    // //   //this._handleCallBack(result),
    // //   function (error) {
    // //     alert('Login fail with error: ' + error);
    // //   }
    // //   )
  }

  showModal(result) {

    this.setState({ visibleModal: true, emailPublicProficeResult: result })
  }

  manage_pages_permissionFunc(result) {

    // this.setState({ visibleModal: false },()=>{
    //LoginManager.logOut();
    // 'ads_management',
    LoginManager.logInWithPublishPermissions(['manage_pages']).then((success) => {
      if (success) {
        this._handleCallBack(result)
      } else {
        // 

      }
    }).catch((err) => {
      ///this.setState({ visibleModal: false })
      alert('Something went wrong. Please log out from facebook.com from safari browser and then try again')
    })
    //})
  }

  _handleCallBack(result) {


    const { navigate } = this.props.navigation
    let _this = this
    if (false) {
      this.setState({
        loader: false
      })
      alert('Login cancelled');
    } else {
      this.setState({
        loader: true,

      })
      AccessToken.getCurrentAccessToken().then(
        (data) => {
          console.log("Login data: ", data);
          const token = data.accessToken
          fetch('https://graph.facebook.com/v3.0/me?fields=id,first_name,last_name,gender,email,birthday&access_token=' + token, ['email', 'public_profile'])

            .then((response) => response.json())
            .then((json) => {


              // _this.createUser(uid, json, token, fbImage)


              const imageSize = 120
              const facebookID = json.id
              const fbImage = `https://graph.facebook.com/${facebookID}/picture?height=${imageSize}`
              const user_info = {
                'accessToken': token,
                'facebookID': facebookID
              }
              AsyncStorage.setItem("user_info", JSON.stringify(user_info))
              this.authenticate(data.accessToken)
                .then((result) => {

                  const { uid } = result
                  console.log(uid)
                  this.setState({
                    loader: false
                  })

                  _this.createUser(uid, json, token, fbImage)
                })
            })
            .catch((err) => {
              this.setState({
                loader: false
              })
              console.log(err);
            });
        }
      )
    }
  }
  authenticate = (token) => {

    console.log(token)
    return new Promise((resolve, reject) => {

      const provider = firebase.auth.FacebookAuthProvider
      const credential = provider.credential(token);

      firebase.auth().signInWithCredential(credential).then((res) => {

        resolve(res)
      }).catch((err) => {
        console.log('err', err)
      })
    })
  }

  createUser = (uid, userData, token, dp) => {

    this.getUserDetailsData(uid, userData, token, dp);
    //  console.log(userData)
    // const defaults = {
    //   "uid": uid,
    //   "fbid": userData.id,
    //   "firstname": userData.first_name,
    //   "lastname": userData.last_name,
    //   "email": userData.email,
    //   "picture": dp,
    //   "createdAt": (new Date()).getTime(),
    //   "LastLogin": (new Date()).getTime(),
    //   "flag_leads_badge": 0,
    //   "archieve_leads_badge": 0,
    //   "leads_badge": 0,
    //   "interval": 0,
    //   "from_time": (new Date()).getTime(),
    //   "do_not_disturb": 0
    // }
    // console.log(defaults)
    // firebase.database().ref('users').child(uid).update(defaults)
  }
  //store user details
  getUserDetailsData(uid, user, token, dp) {

    this.setState({
      loader: true
    })
    const { navigate } = this.props.navigation
    // //Get user details from facebook uid

    getUserDetails(uid).then((res1) => {

      this.setState({
        loader: true
      })
      //if user present in db then update.
      updateFacebookUser(uid, user, dp).then((updated_data) => {
        console.log('Old User Updates ', updated_data);
        this.uid = res1;
        if (uid) {

          addDeviceToken(uid).then((data) => {
            console.log(data, 'updateFacebookUserpricepardeep')
            this.setState({
              loader: false
            })
            navigate('Drawer')
            console.log('data', data);
          }).catch((error) => {
            console.log('error', error);
            this.setState({
              loader: false
            })
            navigate('Drawer')
          });
        }
      }).catch((error) => {
        console.log('Login Page : Facebook Error', error);
        this.setState({
          loader: false
        })
        this.logOutUser();
      });

    }).catch((err) => {

      console.log('Login Catch Issue : Facebook Error', err);
      //if user is not present in db then add newly.
      addFacebookUser(uid, user, dp).then((new_data) => {

        console.log('Added New User ', new_data);
        this.uid = new_data;
        if (uid) {
          addDeviceToken(uid).then((data) => {
            console.log(data, 'addFacebookUserpardeeepKumar')
            this.setState({
              loader: false
            })
            navigate('Drawer')
            console.log('data', data);
          }).catch((error) => {
            console.log('error', error);
            this.setState({
              loader: false
            })
            navigate('Drawer')
          });
        }
      }).catch((error) => {
        console.log('Login Page : Facebook Error', error);
        this.setState({
          loader: false
        })
        this.logOutUser();
      });

    });
  }

  logOutUser() {
    const { navigate } = this.props.navigation
    firebase.auth().signOut().then(() => {
      AsyncStorage.removeItem('user_info')
      AsyncStorage.removeItem('fbPages')
      LoginManager.logOut(() => navigate('Login'))
    }).catch(function (error) {
      console.log(error)
    });
  }





  //show modal while takinh permission from user
  manage_pages_Modal = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>


        <View style={{
          backgroundColor: "#fff",
          width: width - 50,
          paddingHorizontal: 10,
          paddingVertical: 10,
          alignSelf: 'center',
          borderRadius: 15,
          borderWidth: 1,
          borderColor: '#fff'
        }}>
          <ScrollView keyboardShouldPersistTaps='always'>
            <View style={{ marginTop: 10 }}>
              <TouchableOpacity onPress={() => this.setState({ visibleModal: false })}>
                <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                  <Icon name="close" size={30} color="#900" />
                </View>
              </TouchableOpacity>
              <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
                We need some permission to Manage your Pages
            </Text>
            </View>

            <View style={{ paddingLeft: 50, paddingRight: 50, paddingTop: 15, paddingBottom: 10 }}>

              <View style={{}}>
                <Button
                  hitSlop={{ right: 20, left: 20, top: 20, bottom: 20 }}

                  title="Accept"
                  color='white'
                  onPress={() => this.manage_pages_permissionFunc.bind(this)}

                  buttonStyle={{
                    backgroundColor: "#507ff7",
                    borderRadius: 50
                  }}
                  textStyle={{ color: '#fff' }}
                />


              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }

  render() {
    let privacyUrl = "https://notifylead.com/privacy-policy/"
    let termsUrl = "https://notifylead.com/terms-and-condition/"

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', }}>
        <View style={{
          flex: 2,
          backgroundColor: '#ffffff',
          paddingHorizontal: 10,
          justifyContent: 'center', alignContent: 'center',
        }}>
          <View style={{
            flex: 1.5, flexDirection: 'column', justifyContent: 'center',
            alignContent: 'center'
          }}>
            <View style={{ flex: 0.5, justifyContent: 'center', alignContent: 'center' }}>
              <Image source={logo} resizeMode="contain" style={{
                alignSelf: 'center',
                width: 100
              }} />
            </View>

            {/* <View style={{
              flex: 0.1,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
              <Button
                backgroundColor="#507ff7"
                leftIcon={{
                  name: 'facebook-official', style: { fontSize: 24 },
                  type: 'font-awesome',
                }}
                buttonStyle={styles.someButtonStyle}
                textStyle={{ fontSize: 18, fontWeight: '600', color: '#FCFBFF' }}
                title='show popup'

                onPress={this.showModal.bind(this)}
              // containerViewStyle={{height:120}}
              // onPress={() => { this.props.navigation.navigate('Drawer') }}
              />

            </View>  */}

            <View style={{
              flex: 0.1,
              justifyContent: 'center',
              alignContent: 'center',
            }}>
              <Button
                backgroundColor="#507ff7"
                leftIcon={{
                  name: 'facebook-official', style: { fontSize: 24 },
                  type: 'font-awesome',
                }}
                buttonStyle={styles.someButtonStyle}
                textStyle={{ fontSize: 18, fontWeight: '600', color: '#FCFBFF' }}
                title='Continue with Facebook'

                onPress={this.handleFbLogin.bind(this)}
              // containerViewStyle={{height:120}}
              // onPress={() => { this.props.navigation.navigate('Drawer') }}
              />

            </View>
          </View>
          <View style={{ flex: 0.3, justifyContent: 'center', alignContent: 'center' }}>
            <View >
              <Text style={{ fontSize: 14, color: '#797979', alignSelf: 'center', }}>
                <Text>Don't have an account yet? </Text>
                {/* <TouchableOpacity onPress={() => this.handleFbLogin(this)}>
                  <View> */}
                <Text style={{ color: '#3B5998', textDecorationLine: 'underline' }} onPress={() => this.handleFbLogin(this)}> Sign Up </Text>
                {/* </View>
                </TouchableOpacity> */}

                <Text style={{ textAlign: 'center' }}> for Facebook</Text></Text>
            </View>
            <View style={{
              flex: 0.8,
              justifyContent: 'center', alignItems: 'center'
            }}>
              <View style={{ paddingBottom: 5, }}>
                <Text style={{ fontSize: 12, color: '#797979', }}>By logging in you agree to our</Text>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Text style={{ textAlign: 'center' }}>
                  {/* <TouchableOpacity onPress={() => this.props.navigation.navigate('Web', { data: termsUrl })}
                  > */}

                  <Text style={{ fontSize: 14, color: '#797979', fontWeight: 'bold' }}
                    onPress={() => this.props.navigation.navigate('Web', { data: termsUrl })}
                  >Terms of Service </Text>

                  {/* </TouchableOpacity> */}
                  {/* <TouchableOpacity disabled={true}> */}
                  <Text style={{ fontSize: 14, color: '#797979', }}> and </Text>
                  {/* </TouchableOpacity> */}

                  {/* <TouchableOpacity onPress={() => this.props.navigation.navigate('Web', { data: privacyUrl })}>
                    <View> */}

                  <Text onPress={() => this.props.navigation.navigate('Web', { data: privacyUrl })}
                    style={{ fontSize: 14, color: '#797979', fontWeight: 'bold' }}>Privacy Policy </Text>
                  {/* </View> */}

                  {/* </TouchableOpacity> */}

                </Text>

              </View>
            </View>

          </View>
          {/* <View style={{ flex: 0.3, justifyContent: 'center', alignContent: 'center' }}>
            <View >
              <Text style={{ fontSize: 14, color: '#797979', alignSelf: 'center', }}>
                <Text>Don't have an account yet? </Text>
                <TouchableOpacity onPress={() => this.handleFbLogin(this)}>
                  <View>
                    <Text style={{ color: '#3B5998', textDecorationLine: 'underline' }}> Sign Up </Text>
                  </View>
                </TouchableOpacity>

                <Text style={{ textAlign: 'center' }}> for Facebook</Text></Text>
            </View>
            <View style={{
              flex: 0.7,
              justifyContent: 'center', alignItems: 'center'
            }}>
              <View style={{ paddingBottom: 5, }}>
                <Text style={{ fontSize: 12, color: '#797979', }}>By logging in you agree to our</Text>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Text style={{ textAlign: 'center' }}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Web', { data: termsUrl })}
                  >
                    <View>
                      <Text style={{ fontSize: 14, color: '#797979', fontWeight: 'bold' }}>Terms of Service </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity disabled={true}>
                    <Text style={{ fontSize: 14, color: '#797979', }}> and </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Web', { data: privacyUrl })}>
                    <View>

                      <Text style={{ fontSize: 14, color: '#797979', fontWeight: 'bold' }}>Privacy Policy </Text>
                    </View>

                  </TouchableOpacity>

                </Text>

              </View>
            </View>

          </View> */}
          {this.state.loader && <View style={{
            flex: 1, left: width / 2,
            right: width / 2, top: height / 2, bottom: height / 2, position: 'absolute'
          }}>
            <ActivityIndicator color='#5890FF' size='large' />
          </View>}

          {/*** start Modal*****/}

          <View>
            <Modal
              isVisible={this.state.visibleModal}
              backdropColor={'rgba(0.30,0.30,0.30,0.70)'}
              backdropOpacity={0.4}
              onBackButtonPress={() => this.setState({
                visibleModal: false
              })}
              onBackdropPress={() => this.setState({
                visibleModal: false,
              })}
              style={{ width: '95%', alignSelf: 'center', }}>
              {
                (Platform.OS === 'ios') ?
                  <KeyboardAvoidingView style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }} behavior="padding" enabled >
                    {this.manage_pages_Modal()}

                  </KeyboardAvoidingView > :
                  this.manage_pages_Modal()
              }

            </Modal>
          </View>

          {/***finish Modal*****/}



        </View>
      </SafeAreaView >
    );
  }
}

export default Login

const styles = StyleSheet.create({
  someButtonStyle: {
    justifyContent: 'center',
    borderRadius: 5,
    padding: 10
    // alignSelf:'flex-start',
  },
  WebViewStyle:
  {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,

  }

})