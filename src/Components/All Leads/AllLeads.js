import React, { Component } from 'react'
import firebase from 'firebase'

import {
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    Alert, Platform,
    AsyncStorage, ScrollView, SafeAreaView,
    ActivityIndicator, Dimensions, Linking, FlatList, RefreshControl, TextInput

} from 'react-native'
import { FORMLEAD_ACTION_TYPES } from '../../Actions/ActionTypes'
const FBSDK = require('react-native-fbsdk');
const {
    GraphRequest,
    GraphRequestManager,
} = FBSDK;
import axios from 'axios';
import { HerokuConfig } from '../../Config/index'
import InAppBilling from 'react-native-billing'
import { NativeModules } from 'react-native';
const { InAppUtils } = NativeModules
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
// import iapReceiptValidator from 'iap-receipt-validator';

import header from '../../Common/Header'
import { Button, SearchBar, Header, CheckBox, Icon } from 'react-native-elements';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
let defaultimage = require('../../Assets/img/inbox-old.png');
import * as _ from 'underscore';
import { getUserDetails, checkIsSubscibed } from '../../Actions/AuthAction'
import Swipeout from 'react-native-swipeout';
import moment from 'moment';
import {
    getFormLeadssssDetais,
    getLeadData, getleadgenforms, listLeadAll, getLeadDatail, updateUserData, listLeadForm, getFlagLead, listLeadForm1, updateFormData2, updateLead,
    addFlagLead, flagLeadUpdate, getBadgeCounts, removeFlagLead, getSingleLead
} from '../../Actions/LeadsAction';
import { addArchieveLead, archieveLead, removeFlagLeadId, archiveLeadUpdate } from '../../Actions/ArchiveAction';
const { width, height } = Dimensions.get('window')

const flag = require("../../Assets/img/flag.png");
const archive = require("../../Assets/img/ar.png");
const orange_color_circle = require("../../Assets/img/orange_color_circleold.png")
let self
const hitSlop = { top: 15, bottom: 15, left: 15, right: 15 };

