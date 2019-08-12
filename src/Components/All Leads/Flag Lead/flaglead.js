import React, { Component } from 'react'

import {
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    ActivityIndicator, Dimensions, Linking, FlatList,
    AsyncStorage, RefreshControl, TextInput, SafeAreaView
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Header from '../../../Common/Header'
import { Button, Badge, Icon } from 'react-native-elements';
const { width, height } = Dimensions.get('window');
import { listFlagLeads } from '../../../Actions/FlagLeadAction'
import firebase from 'firebase'
import { getUserDetails, checkIsSubscibed } from '../../../Actions/AuthAction'
import {
getLeadDatail,
} from '../../../Actions/LeadsAction';
const orange_color_circle = require("../../../Assets/img/orange_color_circleold.png")

let defaultimage = require('../../../Assets/img/inbox-old.png');

const hitSlop = { top: 15, bottom: 15, left: 15, right: 15 };
let self

class MyCustomRightComponent extends Component {
    render() {
        return (
            <View>
                <Text style={{ color: '#5890ff', fontWeight: 'bold' }} >
                    UNFLAG
              </Text>
            </View>
        )
    }
}

class FlagLead extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSource: [
                { name: 'John Apple', email: 'johnapple@gmail.com', phone: '123456789', time: '5:25 pm' },
            ],
            lead_all_list: [],
            searchItems: [],

            check_lead_list: [],
            normal_lead_list: [],
            dataList: [],
            loader: false,
            refreshing: false,
            showSearchbar: false,
            showCancel: false,
            search: '',
            searchTerm: '',
            searchValue: '',
            text: '',
            updatedFormLead: false,
            noSearch: false,
            subscribe_type: false,
            isDataExits:[]
        }
        this.subscribe_type = null;
        self = this
        this.lead_all_list = [];
        this.check_lead_list = [];
        this.normal_lead_list = [];
        this.lead_local_list = [];

    }
    componentDidMount() {
        this.setState({ loader: true })

        let count_list = 30;
        let search = {
            search_value: ''
        };
        let userId = firebase.auth().currentUser.uid;
        this.getFlagList(userId)

    }
    //GET FLAG LIST
    async getFlagList(userId) {

        this.lead_all_list = []
        const retrievedItem = await AsyncStorage.getItem("user_info");
        const itemVal = JSON.parse(retrievedItem);
        const access_token = itemVal.accessToken
        listFlagLeads(userId).then((lead) => {
            this.lead_local_list = lead;
            let lead1 = lead.sort(function (a, b) {
                var dateA = new Date(a.store_date); // ignore upper and lowercase
                var dateB = new Date(b.store_date); // ignore upper and lowercase
                return dateB.getTime() - dateA.getTime();
            });
            if (lead1 && lead1.length > 0) {
                lead1.map((item, index) => {
                    if (item.leadId) {
                        fetch(`https://graph.facebook.com/v3.0/${item.leadId}?access_token=${access_token}`, ['ads_management', 'manage_pages'])
                            .then((data) => data.json())
                            .then((responseJson) => {
                                console.log('got response for index ' + index)
                                console.log(responseJson)
                                //  let responseJson = res.json()
                                if(item.leadId) {
                                    getLeadDatail(item.leadId).then((leadRes) => {
                                        item.leadData = leadRes && leadRes.length ? leadRes[0] : {};
                                        console.log( item.leadData," item.leadData item.leadData")
                                    }).catch((err) => {
                                        console.log("catch")
                                    })
                                }
                                if (responseJson && !responseJson.error) {
                                    if (responseJson.field_data) {
                                        item.field_data = [];
                                        item.field_data = item.field_data.concat(responseJson.field_data);
                                        let local_field = responseJson.field_data;
                                        let temp = [];
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
                                        if (index == lead1.length - 1) {
                                            this.setState({ loader: false })
                                            let { params } = this.props.navigation.state
                                            this.setState({ normal_lead_list: this.lead_all_list,isDataExits:this.lead_all_list }, () => {
                                                console.log(this.state.normal_lead_list, "getLeadgetLeadgetLeadgetLead")
                                                this.setState({
                                                    title: params && params.title ? params.title : 'All Leads',
                                                    updatedFormLead: true,
                                                })
                                            })
                                        }

                                    } else {
                                        this.setState({ normal_lead_list: self.lead_all_list,isDataExits:this.lead_all_list }, () => {
                                            this.setState({
                                                // searchItems: nextProps.formLead,
                                                updatedFormLead: true,
                                                loader: false
                                            })
                                        })
                                    }

                                } else {
                                    this.setState({ normal_lead_list: self.lead_all_list,isDataExits:this.lead_all_list }, () => {
                                        this.setState({
                                            // searchItems: nextProps.formLead,
                                            updatedFormLead: true,
                                            loader: false
                                        })
                                    })
                                }
                            }).catch((err) => {
                                this.setState({ normal_lead_list: self.lead_all_list,isDataExits:this.lead_all_list }, () => {
                                    this.setState({
                                        // searchItems: nextProps.formLead,
                                        updatedFormLead: true,
                                        loader: false
                                    })
                                })

                                console.log(err.message, "mnessgae")
                            })
                    }

                })
            } else {
                this.setState({ normal_lead_list: self.lead_all_list,isDataExits:this.lead_all_list }, () => {
                    this.setState({
                        // searchItems: nextProps.formLead,
                        updatedFormLead: true,
                        loader: false
                    })
                })
            }
            // self.get_all_leads(lead1, 'multiple');
        }, function (err) {
            //self.loaderService.showErrorToast(err);
            console.log(err);
        });
    }

    async get_all_leads(items, list_type) {
        this.lead_all_list = [];
        this.check_lead_list = [];
        this.normal_lead_list = [];
        console.log(items, "itemsss")
        //await this.store_leads(items, 0, false, list_type);
        items && items.length > 0 ? items.map(async (item, j) => {
            await this.store_leads(items, j, false, list_type);
        }) :
            self.setState({ normal_lead_list: self.lead_all_list, loader: false }, () => {
                this.setState({
                    // searchItems: nextProps.formLead,
                    updatedFormLead: true, //(self.getLead) ? (!self.updatedFormLead) : self.updatedFormLead
                })
            })
    }


    async store_leads(item, i, refresh) {
        const retrievedItem = await AsyncStorage.getItem("user_info");
        const value = JSON.parse(retrievedItem);
        const access_token = value.accessToken
        let self = this;
        if (item && item.length > 0) {
            console.log(i, "oooooooop", this.lead_local_list[i], item.length, this.lead_local_list)
            if (i < item.length) {
                //getLeadData(entry.formId, access_token).then(function (res) {
                //   if(this.lead_local_list[i] && this.lead_local_list[i].leadId){
                fetch(`https://graph.facebook.com/v3.0/${this.lead_local_list[i].leadId}?access_token=${access_token}`,
                    ['ads_management', 'manage_pages']).then(async (res) => {
                        let responseJson = await res.json()
                        console.log(responseJson, "responseJson")
                        //  FacebookNative.api("/" + self.lead_local_list[i].leadId, ['ads_management', 'manage_pages']).then(function (res) {
                        if (responseJson && !responseJson.error) {
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
                                console.log(local_field, "local_fieldlocal_field")

                                for (var j = 0; j < local_field.length; j++) {
                                    temp.push(local_field[j]);
                                }
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
                                   
                                    self.setState({ loader: false })

                                    self.lead_all_list.push(item[i]);
                                    //  if (i == item.length - 1) {
                                    self.setState({ loader: false })
                                    let { params } = this.props.navigation.state
                                    self.setState({ normal_lead_list: self.lead_all_list }, () => {
                                        this.setState({
                                            // searchItems: nextProps.formLead,
                                            updatedFormLead: true,//(self.getLead) ? (!self.updatedFormLead) : self.updatedFormLead
                                        })


                                    })
                                    // }

                                    // self.props.dispatch({ typeF: FORMLEAD_ACTION_TYPES.FORMLEAD_REQUEST_SUCCESS, responseData: self.lead_all_list })
                                }
                                if (i === self.count_list) {
                                    //  self.showing_page = true;
                                }
                                //   i++;
                                // self.store_leads(item, i, refresh, list_type);
                            } else {
                                self.setState({ loader: false })
                                self.setState({ normal_lead_list: self.lead_all_list }, () => {
                                    this.setState({
                                        // searchItems: nextProps.formLead,
                                        updatedFormLead: true, //(self.getLead) ? (!self.updatedFormLead) : self.updatedFormLead
                                    })
                                })


                            }
                        } else {
                            console.log("In Notify Leads")
                            if (i === self.count_list) {
                                //  self.showing_page = true;
                            }

                            self.setState({ loader: false })
                            // i++;
                            //  console.log("hreee")
                            //self.store_leads(item, i, refresh, list_type);
                            self.setState({ normal_lead_list: self.lead_all_list }, () => {
                                this.setState({
                                    // searchItems: nextProps.formLead,
                                    updatedFormLead: true, //(self.getLead) ? (!self.updatedFormLead) : self.updatedFormLead
                                })
                            })
                            // If response error from Leads 

                        }


                    }, function (err) {
                        //  i++;
                        //self.store_leads(item, i, refresh, list_type);
                        console.log(err);
                    }).catch(e => {
                        
                        let { params } = this.props.navigation.state
                        self.setState({ loader: false })
                        self.setState({ normal_lead_list: self.lead_all_list }, () => {
                            this.setState({
                                // searchItems: nextProps.formLead,
                                updatedFormLead: true, //(self.getLead) ? (!self.updatedFormLead) : self.updatedFormLead
                            })
                        })
                        //console.log(e);
                    });
                // }else{
                //     console.log("here insdf option")
                // }
            }
            else {
                console.log("Going to Else", this.lead_all_list)
            }
        } else {
            self.setState({ normal_lead_list: self.lead_all_list }, () => {
                this.setState({
                    // searchItems: nextProps.formLead,
                    updatedFormLead: true,
                    loader: false
                })
            })

        }


        //     if (item && item.length > 0) {
        //         if (i < item.length) {
        //         fetch(`https://graph.facebook.com/v3.0/${item[i].leadId}?access_token=${access_token}`,
        //                 ['ads_management', 'manage_pages']).then(async (responseJson) => {
        //                     let res = await responseJson.json()
        //             if (res) {
        //                 if (res.field_data) {
        //                     var local_field = res.field_data;
        //                     var temp = [];
        //                     for (var j = 0; j < local_field.length; j++) {
        //                         if (local_field[j].name === 'full_name') {
        //                             temp.push(local_field[j]);
        //                             local_field.splice(j, 1);
        //                         }
        //                         if (j === local_field.length - 1) {
        //                             for (var k = 0; k < local_field.length; k++) {
        //                                 if (local_field[k].name === 'email') {
        //                                     temp.push(local_field[k]);
        //                                     local_field.splice(k, 1);
        //                                 }
        //                                 if (k === local_field.length - 1) {
        //                                     for (var l = 0; l < local_field.length; l++) {
        //                                         if (local_field[l].name === 'phone_number') {
        //                                             temp.push(local_field[l]);
        //                                             local_field.splice(l, 1);
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                     for (var j = 0; j < local_field.length; j++) {
        //                         temp.push(local_field[j]);
        //                     }
        //                     if (temp[0]) {
        //                         item[i].data1 = temp[0];
        //                     }
        //                     if (temp[1]) {
        //                         item[i].data2 = temp[1];
        //                     }
        //                     if (temp[2]) {
        //                         item[i].data3 = temp[2];
        //                     }
        //                     if (refresh) {
        //                         self.lead_all_list1.push(item[i]);
        //                     }
        //                     else {
        //                         self.lead_all_list.push(item[i]);
        //                         //  if (i == item.length - 1) {
        //                         self.setState({ loader: false })
        //                         self.setState({ normal_lead_list: self.lead_all_list }, () => {
        //                             this.setState({ 
        //                                 // searchItems: nextProps.formLead,
        //                                 updatedFormLead: (self.lead_all_list) ? (!self.state.updatedFormLead) : self.state.updatedFormLead
        //                             })


        //                         })


        //                     }
        //                     if (i === self.count_list) {
        //                         self.showing_page = true;
        //                     }
        //                     i++;
        //                     self.store_leads(item, i, refresh);
        //                 }
        //             } else {
        //                 if (i === self.count_list) {
        //                     self.showing_page = true;
        //                 }
        //                 i++;
        //                 self.store_leads(item, i, refresh);
        //             }
        //         }, function(err) {
        //             i++;
        //             self.store_leads(item, i, refresh);
        //         }).catch(e => {
        //             i++;
        //             self.store_leads(item, i, refresh);
        //         });
        //     } else {
        //         if (refresh) {
        //             self.check_lead_list = self.lead_all_list1;
        //             self.normal_lead_list = self.lead_all_list1;
        //             self.lead_all_list = self.lead_all_list1;
        //            // this.set
        //           //  window.localStorage.setItem("flag_lead_data", JSON.stringify(self.lead_all_list1));
        //         }
        //         else {
        //             self.check_lead_list = self.lead_all_list;
        //             self.normal_lead_list = self.lead_all_list;
        //             self.setState({ loader: false })
        //             // self.setState({ normal_lead_list: self.lead_all_list }, () => {
        //             //     this.setState({
        //             //         // searchItems: nextProps.formLead,
        //             //         updatedFormLead: (self.lead_all_list) ? (!self.updatedFormLead) : self.updatedFormLead
        //             //     })
        //             // })
        //            // window.localStorage.setItem("flag_lead_data", JSON.stringify(self.lead_all_list));
        //         }
        //         this.showing_page = true;
        //         this.show_refresh_loading = false;
        //         if (self.referesher_var) {
        //            // self.referesher_var.complete();
        //         }
        //     }
        // }else {
        //     self.setState({ normal_lead_list: self.lead_all_list }, () => {
        //         this.setState({
        //             // searchItems: nextProps.formLead,
        //             updatedFormLead: (self.lead_all_list) ? (!self.updatedFormLead) : self.updatedFormLead
        //         })
        //     })
        //     self.setState({ loader: false })

        // }


    }

    gotoLeadDetails = () => {
        this.props.navigation.navigate('LeadDetails')
    }
    //search text
    searchUpdated(text) {
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
            this.setState({ normal_lead_list: self.normal_lead_list }, () => {
                if (this.state.normal_lead_list.length <= 0) {
                    this.setState({ noSearch: true })
                } else {
                    this.setState({ noSearch: false })
                }
            })
            // self.load_more();
        }
        else {
            self.normal_lead_list = self.lead_all_list;
            this.setState({ normal_lead_list: self.normal_lead_list }, () => {
                if (this.state.normal_lead_list.length <= 0) {
                    this.setState({ noSearch: true })
                } else {
                    this.setState({ noSearch: false })
                }
            })
            // self.count_list = 30;
        }
    }
    /****************END SEARCHBAR SECTION**************************/


    _keyExtractor = (item, index) => index + 'data';
    _renderData = ({ item, index }) => {
        console.log(item, "jjjjjj")
        // let lead = {};
        // item.field_data.map((data, i) => {
        //     lead[data.name] = data.values[0]
        //     return lead
        // })
        return (
            <TouchableOpacity hitSlop={hitSlop} activeOpacity={.8} style={{ flex: 1 }}

                onPress={() => this.props.navigation.navigate('Viewlead', {
                    receivedata: item,
                    leadId: item.leadId,
                    allLeads: false,
                    flag: true,
                    archive: false,
                })}>
                <View style={{ flex: 1 }}>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        borderBottomColor: '#dcdcdc', borderBottomWidth: 1,
                        paddingBottom: 10,
                        marginTop: 5,
                    }}>

                        {item.leadType && item.leadType == 'flag' ? <View style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={orange_color_circle} style={{ width: 15, height: 15, alignSelf: 'center' }} />
                        </View> :
                            <View style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center' }} />
                        }
                        <View style={{ flex: 0.9, justifyContent: 'flex-start' }} >
                            <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 16, alignSelf: 'flex-start' }}
                                numberOfLines={1}>{item.data1 && item.data1.values[0] ? item.data1.values[0] : null}
                            </Text>
                            <Text>{item.data2 && item.data2.values[0] ? item.data2.values[0] : null}
                            </Text>
                            <Text numberOfLines={1}>{item.data3 && item.data3.values[0] ? item.data3.values[0] : null}
                            </Text>
                        </View>
                        <View style={{ flex: 0.1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                            <Icon name='chevron-right' size={38} color='#d3d3d3' />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    /****************START SEARCHBAR SECTION**************************/
    hideSearchbar = () => {
        this.setState({
            noSearch: false, showSearchbar: !this.state.showSearchbar, showCancel: !this.state.showCancel,
            normal_lead_list: self.lead_all_list
        })
    }

    _onRefresh() {
        this.setState({ showSearchbar: !this.state.showSearchbar, showCancel: false }, () => {
            let userId = firebase.auth().currentUser.uid;
            if (userId) {
                this.getFlagList(userId)
            }
            this.setState({ showSearchbar: true })
        })

    }


    /********************** */
    render() {
        // let userId = firebase.auth().currentUser.uid;
        // let subscribeTypeFcn =  checkIsSubscibed(userId).then((res) => {
        //     this.subscribe_type = res
        //     })
        console.log(this.lead_all_list, "ddddaaaaa", this.state.normal_lead_list)

        return (
            <SafeAreaView style={{ flex: 1,backgroundColor: '#F8F8F8' }}>
                <View style={{ flex: 1,  backgroundColor:this.state.normal_lead_list && this.state.normal_lead_list.length > 0 ? 'white' : '#D3D6DB' }}>
                    <Header title="Flagged Leads" navigateClick={() => this.props.navigation.navigate("DrawerOpen")} iconame='menu' />
                    {this.state.loader && <View style={{
                        flex: 1,
                        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 0,
                        right: 0, top: 0, bottom: 0, zIndex: 1, backgroundColor: "rgba(0,0,0,0)"
                    }}>
                        <ActivityIndicator size="large" color="#5890ff" /></View>}

                    {


                        this.state.showSearchbar && this.state.isDataExits && this.state.isDataExits.length > 0? <View style={{

                            flexDirection: 'row', paddingBottom: 10,
                        }}>

                            <TouchableOpacity hitSlop={hitSlop} style={{ width: width / 4, borderBottomColor: '#f8f8f8', backgroundColor: '#fff', alignItems: 'center', paddingTop: 15, borderBottomWidth: 3 }}>

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
                                    console.log('search')
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
                                <Text style={{ color: '#5890ff', fontWeight: 'bold' }}>
                                    CANCEL
                    </Text>
                            </TouchableOpacity>
                            :
                            null
                    }
                    {/* {
                        this.state.normal_lead_list.length > 0 && !this.state.loader ? */}

                    <View style={{ padding: 10, flex: 1,}}>
                        {
                            (this.state.noSearch) ?
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#777' }}>There are no leads that match your search.</Text>
                                </View> :
                                <FlatList
                                    extraData={this.state.updatedFormLead}
                                    data={this.state.normal_lead_list}
                                    keyExtractor={this._keyExtractor.bind(this)}
                                    renderItem={this._renderData.bind(this)}
                                    scrollEnabled={true}
                                    ListEmptyComponent={() => {
                                        return (
                                            <View style={{ alignItems: 'center', marginTop: height / 4 + 20,}}>
                                                <Image source={defaultimage} resizeMode="contain" 
                                                />
                                                <Text style={{ fontSize: 20,  marginTop:30,color: '#BDC1CA', fontWeight:'400',
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

                    {/* 
                            :
                            (this.state.normal_lead_list.length == 0 && !this.state.loader) ?
                                < View style={{ alignItems: 'center', marginTop: height / 4 + 20 }}>
                                    <Image source={defaultimage} />

                                    <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#a9a9a9' }}>

                                        You don't have any Flag leads yet.
                             </Text>

                                </View> :
                                null
                    } */}

                    {this.state.normal_lead_list.length > 0 && <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        {/* {
    (!this.subscribe_type && !this.state.loader) ?                            
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                    <View><Text>Please subscribe to see more leads.</Text></View>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("Subscription")}> <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}>Subscribe</Text></TouchableOpacity>
                                </View> : null
                        } */}
                        <TouchableOpacity hitSlop={hitSlop} activeOpacity={.8} style={{ backgroundColor: '#f8f8f8', height: 50 }} >

                            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ alignSelf: 'center' }}>Updated Just Now</Text>
                                <Text style={{ alignSelf: 'center' }}>{this.state.normal_lead_list ? this.state.normal_lead_list.length : 0} Lead(s)</Text>
                            </View>

                        </TouchableOpacity>
                    </View>}

                </View>
            </SafeAreaView>
        );
    }
}

export default FlagLead
