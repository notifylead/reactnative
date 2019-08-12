import React, { Component } from 'react'
import firebase from 'firebase'

import {
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    Alert,
    AsyncStorage, ScrollView, SafeAreaView,
    ActivityIndicator, Dimensions, Linking, FlatList, RefreshControl, TextInput

} from 'react-native'
import { FORMLEAD_ACTION_TYPES } from '../../Actions/ActionTypes'

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
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
    getLeadData, getleadgenforms, listLeadAll, getLeadDatail, updateUserData, listLeadForm, getFlagLead,
    addFlagLead, flagLeadUpdate, getBadgeCounts, removeFlagLead,getSingleLead
} from '../../Actions/LeadsAction';
import { addArchieveLead, archieveLead, removeFlagLeadId, archiveLeadUpdate } from '../../Actions/ArchiveAction';
const { width, height } = Dimensions.get('window')

const flag = require("../../Assets/img/flag.png");
const archive = require("../../Assets/img/ar.png");
const orange_color_circle = require("../../Assets/img/orange_color_circleold.png")
let self
class MyCustomRightComponent extends Component {
    render() {
        return (
            <View>
                {
                    this.props.showButton && <TouchableOpacity onPress={() => this.props.showEditCancel()}>
                        <Text style={{ color: '#5890ff', fontWeight: 'bold' }} >
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
            flag_badge: 0,
            checkedarr: [],
            markAll: null,
            leadData: {},
            updatedFormLead: false,
            dataSource: [
                { name: 'John Apple', email: 'johnapple@gmail.com', phone: '123456789', time: '5:25 pm' },
                { name: 'Apple John', email: 'applejohn@gmail.com', phone: '987465123', time: '6:25 am' },
            ],

            showSearchbar: false,
            showCancel: false,
            search: '',
            searchTerm: '',
            subscribe_type: null,
            searchValue: '',
            text: '',
            noSearch: false
        }

        this.subscribe_type = null;
        self = this
        this.lead_local_list =[]
    }
    componentWillMount() {
        let { params } = this.props.navigation.state
         if (params && params.type == 'single') {
             alert(params.type)
            this.setState({title: params.title }, () => {
                // let intialCheck = this.state.getLead.map(x => false);
                // this.setState({
                //     checked: intialCheck,
                //     loader: false
                // })
            })
            getSingleLead(formId).then( (lead) => {
               
                //   self.lead_list=lead;
                self.lead_local_list = lead;
                var lead1 = lead.sort(function (a, b) {
                    var dateA = new Date(a.store_date); // ignore upper and lowercase
                    var dateB = new Date(b.store_date); // ignore upper and lowercase
                    return dateB.getTime() - dateA.getTime();
                });
             //   self.get_all_leads(lead1, 'single');
            }, function (err) {
               // self.loaderService.showErrorToast(err);
                console.log(err);
            });

         }else{
            let userId = firebase.auth().currentUser.uid;
            this.setState({ loader: true, title: 'All Leads', })
            this.props.listLeadForm(userId).then((res) => {
                if (res) {
                    this.getLeadAll(res)
                }
            }).catch((err) => {

                this.setState({ loader: false })

                console.log("Errr", err)
            })
         }



        // alert("componr")
        // console.log("different params", params)
        // if (params && params.fromParams && !params.selectFromFB) {
        //     params && params.data ? this.setState({ getLead: params.data, searchItems: params.data, title: params.title }, () => {
        //         let intialCheck = this.state.getLead.map(x => false);
        //         this.setState({
        //             checked: intialCheck,
        //             loader: false
        //         })
        //     }) : this.setState({
        //         loader: false
        //     })
        // } else {
        //     let userId = firebase.auth().currentUser.uid;
        //     this.setState({ loader: true, title: 'All Leads', })
        //     this.props.listLeadForm(userId).then((res) => {
        //         if (res) {

        //             this.getLeadAll(res)
        //         }
        //     }).catch((err) => {

        //         this.setState({ loader: false })

        //         console.log("Errr", err)
        //     })
        //     // this.checkIsSubscibedData()


        // }

        // //Get All Form Lead
        getBadgeCounts().then((data) => {
            this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: data.flag_leads_badge ? data.flag_leads_badge : 0 })
            this.props.dispatch({ type: 'UPDATE_ARCHIVE_BADGE', archieve_badge: data.archieve_leads_badge ? data.archieve_leads_badge : 0 })
        }).catch((err) => {
            console.log(err)
        })

    }

    // getDetails = () => {
    //     let userId = firebase.auth().currentUser.uid;
    //     getUserDetails(userId).then((data) => {
    //         console.log(data, "datadatadatadatadatadata")
    //         if (data && data.subscribe_type) {
    //             this.setState({ subscribe_type: true })
    //             return true
    //         }
    //         // let value = (data.do_not_disturb) > 20 ?
    //         //     (data.do_not_disturb) / 60
    //         //     : (data.do_not_disturb == -1) ? 'ON' : 'OFF'

    //     })
    // }

    //Get Lead All

        //Called normally
        get_all_leads(item, list_type) {
            this.lead_all_list = [];
            this.check_lead_list = [];
            this.normal_lead_list = [];
            console.log(item,"   this.normal_lead_list ",   this.normal_lead_list )
            this.store_leads(item, 0, false, list_type);
        }
    
        //Facebook native api calls for getting full_name,phone no,email
       async store_leads(item1, i, refresh, list_type) {
            let retrievedItem = await AsyncStorage.getItem("user_info");
            let itemVal = JSON.parse(retrievedItem);
            console.log(itemVal,"itemVal")
            let access_token = itemVal.accessToken
            let userId = firebase.auth().currentUser.uid;
            console.log('store leads',item1,"hhkhkjhkjh");
            let self = this;
            var item = item1;
            if (item !== undefined ) {
                if (i < item.length) {
                    //getLeadData(entry.formId, access_token).then(function (res) {
                        fetch(`https://graph.facebook.com/v3.0/${this.lead_local_list[i].leadId}?access_token=${access_token}`,
                     ['ads_management', 'manage_pages']).then(async (res) => {
                        let responseJson = await res.json()
                         console.log(responseJson,"responseJson")
                 //  FacebookNative.api("/" + self.lead_local_list[i].leadId, ['ads_management', 'manage_pages']).then(function (res) {
                     if (responseJson) {
                         if (responseJson.field_data) {
                                var local_field = responseJson.field_data;
                                var temp = [];
                                for (var j = 0; j < local_field.length; j++) {
                                    if (local_field[j].name === 'full_name') {
                                        temp.push(local_field[j]);
                                        local_field.splice(j, 1);
                                    }
                                    if (j === local_field.length - 1) {
                                        for (var k = 0; k < local_field.length; k++) {
                                            if (local_field[k].name === 'email') {
                                                temp.push(local_field[k]);
                                                local_field.splice(k, 1);
                                            }
                                            if (k === local_field.length - 1) {
                                                for (var l = 0; l < local_field.length; l++) {
                                                    if (local_field[l].name === 'phone_number') {
                                                        temp.push(local_field[l]);
                                                        local_field.splice(l, 1);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                for (var j = 0; j < local_field.length; j++) {
                                    temp.push(local_field[j]);
                                }
                                console.log(temp,"djshfjkdshfjkdsjkhhkjh")
                                if (temp[0]) {
                                    item[i].data1 = temp[0];
                                }
                                if (temp[1]) {
                                    item[i].data2 = temp[1];
                                }
                                if (temp[2]) {
                                    item[i].data3 = temp[2];
                                }
                                if (refresh) {
                                    self.lead_all_list1.push(item[i]);
                                }
                                else {
                                    self.setState({loader:false})
                                    self.lead_all_list.push(item[i]);
                                }
                                if (i === self.count_list) {
                                    //  self.showing_page = true;
                                }
                                i++;
                                self.store_leads(item, i, refresh, list_type);
                            }
                        }
    
                        else {
                            if (i === self.count_list) {
                                //  self.showing_page = true;
                            }
                            i++;
                            self.store_leads(item, i, refresh, list_type);
                        }
    
    
                    }, function (err) {
                        i++;
                        self.store_leads(item, i, refresh, list_type);
                        //console.log(err);
                    }).catch(e => {
                        i++;
                        console.log(e.message,"erroor messages");
                        self.store_leads(item, i, refresh, list_type);
                        //console.log(e);
                    });
                }
                else {
                    console.log("Going to Else",  this.lead_all_list)
                    // if (refresh) {
                    //     self.check_lead_list = [];
                    //     self.normal_lead_list = [];
                    //     self.lead_all_list = [];
                    //     self.check_lead_list = self.lead_all_list1;
                    //     self.normal_lead_list = self.lead_all_list1;
                    //     self.lead_all_list = self.lead_all_list1;
                    //     if (list_type == 'single') {
                    //         var form_id = this._params.get('formId');
                    //         window.localStorage.setItem(form_id, JSON.stringify(self.lead_all_list1));
                    //         var badge = 0;
                    //         for (var l = 0; l < self.lead_all_list1.length; l++) {
                    //             if (!self.lead_all_list1[l].lead_seen) {
                    //                 badge++;
                    //             }
                    //         }
                    //         var badge_count = {
                    //             badge_count: badge
                    //         }
                    //         var fid = this._params.get('id');
    
                    //         self.leadsService.updateFormData(fid, badge_count).then(function (res) {
    
                    //         }, function (err) {
                    //             self.loaderService.showErrorToast(err);
                    //             console.log(err);
                    //         });
                    //     } else if (list_type == 'multiple') {
                    //         window.localStorage.setItem("home_listLeadAll", JSON.stringify(self.lead_all_list1));
                    //     }
                    // }
                    // else {
                    //     self.check_lead_list = [];
                    //     self.normal_lead_list = [];
                    //     self.check_lead_list = self.lead_all_list;
                    //     self.normal_lead_list = self.lead_all_list;
                    //     if (list_type == 'single') {
                    //         var form_id = this._params.get('formId');
                    //         window.localStorage.setItem(form_id, JSON.stringify(self.lead_all_list));
                    //         var badge = 0;
                    //         for (var l = 0; l < self.lead_all_list.length; l++) {
                    //             if (!self.lead_all_list[l].lead_seen) {
                    //                 badge++;
                    //             }
                    //         }
                    //         var badge_count = {
                    //             badge_count: badge
                    //         }
                    //         var fid = this._params.get('id');
    
                    //         self.leadsService.updateFormData(fid, badge_count).then(function (res) {
    
                    //         }, function (err) {
                    //             self.loaderService.showErrorToast(err);
                    //             console.log(err);
                    //         });
                    //     } else if (list_type == 'multiple') {
                    //         window.localStorage.setItem("home_listLeadAll", JSON.stringify(self.lead_all_list));
                    //     }
                    // }
                    // console.log("enterr loading");
                    // this.showing_page = true;
                    // this.show_refresh_loading = false;
                    // this.spinner_flag = false;
                    // if (self.referesher_var) {
                    //     self.referesher_var.complete();
                    // }
                }
            }
        }
    async getLeadAll(FbPageList) {
        console.log()
        let leads = [];
        let leadListArr = [];
        let totalFetched = 0;
        let newFetch = 0
        const retrievedItem = await AsyncStorage.getItem("user_info");
        const itemVal = JSON.parse(retrievedItem);
        const access_token = itemVal.accessToken
        let userId = firebase.auth().currentUser.uid;
        let elements = [];
        let dataResponse;
        listLeadAll(userId).then((lead) => {
            this.lead_local_list = lead;
            var lead1 = lead.sort(function (a, b) {
                var dateA = new Date(a.store_date); // ignore upper and lowercase
                var dateB = new Date(b.store_date); // ignore upper and lowercase
                return dateB.getTime() - dateA.getTime();
            });
            self.get_all_leads(lead1, 'multiple');
        }, function (err) {
            //self.loaderService.showErrorToast(err);
            console.log(err);
        });
        // listLeadAll(userId).then(async (allElements) => {
            // if (allElements.length > 0) {
            //     if(FbPageList.length > 0){
            //   dataResponse = FbPageList.forEach((entry, index) => {
            //                     let found = false;
            //                         ++totalFetched;
            //                          elements = allElements.filter(x => x.formId == entry.formId)
            //                         if (totalFetched == FbPageList.length )    {
            //                             found = true;
            //                             //let elementIndex = elements.map((x, elementIndex) => elementIndex)
            //                         }

            //                         return elements;
            //                         // else {
                
            //                         //     this.setState({ getLead: [], title: 'All Leads', loader: false }, () => { })
            //                         // }
            //                     })
            //     }
            //     console.log(dataResponse,"dataResponsedataResponse",elements,FbPageList)

                // if(elements && elements.length > 0){
                //     elements.forEach((value, inx) => {
                //         console.log(value,"valuevaluevalue")
                //         //                 getLeadData(entry.formId, access_token).then((leadData) => {
                //         //                     console.log(elements[0],"elements[index]elements[index]")
                //         //                     leadData.data[0]['leadType'] = elements[index].leadType ? elements[index].leadType : null
                //         //                    leads = leads.concat(leadData.data)
                //         //                     if (totalFetched == FbPageList.length) {
                //         //                         this.props.dispatch({ type: FORMLEAD_ACTION_TYPES.FORMLEAD_REQUEST_SUCCESS, responseData: leads })
                //         //                         this.setState({ getLead: leads, searchItems: leads, title: 'All Leads', loader: false }, () => {
                //         //                             console.log(this.state.getLead,"gleadsleadsleadsleads",leads)
                //         //                             let intialCheck = this.state.getLead.map(x => false);
                //         //                             this.setState({
                //         //                                 checked: intialCheck,
                //         //                             })
                //         //                         })
                
                //         //                     }else{
                //         //                         console.log("else part 2222222.smmmamammaa")
                
                //         //                     }
                //         //                 }).catch((err) => {
                //         //   console.log(err.message,"error .smmmamammaa")
                //         //                     ++totalFetched;
                //         //                 })
                //                   }) 
                // }
        //         FbPageList.length > 0 ? FbPageList.forEach((entry, index) => {
        //             ++totalFetched;
        //              elements = allElements.filter(x => x.formId == entry.formId)
        //             // if (elements.length > 0)    {
        //             //     //let elementIndex = elements.map((x, elementIndex) => elementIndex)
        //             // }
        //             // else {

        //             //     this.setState({ getLead: [], title: 'All Leads', loader: false }, () => { })
        //             // }
        //         })
        //         if(elements && elements.length > 0 ){
        //                 elements.forEach((value, inx) => {
        //                 getLeadData(entry.formId, access_token).then((leadData) => {
        //                     console.log(elements[0],"elements[index]elements[index]")
        //                     leadData.data[0]['leadType'] = elements[index].leadType ? elements[index].leadType : null
        //                    leads = leads.concat(leadData.data)
        //                     if (totalFetched == FbPageList.length) {
        //                         this.props.dispatch({ type: FORMLEAD_ACTION_TYPES.FORMLEAD_REQUEST_SUCCESS, responseData: leads })
        //                         this.setState({ getLead: leads, searchItems: leads, title: 'All Leads', loader: false }, () => {
        //                             console.log(this.state.getLead,"gleadsleadsleadsleads",leads)
        //                             let intialCheck = this.state.getLead.map(x => false);
        //                             this.setState({
        //                                 checked: intialCheck,
        //                             })
        //                         })

        //                     }else{
        //                         console.log("else part 2222222.smmmamammaa")

        //                     }
        //                 }).catch((err) => {
        //   console.log(err.message,"error .smmmamammaa")
        //                     ++totalFetched;
        //                 })
        //           }) 
        //         }
        //             :
        //             this.setState({ getLead: [], title: 'All Leads', loader: false }, () => { })
        //     } else {
        //         this.setState({ getLead: [], title: 'All Leads', loader: false }, () => { })
        //     }
        // }).catch((err) => {
        //     this.setState({ getLead: [], title: 'All Leads', loader: false }, () => { })
        //     console.log(err)
        // })
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps, "nextProps.formLeadnextProps.formLead")
        if(nextProps && nextProps.navigation && nextProps.navigation.state.params && nextProps.navigation.state.params.formData && 
             nextProps.navigation.state.params.type =='single' ){
            let { formData, title } = nextProps.navigation.state.params;
            console.log(formData,"formDataformDataformDataformData")

            getSingleLead(formData.formId).then( (lead) => {
                //   self.lead_list=lead;
                console.log(lead,"leadleadlead")
                this.setState({
                    // searchItems: nextProps.formLead,
                    updatedFormLead: (nextProps.formData) ? (!this.state.updatedFormLead) : this.state.updatedFormLead
                }, () => {
                    console.log(this.state.getLead,"getleadss data is will recevice prp")
    
                    console.log(this.state, "will recievie these updated state")
    
                })
                self.lead_local_list = lead;
                var lead1 = lead.sort(function (a, b) {
                    var dateA = new Date(a.store_date); // ignore upper and lowercase
                    var dateB = new Date(b.store_date); // ignore upper and lowercase
                    return dateB.getTime() - dateA.getTime();
                });
                self.get_all_leads(lead1, 'single');
            }, function (err) {
               // self.loaderService.showErrorToast(err);
                console.log(err);
            });
        }
        if (nextProps && nextProps.navigation && nextProps.navigation.state.params && nextProps.navigation.state.params.data) {
            let { data, title } = nextProps.navigation.state.params
            this.setState({
                getLead: nextProps.formLead,
                searchItems: nextProps.formLead,
                title: title,
                archieve_badge: nextProps.archieve_badge,
                flag_badge: nextProps.flag_badge,

            })
        } else {
            this.setState({
                archieve_badge: nextProps.archieve_badge,
                flag_badge: nextProps.flag_badge,
                getLead: nextProps.formLead,
                // searchItems: nextProps.formLead,
                updatedFormLead: (nextProps.formLead) ? (!this.state.updatedFormLead) : this.state.updatedFormLead
            }, () => {
                console.log(this.state.getLead,"getleadss data is will recevice prp")

                console.log(this.state, "will recievie these updated state")

            })
        }

    }

    /****************START SEARCHBAR SECTION**************************/
    hideSearchbar = () => {
        this.setState({ noSearch: false, showSearchbar: !this.state.showSearchbar, showCancel: !this.state.showCancel, getLead: this.state.searchItems })
    }

    _onRefresh() {

        this.setState({ showSearchbar: !this.state.showSearchbar, showCancel: false })

    }


    /********************** */
    searchUpdated(text) {
        let updatedList = this.state.searchItems.filter((item, i) => {

            let items = item.field_data.filter((fieldItem, j) => {
                console.log(items, "updatedListupdatedListupdatedListupdatedList")
                return fieldItem.values[0].toLowerCase().indexOf(text.toLowerCase()) >= 0

            });
            console.log(this.state.searchItems, "updatedListupdatedListupdatedListupdatedList")
            return items.length > 0;

        });
        this.setState({ getLead: updatedList }, () => {
            if (this.state.getLead.length <= 0) {
                this.setState({ noSearch: true })
            } else {
                this.setState({ noSearch: false })
            }
        });

    }



    gotoLeadDetails = () => {
        this.props.navigation.navigate('LeadDetails')
    }
    handleChange = (index, item) => {
        let checked = [...this.state.checked];
        checked[index] = !checked[index];
        console.log(this.state.checkedarr, "this.state.checkedarr")

        this.setState({ checked });
        // this.setState({ value: checked[index] })
        if (checked[index]) {
            console.log(checked, "herre in if ")

            this.setState({
                checkedarr: [...this.state.checkedarr, item]
            }, () => console.log(this.state.checkedarr))

        } else {
            console.log(checked, "herre in elese ", this.state.getLead)
            console.log(this.state.checkedarr, "this.state.checkedarr11111111111")
            const index = this.state.checkedarr.indexOf(item);

            this.state.checkedarr.splice(index, 1);

            // this.setState({
            //     checkedarr: this.state.checkedarr,

            // }, () => console.log(this.state.checkedarr, "äsgjkagskjdgaskd"))
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
    flagMultipleLead = async () => {

        let leads = [];
        let totalFetched = 0;
        let newArchiveId = []
        if (this.state.checkedarr && this.state.checkedarr.length > 0) {
            // alert('checked array')
            this.setState({ loader: true })
            let { params } = this.props.navigation.state
            console.log(params, "params", this.state.checkedarr, "this.state.checkedArr")
            this.state.checkedarr.length > 0 ? this.state.checkedarr.forEach(async (entry, index) => {
                // 
                let formId;
                newArchiveId.push(entry.id)

                if (params) {
                    // 
                    formId = params && params.formData[index] ? params.formData[index].formId : null;

                } else {
                    // 
                    formId = this.props.leads && this.props.leads[index].formId ? this.props.leads[index].formId : null;

                }
                let retrievedItem = await AsyncStorage.getItem("user_info");
                let itemVal = JSON.parse(retrievedItem);
                let access_token = itemVal.accessToken
                if (formId) {
                    // alert(formId)
                    getLeadDatail(entry.id, access_token).then(async (res) => {
                        // 
                        // alert(entry.id+'entryid')
                        console.log(res, "resres")
                        ++totalFetched;
                        leads = leads.concat(res)
                        // alert(JSON.stringify(leads))
                        if (leads && leads.length > 0) {
                            // 

                            leadId = leads[index].dataId;
                            //  if (totalFetched == this.state.checkedarr.length) {

                            if (!(leads[index].leadType) || (leads[index].leadType) && (leads[index].leadType !== 'flag')) {
                                // 
                                await addFlagLead(leads[index], entry.id).then(async (flagIdRes) => {
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
                                        console.log(badge_data, "this.state.flag_badgethis.state.flag_badge", this.state.checkedarr.length)

                                        await flagLeadUpdate(leads[index].dataId, flagdata).then(async (res) => {
                                            // 
                                            await updateUserData(badge_data).then((userUpdate) => {
                                                // 
                                                this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge })
                                                this.props.dispatch({
                                                    type: 'UPDATE_FORMLEAD_DATA',
                                                    formLead: newArchiveId,
                                                    flagdata: flagdata,
                                                    flag_id: flagIdRes
                                                })
                                                this.setState({ loader: false })
                                                this.cancelChecked()

                                                console.log(userUpdate, "userUpdateuserUpdate")
                                            }).catch((err) => {

                                                console.log(err.message, "error in user update")
                                                this.setState({ loader: false })
                                                this.cancelChecked()
                                            })
                                            this.setState({ loader: false })
                                            this.cancelChecked()
                                        })
                                    }
                                }).catch((err) => {
                                    // 
                                    this.setState({ loader: false })
                                    this.cancelChecked()
                                    console.log(err.message, "fgdgfdg")
                                })
                            } else {
                                // 
                                this.setState({ loader: false })
                                this.cancelChecked()

                            }
                        }
                        // } else {
                        //     this.setState({ loader: false })
                        //     this.cancelChecked()
                        // }

                    }).catch((err) => {
                        ++totalFetched;
                        this.setState({ loader: false })
                        this.cancelChecked()
                        console.log("werr", err)
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
    //*********************************************Single Add To Flag *********************** */

    // Add to flag
    flagToSingleLead = async (entry) => {
        console.log(entry,"entryentryentry");
        return
        this.setState({
            loader: true
        }, async () => {
            if (entry) {
                let retrievedItem = await AsyncStorage.getItem("user_info");
                let itemVal = JSON.parse(retrievedItem);
                let access_token = itemVal.accessToke
                getLeadDatail(entry.id, access_token).then((response) => {
                    // 
                    this.setState({
                        leadData: response && response.length ? response[0] : {},
                        // isFlag: response && response.length && response[0].leadType && response[0].leadType == 'flag' ? true : false
                    }, () => {

                        if (this.state.leadData && this.state.leadData.leadType != 'flag') {

                            addFlagLead(this.state.leadData, this.state.leadData.uid).then((res) => {
                                // 
                                if (res) {
                                    let flagdata = {
                                        'leadType': 'flag',
                                        'flag_id': res
                                    };
                                    flagLeadUpdate(this.state.leadData.dataId, flagdata).then((res) => {
                                        // 
                                        let badge_data = {
                                            flag_leads_badge: this.state.flag_badge + 1
                                        };
                                        updateUserData(badge_data).then((userUpdate) => {
                                            // 
                                            this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge + 1 })
                                            this.props.dispatch({
                                                type: 'UPDATE_FORMLEAD_DATA',
                                                formLead: [entry.id],
                                                flagdata: flagdata,
                                                flag_id: res
                                            })

                                            // getLeadDatail(this.state.leadData.leadId).then((res) => {
                                            //     console.log(res, "res single data")
                                            //     this.setState({
                                            //         leadData: res && res.length ? res[0] : {},
                                            //         isFlag: res && res.length && res[0].leadType && res[0].leadType == 'flag' ? true : null
                                            //     }, () => {
                                            //         console.log(this.state.leadData, "update leadData============================")
                                            //     })
                                            // }).catch((err) => {
                                            //     console.log("werr", err)
                                            // })
                                            this.setState({ loader: false, })

                                        }).catch((err) => {
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
                            flagLeadUpdate(this.state.leadData.dataId, flagdata).then((res) => {
                                if (res) {
                                    getFlagLead(this.state.leadData.leadId).then((flagRes) => {
                                        if (flagRes) {
                                            removeFlagLead(flagRes[0].dataId).then((remFlag) => {
                                                let badge_data = {
                                                    flag_leads_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0
                                                };
                                                updateUserData(badge_data).then((userUpdate) => {
                                                    this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0 })
                                                    this.props.dispatch({
                                                        type: 'UPDATE_FORMLEAD_DATA',
                                                        formLead: [entry.id],
                                                        flagdata: flagdata,
                                                        flag_id: this.state.leadData.flag_id
                                                    })
                                                    this.setState({ loader: false, })
                                                }).catch((err) => {
                                                    console.log("Update badge error")
                                                })
                                                // alert("Remove Flag")
                                                this.setState({ loader: false, })

                                            }).catch((err) => {
                                                // alert("Error in Removed")
                                            })
                                        }
                                    }).catch((err) => {

                                    })
                                } else {
                                    // alert("No response")
                                    this.setState({ loader: false, })

                                }
                                // alert('Leads Flag Updated successfully')
                            })
                        }
                    })
                }).catch((err) => {
                    this.setState({ loader: false, })

                })

            }

        })


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
            this.state.checkedarr.length > 0 ? this.state.checkedarr.forEach(async (entry, index) => {
                // alert("archiveList")
                let formId;
                newArchiveId.push(entry.id)
                if (params) {
                    formId = params && params.formData[index] ? params.formData[index].formId : null;
                } else {
                    formId = this.props.leads && this.props.leads[index].formId ? this.props.leads[index].formId : null;
                }
                let retrievedItem = await AsyncStorage.getItem("user_info");
                let itemVal = JSON.parse(retrievedItem);
                let access_token = itemVal.accessToken
                if (formId) {
                    console.log(entry, "entryentryentry")
                    getLeadDatail(entry.id, access_token).then((res) => {
                        ++totalFetched;
                        leads = leads.concat(res)
                        if (leads && leads.length > 0) {
                            console.log(leads[index].dataId, "leads[index].dataIdleads[index].dataId")
                            leadId = leads[index].dataId;
                            // if (totalFetched == this.state.checkedarr.length) {
                            let newArchiveArray = []
                            addArchieveLead(leads[index], entry.id).then((new_archieve_data) => {
                                newArchiveArray.push(new_archieve_data)
                                archieveLead(leads[index], 'yes').then((res) => {
                                    this.state.archieve_badge = this.state.archieve_badge + 1
                                    let badge_data = {
                                        archieve_leads_badge: this.state.archieve_badge
                                    };
                                    updateUserData(badge_data).then((userUpdate) => {
                                        this.props.dispatch({ type: 'UPDATE_ARCHIVE_BADGE', archieve_badge: this.state.archieve_badge })
                                        if (leads[index].flag_id) {
                                            this.state.flag_badge = this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0
                                            let flag_badge_data = {
                                                flag_leads_badge: this.state.flag_badge
                                            };

                                            updateUserData(flag_badge_data).then((userUpdate) => {
                                                this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge })

                                            })
                                            // alert(leads[index].flag_id+'flag_id')
                                            removeFlagLeadId(leads[index].flag_id).then((removeFlag) => {
                                                this.props.dispatch({
                                                    type:
                                                        FORMLEAD_ACTION_TYPES.FORMLEAD_REMOVESUCCESS,
                                                    checkedarr: newArchiveId
                                                })
                                                this.setState({ loader: false })
                                                this.cancelChecked()
                                            }).catch((err) => {
                                                this.setState({ loader: false })
                                                this.cancelChecked()
                                                // alert("Error to  Archive  Flag")
                                            })
                                        } else {
                                            this.props.dispatch({
                                                type:
                                                    FORMLEAD_ACTION_TYPES.FORMLEAD_REMOVESUCCESS,
                                                checkedarr: newArchiveId
                                            })
                                            // alert("No lead Id")
                                            this.setState({ loader: false })
                                            this.cancelChecked()
                                        }
                                    }).catch((err) => {
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
                        // } else {
                        //     this.setState({ loader: false })
                        //     this.cancelChecked()
                        // }

                    }).catch((err) => {
                        ++totalFetched;
                        console.log("werr", err)

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
        }, async () => {
            if (entry) {
                let newArchiveId = []
                let retrievedItem = await AsyncStorage.getItem("user_info");
                let itemVal = JSON.parse(retrievedItem);
                let access_token = itemVal.accessToke
                getLeadDatail(entry.id, access_token).then((response) => {
                    //  
                    this.setState({
                        leadData: response && response.length ? response[0] : {},
                        // isFlag: response && response.length && response[0].leadType && response[0].leadType == 'flag' ? true : false
                    }, () => {
                        let leadId = this.state.leadData.dataId
                        newArchiveId.push(entry.id);
                        // if (totalFetched == this.state.checkedarr.length) {
                        let newArchiveArray = []
                        addArchieveLead(this.state.leadData, entry.id).then((new_archieve_data) => {
                            // 
                            newArchiveArray.push(new_archieve_data)
                            archieveLead(this.state.leadData, 'yes').then((res) => {

                                // 
                                let badge_data = {
                                    archieve_leads_badge: this.state.archieve_badge + 1
                                };
                                updateUserData(badge_data).then((userUpdate) => {

                                    // 
                                    this.props.dispatch({ type: 'UPDATE_ARCHIVE_BADGE', archieve_badge: this.state.archieve_badge + 1 })

                                    if (this.state.leadData && this.state.leadData.flag_id) {
                                        let flag_badge_data = {
                                            flag_leads_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0
                                        };
                                        updateUserData(flag_badge_data).then((userUpdate) => {
                                            // 
                                            this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0 })

                                        }).catch((err) => {
                                            console.log(err.message, "8888888888888888888")
                                        })

                                        // alert(leads[index].flag_id+'flag_id')
                                        removeFlagLeadId(this.state.leadData.flag_id).then((removeFlag) => {
                                            // 
                                            this.props.dispatch({
                                                type:
                                                    FORMLEAD_ACTION_TYPES.FORMLEAD_REMOVESUCCESS,
                                                checkedarr: [entry.id]
                                            })
                                            this.setState({ loader: false })
                                            this.cancelChecked()
                                        }).catch((err) => {
                                            // 
                                            this.setState({ loader: false })
                                            this.cancelChecked()
                                            // alert("Error to  Archive  Flag")
                                        })
                                    } else {
                                        // 
                                        this.props.dispatch({
                                            type:
                                                FORMLEAD_ACTION_TYPES.FORMLEAD_REMOVESUCCESS,
                                            checkedarr: [entry.id]
                                        })
                                        // alert("No lead Id")
                                        this.setState({ loader: false })
                                        this.cancelChecked()
                                    }
                                }).catch((err) => {
                                    // 
                                    this.setState({ loader: false })
                                    this.cancelChecked()
                                    console.log(err.message, "message")
                                })

                            }).catch((err) => {
                                // 
                                console.log(err.message, "222222222222222222222")

                                this.setState({ loader: false })
                                this.cancelChecked()
                            })

                        }).catch((err) => {
                            // 
                            console.log(err.message, "33333333333333")

                            this.setState({ loader: false })
                            this.cancelChecked()
                        })
                    })

                })

            }
        })
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
        // console.lo

        // console.log(formatAMPM(item.created_time),"formatAMPM(item.created_time)")
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

                <TouchableOpacity activeOpacity={.8} style={{ flex: 1 }}
                    onPress={() => !this.state.showEdit && this.props.navigation.navigate('Viewlead', {
                        receivedata: lead,
                        formData: params && params.formData ? params.formData : [],
                        allLeads: true,
                        flag: false,
                        archive: false,
                        leadId: item.id
                    })}>
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
                                <View style={{ flex: 0.25 }}>
                                    <CheckBox
                                        title={''}
                                        left
                                        containerStyle={{ backgroundColor: 'white', borderWidth: 0, }}
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
                            <Text>>{item.data2 && item.data2.values[0] ? item.data2.values[0] : null}</Text>
                            <Text numberOfLines={1}>{item.data3 && item.data3.values[0] ? item.data3.values[0] : null}</Text>
                        </View>

                        {
                            !this.state.showEdit && <View style={{
                                flex: 0.2, flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingRight: 0
                            }}>
                                <View style={{ marginLeft: 5, marginTop: 5 }}>
                                    <Text style={{ alignSelf: 'center' }}>{item.created_time ? moment(item.created_time).format("hh:mm A") : null}
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
                <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>
                    {this.state.title ? this.state.title.substr(0, 25) : null} {this.state.title && this.state.title.length > 30 ? '...' : ''}
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
    // checkIsSubscibedData = () => {
    //     let userId = firebase.auth().currentUser.uid;
    //     checkIsSubscibed(userId).then((res) => {
    //         this.setState({subscribe_type : res})
    //    })
    // }

    renderSpinner() {
        return (
            <View style={{ position: 'absolute', top: height / 2, left: width / 2, zIndex: 100 }}>
                <ActivityIndicator size={'large'} color='#5890FF' />
            </View>
        )
    }


    //swipeout


    //swipeout



    render() {
console.log(this.lead_all_list,"dddd")
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <Header
                        leftComponent={{ icon: 'menu', color: '#5890FF', onPress: () => this.props.navigation.navigate('DrawerOpen', { delete: false }) }}
                        centerComponent={this.centerComponent()}
                        rightComponent={<MyCustomRightComponent showEdit={this.state.showEdit}
                            showButton={(this.state.getLead.length > 0)}
                            showEditCancel={() => this.showEditCancel()} />}
                        backgroundColor={'#F8F8F8'}

                    />
                    {this.state.loader && this.renderSpinner()}

                    {


                        this.state.showSearchbar ? <View style={{

                            flexDirection: 'row', paddingBottom: 10,
                        }}>

                            <TouchableOpacity style={{ width: width / 6, borderBottomColor: '#f8f8f8', backgroundColor: '#fff', alignItems: 'center', paddingTop: 15, borderBottomWidth: 3 }}>

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
                                onChangeText={(text) => this.searchUpdated(text)}
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
                            <TouchableOpacity onPress={this.hideSearchbar} style={{ height: 50, borderBottomWidth: 3, borderBottomColor: '#f8f8f8', width: width / 5, backgroundColor: '#fff', alignItems: 'center', paddingTop: 15, position: 'absolute', right: 5, bottom: 70, top: 70, }}>
                                <Text style={{ color: '#5890ff', fontWeight: 'bold' }}>
                                    CANCEL
                        </Text>
                            </TouchableOpacity>
                            :
                            null
                    }

                    <View style={{ flex: 1, padding: 10 }}>
                        {
                            (this.state.noSearch) ?
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#777' }}>There are no leads that match your search.</Text>
                                </View> :
                                <FlatList
                                    extraData={this.state.updatedFormLead}
                                    data={this.lead_all_list}
                                    keyExtractor={this._keyExtractor.bind(this)}
                                    renderItem={this._renderData.bind(this)}
                                    scrollEnabled={this.lead_all_list && this.lead_all_list.length ? true : false}
                                    ListEmptyComponent={() => {
                                        return (
                                            <View style={{ alignItems: 'center', marginTop: height / 4 + 20,}}>
                                            <Image source={defaultimage} resizeMode="contain" 
                                           />
                                            <Text style={{ fontSize: 20, color: '#BDC1CA', fontWeight:'bold',
                                            fontFamily: 'Roboto-Bold' }}>
                                                You don't have any leads yet.
                                </Text>

                                        </View>
                                        )
                                    }}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshing}
                                            onRefresh={this._onRefresh.bind(this)}
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
                                <TouchableOpacity onPress={() => this.markAll('markAll')}>
                                    <View>
                                        <Text style={{ color: '#5890ff', fontSize: 16 }}>Mark All</Text>
                                    </View>

                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.flagMultipleLead()}>
                                    <View>

                                        <Text style={{ color: 'black', fontSize: 16 }}>Flag</Text>
                                    </View>

                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.confirmArchieveMultipleLead()}>
                                    <View>
                                        <Text style={{ color: 'black', fontSize: 16 }} >Archive</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            : <TouchableOpacity activeOpacity={.8} style={{ backgroundColor: '#f8f8f8', height: 50 }} >
                                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ alignSelf: 'center' }}>Updated just Now</Text>
                                    <Text style={{ alignSelf: 'center' }}>{this.lead_all_list && this.lead_all_list.length} Lead(s)</Text>
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