class MyCustomRightComponent extends Component {
    render() {
        return (
            <View>
                {
                    this.props.showButton && <TouchableOpacity hitSlop={hitSlop} onPress={() => this.props.showEditCancel()}>
                        <Text style={{ fontSize: 16, color: '#5890ff', fontWeight: 'bold', alignSelf: 'center', fontFamily: 'Roboto-Bold' }} >
                            {this.props.showEdit ? 'CANCEL' : 'EDIT'}
                        </Text>
                    </TouchableOpacity>
                }
            </View>
        )
    }
}
function formatAMPM(d) {

    console.log(d, "formating time")

    if (d) {
        let date = new Date(d);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        alert(d)
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

}


class AllLeads extends Component {
    constructor(props) {
        super(props)
        console.log(this.props);
        this.state = {
            refreshing: false,
            loader: false,
            getLead: [],
            title: null,
            showEdit: false,
            checked: [],
            SelectedPageForms: [],
            searchItems: [],
            archieve_badge: 0,
            fromViewLead: false,
            flag_badge: 0,
            checkedarr: [],
            markAll: null,
            leadData: {},
            updatedFormLead: false,
            showSearchbar: false,
            showCancel: false,
            search: '',
            searchTerm: '',
            subscribe_type: null,
            searchValue: '',
            text: '',
            fromFirstTime: false,
            noSearch: false,
            formId: null,
            log: [],
            isDataExits: [],
            products_list: []
        }

        this.subscribe_type = null;
        self = this
        this.lead_local_list = [];

        this.callWillReceive = true

        this.console = {};
        this.console.log = (message) => {
            console.log(message)
            this.state.log.push(message)
        }
    }

    handleSubscription = (uid) => {
        debugger
        let data = {}
        // data["subscribeDevice"] = ""
        data["subscribe_type"] = ""
        data["isSubscribe"] = false
        // data["expiry_date"] = ""
        data["expired_status"] = true
        return new Promise((resolve, reject) => {
            firebase.database().ref().child('/users/' + uid).update(data).then(function (snapshot) {
                var data = snapshot && snapshot.val();
                if (data !== null) {
                    resolve('updated user data');
                } else {
                    reject('User not exist');
                }
            })

        });
    }
    //delete subscribe data from collection
    deleteSubscription = (uid) => {
        debugger
        return new Promise((resolve, reject) => {
            firebase.database().ref().child('subscribe').child(uid).remove().then(function () {
                resolve('removed subscribe data');
            }, function (err) {
                reject(err);
            });
        });
    }

    restore_subscription(payload_data) {
        debugger
        return new Promise((resolve, reject) => {
            debugger
            var headers =
            {
                'Content-Type': 'application/json',
            }
            let base_url = HerokuConfig.HKURL + 'getTransactionDetails';
            axios.post(base_url, payload_data, { headers: headers }).then(res => {
                console.log(res.data.data, 'RESPONSE GOT FROM heroku')
                resolve(res.data.data)
            }).catch(err => {
                if (err.response) {
                    reject(err.response.data)
                } else {
                    reject(err.message)
                }
            })
        })

    }

    async componentDidMount() {
        debugger
        console.log(moment().subtract(1, 'days').format('llll'), 'gettin time')

        var previousDay = new Date(moment().subtract(1, 'days'));
        var previousDayDateTime = previousDay.getTime();

        var currentDay = new Date();
        var currentDayDateTime = currentDay.getTime();

        var currentDate = moment(currentDayDateTime).format("DD-MM-YYYY");
        console.log(currentDate, 'currentDate')


        console.log(previousDayDateTime, 'previousDayDateTime')
        console.log(currentDayDateTime, 'currentDayDateTime')



        let uid = firebase.auth().currentUser.uid;
        await this.getUserDetails(uid).then((res) => {
            console.log(res, 'rest')
            let user = res
            var expiryDate = moment(user.expiry_date).format("DD-MM-YYYY");
            var previousDate = moment(previousDayDateTime).format("DD-MM-YYYY");
            // || user.expiry_date >= previousDayDateTime 
            // expiryDate == currentDate
            // 
            if (user && (user.isSubscribe || user.subscribe_type) && (user.expiry_date < currentDayDateTime)) {
                if (Platform.OS === "ios") {
                    this.state.products_list = ['monthly_fblead_subscription', 'yearly_fblead_subscription'];
                    InAppUtils.loadProducts(this.state.products_list, (error, products) => {
                        if (error) {
                            alert("please reopen App")
                            this.setState({ loader: false })
                        }
                        else {
                            this.setState({ loader: false, product_list: products })
                            InAppUtils.restorePurchases((error, response) => {
                                if (error) {
                                    console.log("err found in restorePurchases", error);
                                } else {
                                    this.setState({ loader: true })
                                    if (response) {
                                        let restore_data = _.sortBy(response, function (item) {
                                            return (new Date(item.transactionDate).getTime());
                                        })
                                        if (restore_data && restore_data.length != 0) {
                                            let latest_record = restore_data[0];
                                            InAppUtils.receiptData((error, receiptData) => {
                                                if (receiptData) {
                                                    console.log("receipt success");
                                                    latest_record.receipt = receiptData;
                                                    latest_record.uid = uid;
                                                    this.restore_subscription(latest_record).then((res) => {
                                                        if (res == "Restored Successfully") {
                                                            this.setState({ loader: false })
                                                        }
                                                        else {
                                                            if (user.expiry_date < currentDayDateTime) {
                                                                this.handleSubscription(uid).then((res) => {
                                                                    debugger
                                                                    if (res) {
                                                                        this.deleteSubscription(uid).then((success) => {
                                                                            debugger
                                                                            if (success) {
                                                                                this.setState({ loader: false })
                                                                                console.log(success, 'success')
                                                                                // alert(JSON.stringify(success) + "handleSubscription")
                                                                            }
                                                                        }).catch((err) => {
                                                                            this.setState({ loader: false })
                                                                            console.log(err.message, 'err')
                                                                        })
                                                                    }
                                                                }).catch((err) => {
                                                                    this.setState({ loader: false })
                                                                    console.log(err.message, 'err')
                                                                    // alert(JSON.stringify(err))
                                                                })
                                                            }
                                                            this.setState({ loader: false })
                                                        }
                                                        alert(JSON.stringify(res))
                                                        console.log('update res', res);
                                                    }).catch((err) => {
                                                        debugger
                                                        this.setState({ loader: false })
                                                        alert(err + "120")
                                                        console.log('err', err);
                                                    });
                                                } else {
                                                    this.setState({ loader: false })
                                                    alert(JSON.stringify(error) + "230")
                                                }

                                            })

                                        } else {
                                            this.setState({ loader: false })
                                        }
                                    } else {
                                        this.setState({ loader: false })
                                    }
                                }
                            })
                        }
                    })
                }
                else {
                    InAppBilling.open()
                        .then(() => {
                            InAppBilling.isSubscribed(user.subscribe_type).then((response) => {
                                if (!response) {
                                    this.handleSubscription(uid)
                                }
                                console.log(response)
                                InAppBilling.close()
                            }).catch((err) => {
                                console.log(err);
                                InAppBilling.close()
                            });
                        })
                }
            }
        })
        this.setState({
            noSearch: false, showSearchbar: false, showCancel: false,
        })

        let { params } = this.props.navigation.state
        if (!(params && params.type)) {

            // let userId = firebase.auth().currentUser.uid;
            // this.setState({ loader: true, title: 'All Leads', })
            // this.getListOfLeads(userId)

            this.props.navigation.setParams({ type: 'multiple' })

        } else {
            if (params && params.type == 'single') {
                this.setState({ title: params.title }, () => {
                })
                this.getSingleListLead(params.formData.formId)
            }

            if (params && params.type == 'multiple') {

                let userId = firebase.auth().currentUser.uid;
                this.setState({ loader: true, title: 'All Leads', })
                this.getListOfLeads(userId)

            }

        }
        // //Get All Form Lead
        getBadgeCounts().then((data) => {
            this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: data.flag_leads_badge ? data.flag_leads_badge : 0 })
            this.props.dispatch({ type: 'UPDATE_ARCHIVE_BADGE', archieve_badge: data.archieve_leads_badge ? data.archieve_leads_badge : 0 })
        }).catch((err) => {
            console.log(err)
        })


    }

    async getUserDetails(uid) {
        debugger
        return new Promise((resolve, reject) => {
            firebase.database().ref('/users/' + uid).once('value').then(async (snapshot) => {
                let data = await snapshot && snapshot.val();
                console.log(JSON.stringify(data), "datatatatatata")
                if (data !== null) {
                    resolve(data);
                } else {
                    reject('User not exist');
                }
            })

        })
    }

    updateData(status) {
        this.setState({ fromViewLead: status })
    }
    drawerClick() {
        alert("Click Me")
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            noSearch: false, showSearchbar: false, showCancel: false,
            formId: nextProps.navigation.state.params && nextProps.navigation.state.params.formData ? nextProps.navigation.state.params.formData.formId : null,
        })
        if (nextProps.navigation.state && nextProps.navigation.state.params && nextProps.navigation.state.params.type == 'single') {
            let { formData, title, type } = nextProps.navigation.state.params
            this.getSingleListLead(formData.formId)
        }
        if (this.props.navigation && nextProps && nextProps.navigation &&
            (this.props.navigation.state.params == undefined || nextProps.navigation.state.params == undefined ||
                this.props.navigation.state.params.type != nextProps.navigation.state.params.type
            )
        ) {
            if (nextProps.navigation.state.params && nextProps.navigation.state.params.type == 'multiple') {

                let userId = firebase.auth().currentUser.uid;
                this.setState({ loader: true, title: 'All Leads', })
                this.getListOfLeads(userId)
            }

        }

        this.setState({
            archieve_badge: nextProps.archieve_badge,
            flag_badge: nextProps.flag_badge,
        }, () => {
            console.log("here ins badhe ", this.state.getLead)
        })
    }
    // single Leads
    async getSingleListLead(formId) {
        debugger
        this.lead_all_list = []
        const retrievedItem = await AsyncStorage.getItem("user_info");
        const itemVal = JSON.parse(retrievedItem);
        const access_token = itemVal.accessToken
        getSingleLead(formId).then((lead) => {

            self.lead_local_list = lead;
            let lead1 = lead.sort(function (a, b) {
                var dateA = new Date(a.store_date); // ignore upper and lowercase
                var dateB = new Date(b.store_date); // ignore upper and lowercase
                return dateB.getTime() - dateA.getTime();
            });
            this.getAllLeadsList(lead1, access_token)
        }, function (err) {
            // self.loaderService.showErrorToast(err);
            console.log(err);
        });
    }

    //list of leads
    async getListOfLeads(userId) {
        debugger
        this.lead_all_list = []
        const retrievedItem = await AsyncStorage.getItem("user_info");
        const itemVal = JSON.parse(retrievedItem);
        const access_token = itemVal.accessToken
        listLeadAll(userId).then((lead) => {
            this.lead_local_list = lead;
            let lead1 = lead.sort(function (a, b) {
                var dateA = new Date(a.store_date); // ignore upper and lowercase
                var dateB = new Date(b.store_date); // ignore upper and lowercase
                return dateB.getTime() - dateA.getTime();
            });
            this.getAllLeadsList(lead1, access_token)
            // self.get_all_leads(lead1, 'multiple');
        }, function (err) {
            //self.loaderService.showErrorToast(err);
            console.log(err);
        });
    }
    //Get All Leads List 

    // Create a graph request asking for user information with a callback to handle the response.

    getAllLeadsList(lead1, access_token) {
        console.log(lead1, 'get leads from database');
        console.log('access token', access_token)


        debugger
        const data = []
        console.log('fetching for access_token ', data, "ç")
        if (lead1 && lead1.length > 0) {
            lead1.map((item, index) => {
                if (item.leadId) {
                    console.log('fetching for index ' + index, item)
                    fetch(`https://graph.facebook.com/v3.0/${item.leadId}?access_token=${access_token}`, ['ads_management',
                        'manage_pages'])
                        .then((data) => data.json())
                        .then((responseJson) => {
                            //    console.log('got response for index ' + index)
                            // console.log(responseJson,"responseJson")
                            // responseJson.field_data;
                            //  let responseJson = res.json()
                            if (responseJson && responseJson.error) {
                                let { params } = this.props.navigation.state
                                console.log(data, "data111111111")
                                this.setState({ getLead: data, isDataExits: data }, () => {
                                    this.setState({
                                        title: params && params.title ? params.title : 'All Leads',
                                        // searchItems: nextProps.formLead,
                                        updatedFormLead: true, //(self.getLead) ? (!self.updatedFormLead) : self.updatedFormLead
                                        loader: false
                                    })
                                })
                                // If response error from Leads 
                                listLeadForm1(item.formId).then((res) => {
                                    debugger
                                    let badge;
                                    let badgeCount = res;
                                    if (badgeCount && badgeCount.badge_count > 0) {
                                        badge = badgeCount.badge_count - 1;
                                        let badge_count = {
                                            badge_count: badge
                                        }
                                        updateFormData2(badgeCount.id, badge_count).then((res) => {
                                        }, function (err) {
                                            console.log(err);
                                        });

                                    }
                                })
                            } else {
                                if (responseJson.field_data) {
                                    // this.lead_all_list
                                    item.field_data = [];
                                    item.field_data = item.field_data.concat(responseJson.field_data);
                                    let local_field = responseJson.field_data;
                                    let temp = [];

                                    console.log(responseJson, "push data", this.lead_all_list)

                                    // if filed data exits 

                                    // 
                                    for (let j = 0; j < local_field.length; j++) {

                                        if (local_field[j].name === 'full_name') {
                                            temp.push(local_field[j]);
                                            local_field.splice(j, 1);
                                        }
                                        if (j === local_field.length - 1) {
                                            for (let k = 0; k < local_field.length; k++) {
                                                if (local_field[k].name === 'email') {
                                                    temp.push(local_field[k]);
                                                    local_field.splice(k, 1);
                                                }
                                                if (k === local_field.length - 1) {
                                                    for (let l = 0; l < local_field.length; l++) {
                                                        if (local_field[l].name === 'phone_number') {
                                                            temp.push(local_field[l]);
                                                            local_field.splice(l, 1);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    for (let j = 0; j < local_field.length; j++) {
                                        temp.push(local_field[j]);
                                    }
                                    if (temp[0]) {
                                        item.data1 = temp[0];
                                    }
                                    if (temp[1]) {
                                        item.data2 = temp[1];
                                    }
                                    if (temp[2]) {
                                        item.data3 = temp[2];
                                    }
                                    this.lead_all_list.push(item);
                                    data.push(item);
                                    console.log(data, "datadatadatadatadatadatadata")
                                    // if (index == lead1.length - 1) {

                                    // console.log(getLeadgetLeadgetLeadgetLead)
                                    this.setState({ loader: false })
                                    let { params } = this.props.navigation.state
                                    this.setState({ getLead: data, isDataExits: data }, () => {
                                        console.log(this.state.getLead, "getLeadgetLeadgetLeadgetLead")
                                        this.setState({
                                            title: params && params.title ? params.title : 'All Leads',
                                            updatedFormLead: true,
                                        })
                                    })
                                    //  }

                                } else {
                                    this.setState({ loader: false })
                                    this.setState({ getLead: data, isDataExits: data }, () => {
                                        this.setState({
                                            title: params && params.title ? params.title : 'All Leads',
                                            // searchItems: nextProps.formLead,
                                            updatedFormLead: true, //(self.getLead) ? (!self.updatedFormLead) : self.updatedFormLead
                                            loader: false
                                        })
                                    })
                                }

                            }
                        }).catch((err) => {
                            let { params } = this.props.navigation.state
                            this.setState({ getLead: data, isDataExits: data }, () => {
                                this.setState({
                                    title: params && params.title ? params.title : 'All Leads',
                                    // searchItems: nextProps.formLead,
                                    updatedFormLead: true, //(self.getLead) ? (!self.updatedFormLead) : self.updatedFormLead
                                })
                            })
                        })
                }

            })

        } else {
            let { params } = this.props.navigation.state
            this.setState({ getLead: data, loader: false, isDataExits: data }, () => {
                this.setState({
                    title: params && params.title ? params.title : 'All Leads',
                    // searchItems: nextProps.formLead,
                    updatedFormLead: true, //(self.getLead) ? (!self.updatedFormLead) : self.updatedFormLead
                })
                //if leads is not found and badge is exits in form in sidebar
                this.state.formId && listLeadForm1(this.state.formId).then((res) => {
                    let badge;
                    let badgeCount = res;
                    if (badgeCount && badgeCount.badge_count > 0) {
                        badge = 0;
                        let badge_count = {
                            badge_count: badge
                        }
                        updateFormData2(badgeCount.id, badge_count).then((res) => {
                        }, function (err) {
                            console.log(err);
                        });
                    }
                }, function (err) {
                    console.log(err);
                });
            })
        }
    }

    /****************START SEARCHBAR SECTION**************************/
    hideSearchbar = () => {
        this.setState({
            noSearch: false, showSearchbar: !this.state.showSearchbar, showCancel: !this.state.showCancel,
            getLead: self.lead_all_list
        })
    }

    _onRefresh() {
        let { params } = this.props.navigation.state
        this.setState({ showSearchbar: !this.state.showSearchbar, showCancel: false }, () => {
            let userId = firebase.auth().currentUser.uid;
            if (params && params.type == 'single') {
                console.log("hereww", params.formData)
                this.getSingleListLead(params.formData.formId)
            }
            if (params && params.type == 'multiple') {
                this.getListOfLeads(userId)
            }
            this.setState({ showSearchbar: true })
        })
    }
    /********************** */
    //search leads
    searchOnNormal(text) {
        let self = this;
        let val = text;
        if (val !== undefined) {
            self.normal_lead_list = self.lead_all_list.filter((item) => {
                if (item.data2 && item.data3) {
                    return item.data1.values[0].toLowerCase().indexOf(val.toLowerCase()) > -1 || item.data2.values[0].toLowerCase().indexOf(val.toLowerCase()) > -1 || item.data3.values[0].toLowerCase().indexOf(val.toLowerCase()) > -1;
                }
                else if (item.data2 && !item.data3) {
                    return item.data1.values[0].toLowerCase().indexOf(val.toLowerCase()) > -1 || item.data2.values[0].toLowerCase().indexOf(val.toLowerCase()) > -1;
                }
                else if (!item.data2 && item.data3) {
                    return item.data1.values[0].toLowerCase().indexOf(val.toLowerCase()) > -1 || item.data3.values[0].toLowerCase().indexOf(val.toLowerCase()) > -1;
                }
                if (!item.data2 && !item.data3) {
                    return item.data1.values[0].toLowerCase().indexOf(val.toLowerCase()) > -1;
                }
            });
            this.setState({ getLead: self.normal_lead_list }, () => {
                if (this.state.getLead.length <= 0) {
                    this.setState({ noSearch: true })
                } else {
                    this.setState({ noSearch: false })
                }
            })
            // self.load_more();
        }
        else {
            self.normal_lead_list = self.lead_all_list;
            this.setState({ getLead: self.normal_lead_list }, () => {
                if (this.state.getLead.length <= 0) {
                    this.setState({ noSearch: true })
                } else {
                    this.setState({ noSearch: false })
                }
            })
            // self.count_list = 30;
        }
    }

    gotoLeadDetails = () => {
        this.props.navigation.navigate('LeadDetails')
    }
    handleChange = (index, item) => {
        let checked = [...this.state.checked];
        checked[index] = !checked[index];

        this.setState({ checked });
        // this.setState({ value: checked[index] })
        if (checked[index]) {

            this.setState({
                checkedarr: [...this.state.checkedarr, item]
            }, () => console.log(this.state.checkedarr))

        } else {

            const index = this.state.checkedarr.indexOf(item);
            this.state.checkedarr.splice(index, 1);

        }

    }
    /****************************** Edit Function  ******************************/
    markAll = (status) => {
        let intialCheck = this.state.getLead.map((x => true));
        let intialCheckItem = this.state.getLead.map((x => x));
        this.setState({
            checked: intialCheck,
            checkedarr: intialCheckItem
        }, () => {
        })

        //   this.setState({ checked: true })
    }
    cancelChecked = () => {
        let intialCheck = this.state.getLead.map(x => false);
        this.setState({
            checked: intialCheck,
            checkedarr: [],
            showEdit: false
        })
    }
    // Add to flag
    flagMultipleLead = () => {
        let leads = [];
        let totalFetched = 0;
        let newArchiveId = []
        if (this.state.checkedarr && this.state.checkedarr.length > 0) {
            // alert('checked array')
            this.setState({ loader: true })
            let { params } = this.props.navigation.state
            this.state.checkedarr.length > 0 ? this.state.checkedarr.forEach((entry, index) => {
                // 
                let formId;
                newArchiveId.push(entry.leadId)

                // if (params && params.formData) {
                //     formId = params && params.formData[index] ? params.formData[index].formId : null;

                // } else {
                //     // 
                //     formId = this.props.leads && this.props.leads[index].formId ? this.props.leads[index].formId : null;

                // }
                // let retrievedItem = await AsyncStorage.getItem("user_info");
                // let itemVal = JSON.parse(retrievedItem);
                // let access_token = itemVal.accessToken
                if (entry && entry.formId) {
                    // alert(formId)
                    // getLeadDatail(entry.leadId, access_token).then(async (res) => {
                    // 
                    // alert(entry.id+'entryid')
                    ++totalFetched;
                    // leads = leads.concat(res)
                    // alert(JSON.stringify(leads))
                    //    if (leads && leads.length > 0) {
                    // 
                    leadId = entry.dataId;
                    //  if (totalFetched == this.state.checkedarr.length) {

                    if (!(entry.leadType) || (entry.leadType) && (entry.leadType !== 'flag')) {
                        // 
                        addFlagLead(entry, entry.leadId).then((flagIdRes) => {
                            // 
                            if (flagIdRes) {
                                let flagdata = {
                                    'leadType': 'flag',
                                    'flag_id': flagIdRes
                                };
                                this.state.flag_badge = this.state.flag_badge + 1
                                let badge_data = {
                                    flag_leads_badge: this.state.flag_badge
                                };

                                flagLeadUpdate(entry.dataId, flagdata).then((res) => {
                                    // 
                                    updateUserData(badge_data, entry.uid).then((userUpdate) => {
                                        // 
                                        this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge })
                                        // flag fiter 
                                        let newFormLeadUpdate = this.state.getLead.map((item, index) => {
                                            if ([entry.leadId].indexOf(item.leadId) == -1) {

                                            } else {
                                                // 
                                                item.leadType = flagdata.leadType
                                                item.flag_id = flagIdRes
                                            }
                                            return item;
                                            // return action.checkedarr.indexOf(item.id) == -1 
                                        })
                                        //
                                        this.setState({
                                            getLead: newFormLeadUpdate
                                        })

                                        this.setState({ loader: false })
                                        this.cancelChecked()

                                        console.log(userUpdate, "userUpdateuserUpdate")
                                    }).catch((err) => {
                                        this.setState({ loader: false })
                                        this.cancelChecked()
                                    })
                                    this.setState({ loader: false })
                                    this.cancelChecked()
                                })
                            }
                        }).catch((err) => {
                            this.setState({ loader: false })
                            this.cancelChecked()
                            console.log(err.message, "fgdgfdg")
                        })
                    } else {
                        // 
                        this.setState({ loader: false })
                        this.cancelChecked()

                    }
                    // }
                    // else {
                    //     this.setState({ loader: false })
                    //     this.cancelChecked()
                    // }
                    // } else {
                    //     this.setState({ loader: false })
                    //     this.cancelChecked()
                    // }

                    // }).catch((err) => {
                    //     ++totalFetched;
                    //     this.setState({ loader: false })
                    //     this.cancelChecked()
                    //     console.log("werr", err)
                    // })
                }
            }) : null

        } else {
            Alert.alert(
                'Required',
                'Please Select Lead first',
                [
                    {
                        text: 'Ok', onPress: () => console.log('cancel'), style: 'Ok'
                    },

                ],
                { cancelable: false }
            )
        }


    }
    //*********************************************Single Add To Flag *********************** */

    // Add to flag
    flagToSingleLead = (entry) => {
        console.log(entry, "jsdjkfksd")

        this.setState({
            loader: true
        })
        if (entry) {

            // getLeadDatail(entry.leadId, access_token).then((response) => {
            //     this.setState({
            //         leadData: response && response.length ? response[0] : {},
            //     }, () => {


            if (entry && entry.leadType != 'flag') {

                addFlagLead(entry, entry.uid).then((res) => {
                    // 
                    if (res) {
                        let flagdata = {
                            'leadType': 'flag',
                            'flag_id': res
                        };
                        flagLeadUpdate(entry.dataId, flagdata).then((resUpFlag) => {
                            // 
                            let badge_data = {
                                flag_leads_badge: this.state.flag_badge + 1
                            };
                            updateUserData(badge_data, entry.uid).then((userUpdate) => {
                                // 
                                this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge + 1 })

                                // flag fiter 
                                let newFormLeadUpdate = this.state.getLead.map((item, index) => {
                                    if ([entry.leadId].indexOf(item.leadId) == -1) {
                                        // 
                                        console.log(item.leadId, "if reducxer")
                                    } else {
                                        // 
                                        item.leadType = flagdata.leadType
                                        item.flag_id = res
                                    }
                                    return item;
                                    // return action.checkedarr.indexOf(item.id) == -1 
                                })
                                //
                                this.setState({
                                    getLead: newFormLeadUpdate
                                })
                                this.setState({ loader: false, })

                            }).catch((err) => {
                                this.setState({ loader: false, })

                                // 
                                console.log("Update badge error")
                            })
                            this.setState({ loader: false, })
                            // alert('Leads Flag Updated successfully')
                        })
                    }
                }).catch((err) => {
                    // 
                    this.setState({ loader: false, })
                    console.log(err.message, "fgdgfdg")
                    // alert('error Update successfully')
                })
            } else {
                let flagdata = {
                    'leadType': 'unflag',
                };
                flagLeadUpdate(entry.dataId, flagdata).then((res) => {
                    if (res) {
                        getFlagLead(entry.leadId).then((flagRes) => {
                            if (flagRes) {
                                removeFlagLead(flagRes[0].dataId).then((remFlag) => {
                                    let badge_data = {
                                        flag_leads_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0
                                    };
                                    updateUserData(badge_data, entry.uid).then((userUpdate) => {
                                        this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0 })
                                        let newFormLeadUpdate = this.state.getLead.map((item, index) => {
                                            if ([entry.leadId].indexOf(item.leadId) == -1) {
                                                // 
                                                console.log(item.leadId, "if reducxer")
                                            } else {

                                                // 
                                                item.leadType = flagdata.leadType
                                                item.flag_id = entry.flag_id
                                            }
                                            return item;
                                            // return action.checkedarr.indexOf(item.id) == -1 
                                        })
                                        //
                                        this.setState({
                                            getLead: newFormLeadUpdate
                                        })
                                        this.setState({ loader: false, })
                                    }).catch((err) => {

                                        this.setState({ loader: false, })

                                        console.log("Update badge error")
                                    })
                                    // alert("Remove Flag")
                                    this.setState({ loader: false, })

                                }).catch((err) => {
                                    this.setState({ loader: false, })
                                    // alert("Error in Removed")
                                })
                            }
                        }).catch((err) => {
                            this.setState({ loader: false, })
                        })
                    } else {
                        // alert("No response")
                        this.setState({ loader: false, })

                    }
                    // alert('Leads Flag Updated successfully')
                })
            }
            // }).catch((err) => {
            //     this.setState({ loader: false, })

            // })

        }




    }




    /**************************** Archive Details  ******************************/
    archiveList = () => {
        let leads = [];
        let newArchiveId = []
        let totalFetched = 0;
        if (this.state.checkedarr && this.state.checkedarr.length > 0) {
            // alert("archiveList")
            this.setState({ loader: true })
            let { params } = this.props.navigation.state
            this.state.checkedarr.length > 0 ? this.state.checkedarr.forEach((entry, index) => {
                // alert("archiveList")
                let formId;
                newArchiveId.push(entry.leadId)
                // if (params && params.formData) {
                //     formId = params && params.formData[index] ? params.formData[index].formId : null;
                // } else {
                //     formId = this.props.leads && this.props.leads[index].formId ? this.props.leads[index].formId : null;
                // }
                // let retrievedItem = await AsyncStorage.getItem("user_info");
                // let itemVal = JSON.parse(retrievedItem);
                // let access_token = itemVal.accessToken
                if (entry && entry.formId) {
                    // console.log(entry, "entryentryentry")
                    // getLeadDatail(entry.leadId, access_token).then((res) => {
                    ++totalFetched;
                    //    leads = leads.concat(res)
                    // if (leads && leads.length > 0) {
                    leadId = entry.dataId;
                    // if (totalFetched == this.state.checkedarr.length) {
                    let newArchiveArray = []
                    addArchieveLead(entry, entry.leadId).then((new_archieve_data) => {
                        newArchiveArray.push(new_archieve_data)
                        archieveLead(entry, 'yes').then((res) => {
                            this.state.archieve_badge = this.state.archieve_badge + 1
                            let badge_data = {
                                archieve_leads_badge: this.state.archieve_badge
                            };
                            updateUserData(badge_data, entry.uid).then((userUpdate) => {
                                this.props.dispatch({ type: 'UPDATE_ARCHIVE_BADGE', archieve_badge: this.state.archieve_badge })
                                if (entry && entry.flag_id) {
                                    this.state.flag_badge = this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0
                                    let flag_badge_data = {
                                        flag_leads_badge: this.state.flag_badge
                                    };
                                    updateUserData(flag_badge_data, entry.uid).then((userUpdate) => {
                                        this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge })
                                    })
                                    // alert(leads[index].flag_id+'flag_id')
                                    removeFlagLeadId(entry.flag_id).then((removeFlag) => {
                                        // this.props.dispatch({
                                        //     type:
                                        //         FORMLEAD_ACTION_TYPES.FORMLEAD_REMOVESUCCESS,
                                        //     checkedarr: newArchiveId
                                        // })
                                        let newFormLead = this.state.getLead.filter((item, index) => {
                                            return [entry.leadId].indexOf(item.leadId) == -1;
                                        })
                                        this.setState({ loader: false, getLead: newFormLead })
                                        this.cancelChecked()
                                    }).catch((err) => {
                                        this.setState({ loader: false })
                                        this.cancelChecked()
                                        // alert("Error to  Archive  Flag")
                                    })
                                } else {
                                    let newFormLead = this.state.getLead.filter((item, index) => {
                                        return [entry.leadId].indexOf(item.leadId) == -1;
                                    })
                                    this.setState({ loader: false, getLead: newFormLead })
                                    this.setState({ loader: false })
                                    this.cancelChecked()
                                }
                            }).catch((err) => {
                                this.setState({ loader: false })
                                this.cancelChecked()
                            })

                        }).catch((err) => {
                            this.setState({ loader: false })
                            this.cancelChecked()
                        })

                    }).catch((err) => {
                        this.setState({ loader: false })
                        this.cancelChecked()
                    })
                }


            }) : null

        } else {
            Alert.alert(
                'Required',
                'Please Select Lead first',
                [
                    {
                        text: 'Ok', onPress: () => console.log('cancel'), style: 'Ok'
                    },

                ],
                { cancelable: false }
            )
        }

    }



    /*********************************** Single Arhcive  */

    archiveToSingleLead(entry) {

        this.setState({
            loader: true
        })
        if (entry && entry.dataId) {
            let newArchiveId = []
            // getLeadDatail(entry.leadId, access_token).then((response) => {
            //     //  
            //     this.setState({
            //         leadData: response && response.length ? response[0] : {},
            //         // isFlag: response && response.length && response[0].leadType && response[0].leadType == 'flag' ? true : false
            //     }, () => {
            let leadId = entry.dataId
            newArchiveId.push(entry.leadId);
            let newArchiveArray = []
            addArchieveLead(entry, entry.leadId).then((new_archieve_data) => {
                newArchiveArray.push(new_archieve_data)
                archieveLead(entry, 'yes').then((res) => {
                    let badge_data = {
                        archieve_leads_badge: this.state.archieve_badge + 1
                    };
                    updateUserData(badge_data, entry.uid).then((userUpdate) => {

                        // 
                        this.props.dispatch({ type: 'UPDATE_ARCHIVE_BADGE', archieve_badge: this.state.archieve_badge + 1 })
                        if (entry && entry.flag_id) {

                            let flag_badge_data = {
                                flag_leads_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0
                            };
                            updateUserData(flag_badge_data, entry.uid).then((userUpdate) => {
                                this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0 })
                            }).catch((err) => {
                                console.log(err.message, "8888888888888888888")
                            })
                            removeFlagLeadId(entry.flag_id).then((removeFlag) => {

                                let newFormLead = this.state.getLead.filter((item, index) => {
                                    return [entry.leadId].indexOf(item.leadId) == -1;
                                })
                                this.setState({ loader: false, getLead: newFormLead })
                                this.cancelChecked()
                            }).catch((err) => {
                                // 
                                this.setState({ loader: false })
                                this.cancelChecked()

                            })
                        } else {

                            let newFormLead = this.state.getLead.filter((item, index) => {
                                return [entry.leadId].indexOf(item.leadId) == -1;
                            })
                            this.setState({ loader: false, getLead: newFormLead })

                            this.setState({ loader: false })
                            this.cancelChecked()
                        }
                    }).catch((err) => {
                        // 

                        this.setState({ loader: false })
                        this.cancelChecked()
                    })

                }).catch((err) => {


                    this.setState({ loader: false })
                    this.cancelChecked()
                })
            })
        } else {
            this.setState({ loader: false })
            this.cancelChecked()
        }

    }

    confirmArchieveLead = (item) => {

        Alert.alert(
            'Archive Lead',
            'Do you want to archive selected leads ? ',
            [
                {
                    text: 'CANCEL', onPress: () => {
                        _.each(this.state.checked, function (lead, index) {
                            lead[index] = false;
                        });
                    }, style: 'cancel'
                },
                { text: 'ARCHIVE', onPress: () => this.archiveToSingleLead(item) },
            ],
            { cancelable: false }
        )

    }
    /******************** End /**************** */
    confirmArchieveMultipleLead = () => {

        Alert.alert(
            'Archive Lead',
            'Do you want to archive selected leads ? ',
            [
                {
                    text: 'CANCEL', onPress: () => {
                        _.each(this.state.checked, function (lead, index) {
                            lead[index] = false;
                        });
                    }, style: 'cancel'
                },
                { text: 'ARCHIVE', onPress: () => this.archiveList() },
            ],
            { cancelable: false }
        )

    }


    ///

    _keyExtractor = (item, index) => index + 'getdata';
    _renderData = ({ item, index }) => {

        /***************** */
        const swipeSettings = {

            autoClose: true,
            onClose: (sectionID, rowId, direction) => {


            },
            onOpen: (sectionID, rowId, direction) => {

            },
            right: [
                {

                    onPress: () => { this.flagToSingleLead(item) },
                    component: (
                        <View
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                            }}
                        >
                            <FontAwesomeIcon name="flag" color="white" size={28} />
                            {/* <Image source={flag} style={{ height: 25, width: 25 }} /> */}
                            <Text style={{ color: '#fff' }}>
                                {item.leadType && item.leadType == 'flag' ? 'UNFLAG' : 'FLAG'}
                            </Text>
                        </View>
                    ),
                    backgroundColor: 'orange'



                },
                {


                    onPress: () => {
                        this.confirmArchieveLead(item)
                    },
                    component: (
                        <View
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                            }}
                        >
                            <FontAwesomeIcon name="archive" color="white" size={28} />

                            {/* <Image source={archive} style={{ height: 25, width: 25 }} /> */}
                            <Text style={{ color: '#fff' }}>
                                ARCHIVE
                  </Text>
                        </View>
                    )
                    , backgroundColor: '#4286f4'
                }

            ],
            rowId: this.props.index,
            sectionID: 1,

        }
        /****************** */


        let { params } = this.props.navigation.state
        let lead = {};
        // item.field_data.map((data, i) => {
        //     lead[data.name] = data.values[0]
        //     return lead
        // })
        let { checked } = this.state;
        return (
            <Swipeout {...swipeSettings} style={{ backgroundColor: 'white' }}
                disabled={this.state.showEdit}>

                <TouchableOpacity hitSlop={hitSlop} activeOpacity={.8} style={{ flex: 1 }}
                    onPress={() =>
                        this.navigateDetails(item, index)
                    }
                >
                    <View style={{
                        flexDirection: 'row',
                        borderColor: '#dcdcdc',
                        //  paddingVertical:10,
                        //  paddingTop:2,
                        paddingBottom: 10,
                        marginTop: 5,
                        borderBottomWidth: 1,
                        flex: 1
                    }}>
                        {
                            this.state.showEdit ?
                                <View style={{ flex: 0.25, alignItems: 'center', justifyContent: 'center', }}>
                                    {
                                        item.leadType && item.leadType == 'flag' &&
                                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={orange_color_circle} style={{ width: 15, height: 15, alignSelf: 'center' }} />
                                        </View>
                                    }
                                    <CheckBox
                                        title={''}
                                        left
                                        containerStyle={{ backgroundColor: 'white', borderWidth: 0, width: 25, height: 25, padding: 0 }}
                                        onPress={() => this.handleChange(index, item)}
                                        checkedColor='#5890FF'
                                        checked={checked[index]} />

                                </View>
                                : item.leadType && item.leadType == 'flag' ? <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={orange_color_circle} style={{ width: 15, height: 15, alignSelf: 'center' }} />
                                </View> :
                                    <View style={{ alignItems: 'center', justifyContent: 'center' }} />




                        }


                        <View style={{
                            flex: this.state.showEdit ? 1 : 0.7,
                            paddingLeft: this.state.showEdit ? 0 : 10,
                            // borderBottomColor: '#dcdcdc',
                            justifyContent: 'flex-start',
                            // alignItems:'center'

                        }}>
                            <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 16, alignSelf: 'flex-start' }}
                                numberOfLines={1}>{item.data1 && item.data1.values[0] ? item.data1.values[0] : null} </Text>
                            <Text>{item.data2 && item.data2.values[0] ? item.data2.values[0] : null}</Text>
                            <Text numberOfLines={1}>{item.data3 && item.data3.values[0] ? item.data3.values[0] : null}</Text>
                        </View>

                        {
                            !this.state.showEdit && <View style={{
                                flex: 0.2, flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingRight: 0
                            }}>
                                <View style={{ marginLeft: 5, marginTop: 5 }}>
                                    <Text style={{ alignSelf: 'center' }}>{item.createdAt}

                                        {/* <Text style={{ alignSelf: 'center' }}>{item.createdAt ? moment(item.createdAt).format("hh:mm A") : null} */}
                                        {/* formatAMPM(item.created_time) : null} */}
                                    </Text>
                                </View>

                                <View style={{ marginLeft: 0, }}>
                                    <Icon name='chevron-right' size={38} color='#d3d3d3' style={{ alignSelf: 'center' }} />
                                </View>
                            </View>
                        }

                    </View>

                </TouchableOpacity>
            </Swipeout>

        )
    }

    centerComponent = () => {
        return (
            <View style={{ flex: 0.5, justifyContent: 'center' }}>
                <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 18, fontFamily: 'Roboto-Bold' }} numberOfLines={1}>
                    {this.state.title ? this.state.title.substr(0, 20) : null} {this.state.title && this.state.title.length > 20 ? '...' : ''}
                </Text>
            </View>
        )
    }
    // header function
    showEditCancel = () => {
        let intialCheck = this.state.getLead.map(x => false);
        this.setState({
            showEdit: !this.state.showEdit,
            checked: intialCheck,
            checkedarr: [],
        })
    }
    renderSpinner() {
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
                {/* // <View style={{ position: 'absolute', top: height / 2, left: width / 2, zIndex: 100 }}>
            //     <ActivityIndicator size={'large'} color='#5890FF' />
            // </View> */}
            </View>


        )
    }

    // Navigate to view Leads

    navigateDetails(lead, index) {

        let self = this;
        //  this.load_lead_content = true;
        this.setState({ fromViewLead: false })
        let userId = firebase.auth().currentUser.uid
        let { params } = this.props.navigation.state;
        if (!this.state.showEdit) {
            if (!lead.lead_seen) {
                listLeadForm1(lead.formId).then((res) => {
                    let badge;
                    self.localvalue = res;
                    if (self.localvalue.badge_count && self.localvalue.badge_count > 0) {
                        badge = self.localvalue.badge_count - 1;
                        var badge_count = {
                            badge_count: badge
                        }

                        updateFormData2(self.localvalue.id, badge_count).then((res) => {

                        }, function (err) {
                            console.log(err);
                        });
                    }
                }, function (err) {
                    console.log(err);
                });
            }
            self.lead_all_list[index] && self.lead_all_list[index].lead_seen ? self.lead_all_list[index].lead_seen = true : true
            let data = {
                lead_seen: true
            };
            // console.log('before 1 navigate list', JSON.parse(window.localStorage.getItem('home_listLeadAll')));
            updateLead(lead.dataId, data).then((res) => {
                // self.UpdateLocalStorage('seen', lead, index, "");
                if (res) {
                    this.props.navigation.navigate('Viewlead', {
                        receivedata: lead,
                        formData: params && params.formData ? params.formData : [],
                        allLeads: true,
                        flag: false,
                        archive: false,
                        leadId: lead.leadId,
                        updateData: this.updateData.bind(this)
                    })
                    // this.props.listLeadForm(userId).then((res) => {
                    //     console.log(res)
                    // }).catch(err => {
                    //     console.log("err", err)
                    // })
                }
            }, function (err) {
                // self.loaderService.showErrorToast(err);
                console.log(err);
            });


        }



    }
    leftComponent() {
        return (
            <TouchableOpacity hitSlop={hitSlop} onPress={() => this.props.navigation.navigate('DrawerOpen', { delete: false })}
            >
                <View style={{ justifyContent: 'flex-end' }}>
                    <Icon name={'menu'} size={28} color='#5890FF' />
                </View>
            </TouchableOpacity>
        )
    }
    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <Header
                        backgroundColor={'#F8F8F8'}
                        leftComponent={this.leftComponent()}
                        centerComponent={this.centerComponent()}
                        rightComponent={<MyCustomRightComponent showEdit={this.state.showEdit}
                            showButton={(this.state.getLead.length > 0)}
                            showEditCancel={() => this.showEditCancel()} />}

                    />
                    {this.state.loader && this.renderSpinner()}

                    {

                        this.state.showSearchbar && this.state.isDataExits && this.state.isDataExits.length > 0 ? <View style={{

                            flexDirection: 'row', paddingBottom: 10,
                        }}>

                            <TouchableOpacity hitSlop={hitSlop} style={{ width: width / 6, borderBottomColor: '#f8f8f8', backgroundColor: '#fff', alignItems: 'center', paddingTop: 15, borderBottomWidth: 3 }}>

                                <Icon
                                    name='search'

                                    color='grey'

                                    iconStyle={{
                                        alignItems: 'center'
                                    }}
                                />

                            </TouchableOpacity>

                            <TextInput
                                style={{ height: 50, width: '80%', borderBottomColor: '#f8f8f8', backgroundColor: 'white', borderBottomWidth: 3 }}
                                onChangeText={(text) => this.searchOnNormal(text)}
                                placeholder='Search'
                                underlineColorAndroid='transparent'
                                returnKeyType={"search"}
                                onSubmitEditing={(event) => {
                                    // this.refs.email.focus(); 
                                }}
                                onFocus={() => this.setState({ showCancel: true })}
                            />
                        </View>


                            : null
                    }

                    {
                        this.state.showCancel ?
                            <TouchableOpacity hitSlop={hitSlop} onPress={this.hideSearchbar} style={{ height: 50, borderBottomWidth: 3, borderBottomColor: '#f8f8f8', width: width / 5, backgroundColor: '#fff', alignItems: 'center', paddingTop: 15, position: 'absolute', right: 5, bottom: 70, top: 70, }}>
                                <Text style={{ color: '#5890ff', fontWeight: 'bold', fontFamily: 'Roboto-Bold' }}>
                                    CANCEL
                        </Text>
                            </TouchableOpacity>
                            :
                            null
                    }


                    {/* {
                        this.state.log.length ? 
                        this.state.log.map((log, index) => {
                            return (
                                <Text key={index}>{log} </Text>
                            )
                        }) : null
                    } */}

                    <View style={{ flex: 1, padding: 10, backgroundColor: this.state.getLead && this.state.getLead.length > 0 ? 'transparent' : '#D3D6DB' }}>
                        {
                            (this.state.noSearch) ?
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#777', fontFamily: 'Roboto-Regular' }}>There are no leads that match your search.</Text>
                                </View> :
                                <FlatList
                                    extraData={this.state.updatedFormLead}
                                    data={this.state.getLead}
                                    keyExtractor={this._keyExtractor.bind(this)}
                                    renderItem={this._renderData.bind(this)}
                                    scrollEnabled={true}
                                    ListEmptyComponent={() => {
                                        return (
                                            <View style={{ alignItems: 'center', marginTop: height / 4 + 20, }}>
                                                <Image source={defaultimage} resizeMode="contain"
                                                />
                                                <Text style={{
                                                    marginTop: 30, fontSize: 20, color: '#BDC1CA', fontWeight: '400',
                                                    fontFamily: 'Roboto-Bold'
                                                }}>
                                                    You don't have any leads yet.
                                    </Text>

                                            </View>
                                        )
                                    }}
                                    refreshing={true}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshing}
                                            onRefresh={this._onRefresh.bind(this)}
                                            enabled={true}
                                        />
                                    }
                                />


                        }

                    </View>

                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        {/* {
                            (!this.state.subscribe_type) ?

                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                    <View><Text>Please subscribe to see more leads.</Text></View>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("Subscription")}> <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}>Subscribe</Text></TouchableOpacity>
                                </View> : null
                        } */}
                        {this.state.showEdit && this.state.getLead.length > 0 ?

                            <View style={{
                                flex: 1, paddingHorizontal: 10, backgroundColor: '#f8f8f8', height: 50,
                                flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10
                            }}>
                                <TouchableOpacity hitSlop={hitSlop} onPress={() => this.markAll('markAll')}>
                                    <View>
                                        <Text style={{ color: '#5890ff', fontSize: 16, fontFamily: 'Roboto-Regular' }}>Mark All</Text>
                                    </View>

                                </TouchableOpacity>
                                <TouchableOpacity hitSlop={hitSlop} onPress={() => this.flagMultipleLead()}>
                                    <View>

                                        <Text style={{ color: 'black', fontSize: 16, fontFamily: 'Roboto-Regular' }}>Flag</Text>
                                    </View>

                                </TouchableOpacity>
                                <TouchableOpacity hitSlop={hitSlop} onPress={() => this.confirmArchieveMultipleLead()}>
                                    <View>
                                        <Text style={{ color: 'black', fontSize: 16, fontFamily: 'Roboto-Regular' }} >Archive</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            : this.state.getLead.length > 0 && <TouchableOpacity hitSlop={hitSlop} activeOpacity={.8} style={{ backgroundColor: '#f8f8f8', height: 50 }} >
                                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ alignSelf: 'center', fontFamily: 'Roboto-Regular' }}>Updated Just Now</Text>
                                    <Text style={{ alignSelf: 'center', fontFamily: 'Roboto-Regular' }}>{this.state.getLead && this.state.getLead.length} Lead(s)</Text>
                                </View>

                            </TouchableOpacity>

                        }

                    </View>

                </View>
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
function mapDispathToProps(dispatch) {
    return bindActionCreators({ listLeadForm, dispatch }, dispatch);
}
export default connect(mapStateToProps, mapDispathToProps)(AllLeads)

