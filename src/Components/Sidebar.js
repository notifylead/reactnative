import React, { Component } from "react";
import { Share, StyleSheet, ActivityIndicator } from 'react-native';
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;
import { FORMLEAD_ACTION_TYPES } from '../Actions/ActionTypes'
import {
  DrawerActions
} from 'react-navigation';
import firebase from 'firebase'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { LeadListData } from '../Config/Data'
import { Header, Icon } from 'react-native-elements'
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import Modal from "react-native-modal";
import Appsettings from '../Components/Settings/App Settings/Appsettings';
import Ionicons from 'react-native-vector-icons/Ionicons'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { Badge } from 'react-native-elements';
import {
  listLeadAll, getLeadData, getleadgenforms, listLeadSingleDelete, getFlagLead,
  removeLeadForm, listLeadForm, getBadgeCounts, updateUserData, getSingleLead
} from '../Actions/LeadsAction';
import { flagListLeadSingle, deleteFlagLead } from '../Actions/FlagLeadAction'
import { archieveListLeadSingle, deleteArchieveLead, archieveLead } from '../Actions/ArchiveLeadAction'
import { removeDeviceToken } from '../Actions/AuthAction'
// let service1 = require('../Assets/home/service1.png')
let gray_dollar_on_card = require('../Assets/icon/gray_dollar_on_card.png')
let help_center = require('../Assets/icon/help_question.png')
let terms_conditon = require('../Assets/icon/file.png')
let app_setting = require('../Assets/icon/gear_wheel.png')
let report_problem = require('../Assets/icon/chat_bublle.png')
let logout = require('../Assets/icon/logout.png')
import Auth from '../Routes'
let url1 = "https://notifylead.com/contact-us/"

let url2 = "https://notifylead.com/terms-and-condition/"
const FBSDK = require('react-native-fbsdk');
const {
  LoginManager,
  AccessToken
} = FBSDK;
const hitSlop = { top: 15, bottom: 15, left: 15, right: 15 };

import {
  Image,
  Platform,
  Dimensions,
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Linking,
  BackHandler,
  AsyncStorage,
  SafeAreaView
} from "react-native";


const datas = [
  {
    name: "Subscription",
    route: "Subscription",
    icon: gray_dollar_on_card,
    bg: "#DEDEDE"
  },
  {
    name: "Help Centre",
    route: "Web",
    icon: help_center,
    bg: "#DEDEDE"
  },
  // {
  //   name: "Terms & Policies",
  //   route: "Web",
  //   icon: terms_conditon,
  //   bg: "#DEDEDE"
  // },
  {
    name: "App Settings",
    route: "Appsettings",
    icon: app_setting,
    bg: "#DEDEDE"
  },
  {
    name: "Report a Problem",
    route: "Web",
    icon: report_problem,
    bg: "#DEDEDE"
  },
  {
    name: "Logout",
    route: "Logout",
    icon: logout,
    bg: "#DEDEDE"
  },

];


