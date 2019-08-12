import React, { Component } from 'react'

import {
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    ActivityIndicator, Dimensions, Linking, FlatList,
    AsyncStorage,
    SafeAreaView
} from 'react-native'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../../../Common/Header'
import { Button, Badge, Icon } from 'react-native-elements';
const { width, height } = Dimensions.get('window')
let defaultimage = require('../../../Assets/img/inbox-old.png');
import { checkIsSubscibed } from '../../../Actions/AuthAction'

import { listArchieveLeads } from '../../../Actions/ArchiveLeadAction'
import firebase from 'firebase'

const hitSlop = { top: 15, bottom: 15, left: 15, right: 15 };

class MyCustomRightComponent extends Component {
    render() {
        return (
            <View>
                <Text style={{ color: '#5890ff', fontWeight: 'bold' }} >
                    Archived Leads
        </Text>
            </View>
        )
    }
}

class ArchivedLead extends Component {
    constructor(props) {
        super(props)
        this.state = {

            dataSource: [
                { name: 'John Apple', email: 'johnapple@gmail.com', phone: '123456789', time: '5:25 pm' },
            ],
            lead_all_list: [],
            check_lead_list: [],
            normal_lead_list: [],
            dataList: [],
            loader: false,
            noSearch: false,
            subscribe_type: false,
        }
        this.subscribe_type = null;

    }
    componentDidMount() {
        this.setState({ loader: true })
        let count_list = 30;
        let search = {
            search_value: ''
        };
        let userId = firebase.auth().currentUser.uid;
        let local_data = [];
        if (local_data === null || local_data.length === 0) {
            listArchieveLeads(userId).then((lead) => {
                console.log("archievedleads", lead)
                // this.setState({ loader: false })
                var lead1 = lead.sort(function (a, b) {
                    var dateA = new Date(a.store_date); // ignore upper and lowercase
                    var dateB = new Date(b.store_date); // ignore upper and lowercase
                    return dateB.getTime() - dateA.getTime();
                });
                this.store_leads(lead1, 0, false)
                    .then((res) => {
                        console.log(res)
                    })
            }).catch(err => {
                this.setState({ loader: false })
                console.log(err)
            })
        }
        else {

        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            archieve_badge: nextProps.archieve_badge,
            flag_badge: nextProps.flag_badge
        })
    }
    async store_leads(item, i, refresh) {
        let lead_all_list1 = []
        let lead_all_list = []
        const retrievedItem = await AsyncStorage.getItem("user_info");
        const value = JSON.parse(retrievedItem);
        const access_token = value.accessToken
        if (i < item.length) {
            console.log(item[i].leadId)
            console.log("if part")
            fetch(`https://graph.facebook.com/v3.0/${item[i].leadId}?access_token=${access_token}`,
                ['ads_management', 'manage_pages']).then(async (response) => {
                    const res = await response.json();
                    console.log(res)
                    if (res && res.field_data) {
                        this.state.dataList.push(res)
                        i++;
                        this.store_leads(item, i, refresh);
                    }
                    else {
                        if (i === self.count_list) {
                            //  self.showing_page = true;
                        }
                        i++;
                        this.store_leads(item, i, refresh);
                    }
                }).catch(e => {
                    this.setState({ loader: false })
                    console.log(e)
                    i++;
                    this.store_leads(item, i, refresh);
                });
            // this.forceUpdate()
            // return this.state.normal_lead_list
            // this.setState({ normal_lead_list: this.state.dataList })
        }
        else {
            this.setState({ loader: false })

            this.setState({ normal_lead_list: this.state.dataList })
            console.log("else part")
            if (refresh) {
                this.setState({ normal_lead_list: this.state.dataList })
            }
            else {
                this.setState({ loader: false })

                this.setState({ normal_lead_list: this.state.dataList })
                console.log("elseeeee part")


            }
        }


        console.log("this.state.check_lead_list", this.state.check_lead_list)
        console.log("this.state.normal_lead_list", this.state.normal_lead_list)
        console.log("this.state.lead_all_list", this.state.lead_all_list)
    }

    gotoLeadDetails = () => {
        this.props.navigation.navigate('LeadDetails')
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

    _keyExtractor = (item, index) => index + 'data';
    _renderData = ({ item, index }) => {
        let lead = {};
        item.field_data.map((data, i) => {
            lead[data.name] = data.values[0]
            return lead
        })
        return (
            <TouchableOpacity hitSlop={hitSlop} activeOpacity={.8} style={{ flex: 1 }}
                onPress={() => this.props.navigation.navigate('Viewlead', {
                    receivedata: item,
                    leadId: item.id,
                    allLeads: false,
                    flag: false,
                    archive: true,
                    showFlagButton: true
                })}
            >

                <View style={{ flex: 1 }}>

                    <View style={{
                        flex: 1, flexDirection: 'row', borderBottomColor: '#dcdcdc', borderBottomWidth: 1,
                        paddingBottom: 10,
                        marginTop: 5,
                    }}>
                        <View style={{ flex: 0.1 }}>
                            {/* <Button
                                color='orange'
                                buttonStyle={{
                                    backgroundColor: "orange",
                                    borderRadius: 10/2, width: 10, height: 10
                                }}
                                textStyle={{ fontWeight: 'bold' }}
                            /> */}
                        </View>
                        <View style={{ flex: 0.9, justifyContent: 'flex-start' }} >
                            <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 16, alignSelf: 'flex-start' }}
                                numberOfLines={1}>{lead.full_name ? lead.full_name : null}
                            </Text>
                            <Text>{lead.email ? lead.email : null}
                            </Text>
                            <Text numberOfLines={1}>{lead.phone_number ? lead.phone_number : null}
                            </Text>
                        </View>
                        <View style={{ flex: 0.1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                            {/* <Icon name='chevron-right' size={38} color='#d3d3d3' />                       */}
                        </View>
                    </View>
                </View>

            </TouchableOpacity>
        )
    }


    render() {
        let userId = firebase.auth().currentUser.uid;
        let subscribeTypeFcn = checkIsSubscibed(userId).then((res) => {
            this.subscribe_type = res
        })

        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>

                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <Header title="Archived Leads" navigateClick={() => this.props.navigation.navigate("DrawerOpen")} iconame='menu' />
                    {this.state.loader && <View style={{
                        flex: 1,
                        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 0,
                        right: 0, top: 0, bottom: 0, zIndex: 1, backgroundColor: "rgba(0,0,0,0)"
                    }}>
                        <ActivityIndicator size="large" color="#5890ff" /></View>}
                    {/* <View style={{
                        flex: 1,
                        backgroundColor:this.state.normal_lead_list 
                        && this.state.normal_lead_list.length > 0 ? 'transparent' : '#D3D6DB'}}>
                    {
                        this.state.normal_lead_list.length > 0 && !this.state.loader ? */}

                 <View style={{ padding: 10, flex: 1,backgroundColor:this.state.normal_lead_list 
                        && this.state.normal_lead_list.length > 0 ? 'transparent' : '#D3D6DB' }}>
                                {
                                    (this.state.noSearch) ?
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{ color: '#777' }}>There are no leads that match your search.</Text>
                                        </View> :
                                        <FlatList
                                            extraData={this.state.normal_lead_list}
                                            data={this.state.normal_lead_list}
                                            keyExtractor={this._keyExtractor.bind(this)}
                                            renderItem={this._renderData.bind(this)}
                                            scrollEnabled={this.state.normal_lead_list && this.state.normal_lead_list.length ? true : false}
                                            ListEmptyComponent={() => {
                                                return (
                                                    <View style={{ alignItems: 'center', marginTop: height / 4 + 20,}}>
                                                        <Image source={defaultimage} resizeMode="contain" 
                                                       />
                                                        <Text style={{ fontSize: 20, marginTop:30, color: '#BDC1CA', fontWeight:'400',
                                                        fontFamily: 'Roboto-Bold' }}>
                                                            You don't have any leads yet.
                                            </Text>
        
                                                    </View>
                                                )
                                            }}
                                        />
                                 }
                            </View>
                            {/* :
                            (this.state.normal_lead_list.length == 0 && !this.state.loader) ?
                                <View style={{ alignItems: 'center', marginTop: height / 4 + 20, }}>
                                    <Image source={defaultimage} resizeMode="contain"
                                        style={{ width: width / 3, height: width / 3 }} />
                                    <Text style={{
                                        fontSize: 20, color: '#BDC1CA', fontWeight: 'bold',
                                        fontFamily: 'Roboto-Bold'
                                    }}>
                                        You don't have any leads yet.
                       </Text>

                                </View> :
                                null
                    }
                    </View> */}

                 { this.state.normal_lead_list.length > 0 && <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        {/* {
                      (!this.subscribe_type) 
                              ?
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                    <View><Text>Please subscribe to see more leads.</Text></View>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("Subscription")}> <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}>Subscribe</Text></TouchableOpacity>
                                </View> : null
                  } */}


                        <TouchableOpacity hitSlop={hitSlop} activeOpacity={.8} style={{ backgroundColor: '#f8f8f8', height: 50 }} >

                            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ alignSelf: 'center' }}>Updated Just Now</Text>
                                <Text style={{ alignSelf: 'center' }}>{this.state.normal_lead_list.length} Lead(s)</Text>
                            </View>

                        </TouchableOpacity>
                    </View>}
                </View >
            </SafeAreaView>
        );
    }
}

function mapStateToProps(state) {

    return {
        leads: state.Leads.listLead,
        formLead: state.Leads.formLead,
        archieve_badge: state.Leads.archieve_badge,
        flag_badge: state.Leads.flag_badge
    }
}

export default connect(mapStateToProps)(ArchivedLead)