class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4,
      userName: '',
      result: '',
      delete: false,
      modalVisible: false,
      colorVal: false,
      FbPageList: [],
      deleteItem: null, loader: false
    };
    this.onSelect = this.onSelect.bind(this)
    // this.logOutUser = this.logOutUser.bind(this)
    // this.onBackPress = this.onBackPress.bind(this)
  }


  componentDidMount() {
    console.log("hererree", this.props)

    let userId = firebase.auth().currentUser.uid;
    this.props.listLeadForm(userId).then((res) => {
      console.log(res)
      if (res) {
        this.setState({
          FbPageList: res
        })
      }
    }).catch((err) => {
      console.log("Errr", err)
    })
    // Call badge Count 
    this.getBadgeCountsDetails()
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps, "jhghg")

    console.log(nextProps.flag_badge, "nextProps.archieve_badgenextProps.archieve_badgenextProps.archieve_badge", nextProps.archieve_badge)
    this.setState({
      FbPageList: nextProps.leads,
      archieve_badge: nextProps.archieve_badge,
      flag_badge: nextProps.flag_badge
    })
  }
  //Get All Form Lead
  getBadgeCountsDetails() {
    getBadgeCounts().then((data) => {
      console.log(data, "data is handle by me")
      this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: data.flag_leads_badge ? data.flag_leads_badge : 0 })
      this.props.dispatch({ type: 'UPDATE_ARCHIVE_BADGE', archieve_badge: data.archieve_leads_badge ? data.archieve_leads_badge : 0 })
      this.setState({
        flag_badge: data.flag_leads_badge ? data.flag_leads_badge : 0,
        archieve_badge: data.archieve_leads_badge ? data.archieve_leads_badge : 0,
        leads_badge: data.leads_badge ? data.leads_badge : 0
      })
    }).catch((err) => {
      console.log(err)
    })
  }

  getLead(item) {
    // this.props.navigation.goBack()
    // this.props.navigation.closeDrawer();
    this.props.navigation.navigate('AllLeads', {
      title: item.leads_ads_form, formData: item, type: 'single'
    })
  }
  getLeadAll() {
    // this.props.navigation.closeDrawer();
    // console.log( this.props.navigation," this.props.navigation this.props.navigation")
    //     this.props.navigation.setParams({ title: 'All Leads', type: 'multiple' })
    // this.props.navigation.goBack()
    this.props.navigation.navigate('AllLeads', { title: 'All Leads', type: 'multiple' })
  }


  //Delete Lead

  deleteRadioForm() {
    debugger
    let lead_list = []
    let flag_lead_list = []
    let archieve_lead_list = []
    let userId = firebase.auth().currentUser.uid;
    if (this.state.deleteItem) {
      this.setState({
        loader: true
      })
      console.log(this.state.deleteItem)
      let formKey = this.state.deleteItem.key
      let formId = this.state.deleteItem.formId
      let uid = this.state.deleteItem.uid

      console.log("formId", formId)
      // var lead_list = self.leadsService.listLeadSingleDelete(formId);

      listLeadSingleDelete(formId).then((res) => {
        lead_list = res
      }).catch((err) => {
        this.setState({
          loader: false, modalVisible: false, delete: false,
        })
        console.log("errrr", err)
      });

      flagListLeadSingle(formId).then((res) => {
        flag_lead_list = res
        console.log(flag_lead_list, "flag_lead_list")
      }).catch((err) => {
        this.setState({
          loader: false, modalVisible: false, delete: false,
        })
        console.log("errrr", err)
      });

      archieveListLeadSingle(formId).then((res) => {
        archieve_lead_list = res
        console.log(archieve_lead_list, "archieve_lead_list")
      }).catch((err) => {
        this.setState({
          loader: false, modalVisible: false, delete: false,
        })
        console.log("errrr", err)
      });



      removeLeadForm(formKey).then((res) => {
        console.log("Form deleted", res)
        for (var i = 0; i < lead_list.length; i++) {
          archieveLead(lead_list[i]).then((res) => {
            this.setState({
              modalVisible: false, delete: false, loader: false
            })
          }).catch((err) => {
            this.setState({
              loader: false, modalVisible: false, delete: false,
            })
            console.log(err)
          })
        }
        lead_list = null;

        for (var i = 0; i < flag_lead_list.length; i++) {
          deleteFlagLead(flag_lead_list[i]).then((res) => {
            let badge_data = {
              flag_leads_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0
            };
            updateUserData(badge_data, uid).then((userUpdate) => {
              this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0 })
            }).catch((err) => {
              console.log("Update badge error")
            })
            console.log(res)
          }).catch((err) => {
            this.setState({
              loader: false, modalVisible: false, delete: false,
            })
            console.log(err)
          })
        }
        flag_lead_list = null;
        for (var i = 0; i < archieve_lead_list.length; i++) {
          deleteArchieveLead(archieve_lead_list[i]).then((res) => {
            let archie_badge_data = {
              archieve_leads_badge: this.state.archieve_badge > 0 ? this.state.archieve_badge - 1 : 0
            };
            updateUserData(archie_badge_data, uid).then((userUpdate) => {
              this.props.dispatch({ type: 'UPDATE_ARCHIVE_BADGE', archieve_badge: this.state.archieve_badge > 0 ? this.state.archieve_badge - 1 : 0 })

            }).catch((err) => {
              console.log("Update badge error")
            })
            console.log(res)
          }).catch((err) => {
            this.setState({
              loader: false, modalVisible: false, delete: false,
            })
            console.log(err)
          })
        }
        archieve_lead_list = null

        // this.props.listLeadForm(userId).then((res) => {
        this.setState({
          modalVisible: false, delete: false, loader: false
        })
        console.log(res)
        // }).catch(err => {
        //   this.setState({
        //     modalVisible: false, delete: false, loader: false
        //   })
        // console.log("err", err)
        //})

      }).catch((err) => {
        console.log(err)
        this.setState({
          modalVisible: false, delete: false, loader: false
        })
      })
    }
  }

  onSelect(index, value) {
    console.log(index, "", value)
    this.setState({
      colorVal: true,
      value: value,
      modalVisible: true,
      deleteItem: value
    }, () => { console.log(this.state.deleteItem) })
  }
  settingFunction(name, route) {

    if (name == 'Logout') {
      this.logOutUser()
    } else if (name == 'Help Centre') {
      this.props.navigation.navigate(route, { data: url1 })
    } else if (name == 'Report a Problem') {
      this.props.navigation.navigate(route, { data: url1 })
    }
    // else if (name == 'Terms & Policies') {
    //   this.props.navigation.navigate(route, { data: url2 })
    // } 
    else {
      this.props.navigation.navigate(route)
    }

  }
  _keyExtractor = (item, index) => index + 'leadlist';
  _renderItemView = ({ item, index }) => {
    return (
      <TouchableOpacity hitSlop={hitSlop} onPress={this.state.delete ? console.log() : () => this.getLead(item)} activeOpacity={0.8}>
        <View style={styles.listView}>
          <View style={{ paddingVertical: 10, paddingLeft: 10 }}>
            {
              this.state.delete ?
                null
                // <RadioGroup
                //   color='gray'
                //   size={18}
                //   activeColor={'#5890FF'}
                //   thickness={2}
                //   // selectedIndex={index}
                //   onSelect={(index, item) => this.onSelect(index, item)}
                // >
                //   <RadioButton value={item}>
                //     <View style={{ paddingLeft: 5, alignItems: 'flex-start', justifyContent: 'center' }}>
                //       <Text style={{ fontSize: 14, color: 'black' }} numberOfLines={1}>{item.leads_ads_form}</Text>
                //     </View>
                //   </RadioButton>
                // </RadioGroup>
                :
                <Image source={{ uri: item.page_picture }} style={{ height: 35, width: 35 }} resizeMode='contain' />
            }
          </View>
          {/* {
            !this.state.delete ? */}
          <View style={{ flex: 0.8, alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Roboto-Regular' }} numberOfLines={1}>{item.leads_ads_form}</Text>
          </View>
          {/* <View style={{ padding: 5, alignItems: 'center', justifyContent: 'center' }}>
                
                  
                </View> */}
          {/* :
              null
          } */}

          <View style={{ padding: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            {
              item.badge_count > 0 && <Badge
                containerStyle={{ backgroundColor: '#4286f4' }}
                value={item.badge_count}
                textStyle={{ color: 'white' }}
              />
            }
            {
              this.state.delete ?
                <TouchableOpacity hitSlop={hitSlop} onPress={() => this.onSelect(index, item)}>
                  <Ionicons name='ios-trash' size={30} color='#DEDEDE' />
                </TouchableOpacity>
                :
                <Icon name='chevron-right' size={38} color='#DEDEDE' />
            }
          </View>
        </View>
      </TouchableOpacity >
    )
  }
  // setting section
  _keyExtractor = (item, index) => index + 'settinglist';
  _renderSettingList = ({ item, index }) => {
    return (
      <TouchableOpacity hitSlop={hitSlop} onPress={
        () => this.settingFunction(item.name, item.route)
        // (item.name == 'Logout') ?
        //   () => this.logOutUser()
        //   :
        //   (item.name == 'Help Centre' || item.name == 'Report a Problem') ?
        //     () => this.props.navigation.navigate(item.route, { data: url1 })
        //     :
        //     (item.name == 'Terms & Policies') ?
        //       () => this.props.navigation.navigate(item.route, { data: url2 })
        //       :
        //       () => this.props.navigation.navigate(item.route)

      } >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomColor: '#dcdcdc', borderBottomWidth: 1 }}>
          <View style={{ flex: 0.1, padding: 10, paddingLeft: 15 }}>
            <Image source={item.icon} style={{ height: 20, width: 20 }} resizeMode='contain' />
          </View>
          <View style={{ flex: 0.9, padding: 10, alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Roboto-Regular' }}>{item.name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
  authSignOut() {
    debugger
    const { navigate } = this.props.navigation
    firebase.auth().signOut().then(() => {
      AsyncStorage.removeItem('user_info')
      AsyncStorage.removeItem('fbPages')
      AsyncStorage.removeItem('devicetoken')
      LoginManager.logOut(() => navigate('Login'))

    }).catch(function (error) {
      console.log(error)
    });
  }
  logOutUser() {
    debugger
    LoginManager.logOut()
    let uid = firebase.auth().currentUser.uid
    if (uid) {
      removeDeviceToken(uid).then((data) => {
        if (data) {
          this.authSignOut()
        }
      }).catch((error) => {
        this.authSignOut()
      });
    } else {
      alert("No user found")
    }


  }


  deleteLead() {
    this.setState({
      delete: !this.state.delete
    })
  }


  render() {
    return (
      <SafeAreaView style={{ flex: 1, }}>
        <View style={{ flex: 1, backgroundColor: "#fcfcfc", marginBottom: 50, marginTop: 15 }} ref="sidebarref">
          <View style={{ padding: 10 }}>
            <Text style={styles.leadAds}>LEAD ADS</Text>
          </View>
          <ScrollView>

            <TouchableOpacity hitSlop={hitSlop} onPress={() => this.getLeadAll()
              // this.props.navigation.navigate('AllLeads',{data : [],title:'All Leads'})
            }>
              <View style={styles.allLead}>
                <View style={{ flex: 0.5, padding: 10 }}>
                  <Text style={styles.leadSectionText}>All Leads</Text>
                </View>
                <View style={{ flex: 0.1, padding: 10 }}>
                  <Icon name='chevron-right' size={38} color='#DEDEDE' />
                </View>
              </View>
            </TouchableOpacity>
            <View style={{}}>
              <FlatList
                extraData={[this.state.delete, this.state.colorVal]}
                data={this.state.FbPageList}
                keyExtractor={this._keyExtractor.bind(this)}
                renderItem={this._renderItemView.bind(this)}
              />
            </View>
            <TouchableOpacity hitSlop={hitSlop} onPress={() => this.props.navigation.navigate('FlagLead')}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#dcdcdc', borderBottomWidth: 1 }}>


                <View style={{ flex: 0.9, padding: 10 }}>
                  <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Roboto-Regular' }}>Flagged Leads</Text>
                </View>

                {/* <View style={{ padding: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <Badge
                    containerStyle={{ backgroundColor: 'orange' }}
                    value={this.state.flag_badge}
                    textStyle={{ color: 'white' }}
                  />
                </View> */}
                <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  {
                    this.state.flag_badge > 0 && <Badge
                      containerStyle={{ backgroundColor: 'orange' }}
                      value={this.state.flag_badge}
                      textStyle={{ color: 'white' }}
                    />
                  }
                  <Icon name='chevron-right' size={38} color='#DEDEDE' />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity hitSlop={hitSlop} onPress={() => this.props.navigation.navigate('ArchivedLead')}>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                borderBottomColor: '#dcdcdc', borderBottomWidth: 1
              }}>
                <View style={{ flex: 0.9, padding: 10 }}>
                  <Text style={{ fontSize: 16, color: 'black', fontFamily: 'Roboto-Regular' }}>Archived Leads</Text>
                </View>
                {/* <View style={{ padding: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <Badge
                    containerStyle={{ backgroundColor: '#4286f4' }}
                    value={this.state.archieve_badge}
                    textStyle={{ color: 'white' }}

                  />
                </View> */}
                <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  {
                    this.state.archieve_badge > 0 && <Badge
                      containerStyle={{ backgroundColor: '#4286f4' }}
                      value={this.state.archieve_badge}
                      textStyle={{ color: 'white' }}

                    />
                  }
                  <Icon name='chevron-right' size={38} color='#DEDEDE' />
                </View>
              </View>

            </TouchableOpacity>
            <TouchableOpacity hitSlop={hitSlop} onPress={() => { this.props.navigation.navigate('SelectFbPage'), this.props.navigation.navigate('DrawerClose') }}>
              <View style={styles.leadAddSection}>
                <View style={{ flex: 0.1, padding: 10, paddingLeft: 15 }}>
                  <EvilIcon name='plus' size={25} color='#DEDEDE' />
                </View>
                <View style={{ flex: 0.9, padding: 10 }}>
                  <Text style={styles.leadSectionText}>Add Lead Ads Form</Text>
                </View>

              </View>
            </TouchableOpacity>

            <View style={styles.leadAddSection}>
              <View style={{ flex: 0.1, padding: 10, paddingLeft: 15 }}>
                <EvilIcon name='minus' size={25} color='#DEDEDE' />
              </View>

              <View style={{ flex: 0.9, padding: 10 }}>
                <TouchableOpacity hitSlop={hitSlop} onPress={this.deleteLead.bind(this)}>
                  <Text style={styles.leadSectionText}>Remove Lead Ads Form</Text>
                </TouchableOpacity>
              </View>

            </View>

            <View style={{ backgroundColor: '#F6F7F8' }}>
              <View style={{ flex: 0.9, padding: 5 }}>
                <Text style={styles.setting}>SETTINGS</Text>
              </View>
            </View>

            {/* setting section */}
            <View style={{}}>
              <FlatList
                data={datas}
                keyExtractor={this._keyExtractor.bind(this)}
                renderItem={this._renderSettingList.bind(this)}
              />
            </View>
          </ScrollView>
        </View>
        <Modal isVisible={this.state.modalVisible}
          style={styles.modal}
          onBackdropPress={() => this.setState({ modalVisible: false, delete: false, colorVal: false })}
          modalDidOpen={() => console.log('modal did open')}
          modalDidClose={() => this.setState({ modalVisible: false, delete: false, colorVal: false })}
          onBackButtonPress={() => this.setState({ modalVisible: false, delete: false, colorVal: false })}
          size={this.state.size}
          color={this.state.color}
          animationIn={"slideInUp"}
          animationOut={"slideOutDown"}
          backdropColor='rgba(0,0,0,0.3)'
        >
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Text style={{ padding: 18, fontFamily: 'Roboto-Regular' }}>Do you want to delete this lead form?</Text>
            <Text style={{ padding: 18, color: 'black', fontFamily: 'Roboto-Regular' }} onPress={() => this.deleteRadioForm()}>Delete</Text>
            <Text style={{ padding: 18, color: 'black', fontFamily: 'Roboto-Regular' }} onPress={() => this.setState({ modalVisible: false, delete: false, colorVal: false })}>Cancel</Text>
          </View>
        </Modal>
        {this.state.loader && <View style={{ position: 'absolute', top: deviceHeight / 2, bottom: deviceHeight / 2, left: deviceWidth / 2, right: deviceWidth / 2, justifyContent: 'center' }}>
          <ActivityIndicator color={'#5890FF'} size='large' />
        </View>}


      </SafeAreaView>
    );
  }
}


//mapping reducer states to component
function mapStateToProps(state) {

  return {
    leads: state.Leads.listLead,
    formLead: state.Leads.formLead,
    archieve_badge: state.Leads.archieve_badge,
    flag_badge: state.Leads.flag_badge
  }
}
//mapping dispatcheable actions to component
function mapDispathToProps(dispatch) {
  return bindActionCreators({ listLeadForm, dispatch }, dispatch);
}
export default connect(mapStateToProps, mapDispathToProps)(SideBar)

const styles = StyleSheet.create({
  leadAddSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#dcdcdc',
    borderBottomWidth: 1
  },
  leadSectionText: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Roboto-Regular',
  },
  setting: {
    fontSize: 16,
    color: '#ADB2BA',
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold'
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    margin: 0,
    right: 0,
    left: 0,
    justifyContent: 'center',
  },
  allLead: {
    backgroundColor: '#D9D9D9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  leadAds: { fontSize: 12, color: '#C6CACF', fontWeight: 'bold', fontFamily: 'Roboto-Bold' },
  listView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#dcdcdc',
    borderBottomWidth: 1
  }

})
