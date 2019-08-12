import React, { Component } from 'react'

import {
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    ActivityIndicator, Dimensions, Linking, FlatList, ScrollView, WebView, BackHandler,
    AsyncStorage, SafeAreaView,
    TouchableHighlight

} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button, Header } from 'react-native-elements';
const { width, height } = Dimensions.get('window')

let msg = require('../../../Assets/Leaddetails/_Msg.png')
let call = require('../../../Assets/Leaddetails/_call.png')
let mail = require('../../../Assets/Leaddetails/_mail.png')
let map = require('../../../Assets/Leaddetails/_map.png')
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    getLeadData, getleadgenforms, listLeadAll, getLeadDatail,
    addFlagLead, flagLeadUpdate, removeFlagLead, getFlagLead, updateUserData, listLeadForm, getBadgeCounts
} from '../../../Actions/LeadsAction';
import Communications from 'react-native-communications';
import openMap from 'react-native-open-maps';
const hitSlop = { top: 25, bottom: 25, left: 25, right: 25 };


class MyCustomRightComponent extends Component {

    static navigationOptions = {
        header: null,
        drawerLockMode: 'locked-closed'
    }

    render() {
        return (
            <View>
                <Text style={{ color: '#5890ff', fontWeight: 'bold' }} onPress={() => alert('EDIT')}>
                    EDIT
        </Text>
            </View>
        )
    }
}
const data_list = []

// const map_value = ""
class Viewlead extends Component {

    constructor(props) {
        super(props)
        console.log(this.props);
        this.state = {
            full_name: '',
            email: '',
            phone_number: '',
            street_address: '',
            leadData: {},
            isFlag: false,
            flag_badge: 0,
            archieve_badge: 0,
            dataSource: [],
            dataTop: [],
            checkMap: false
        }
    }
    map(loaction) {
        openMap({ name: loaction });
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backPressed);
        const { params } = this.props.navigation.state;
        let leadId = params && params.leadId ? params.leadId : null
        let flagPage = params && params.flag ? params.flag : null
        console.log(params,"params111")
        if (params && params.receivedata) {
            const json = params.receivedata;
        
            data_list = json.field_data;
            const lead_detail = []
            this.setState({ dataSource: data_list })
            let map_value = ''
            for (var i = 0; i < json.field_data.length; i++) {
                lead_detail['street_address'] = json.field_data[i].name === 'street_address' ? json.field_data[i].values[0] : lead_detail.street_address;
                lead_detail['email'] = json.field_data[i].name === 'email' ? json.field_data[i].values[0] : lead_detail.email;
                lead_detail['full_name'] = json.field_data[i].name === 'full_name' ? json.field_data[i].values[0] : lead_detail.full_name;
                lead_detail['phone_number'] = json.field_data[i].name === 'phone_number' ? json.field_data[i].values[0] : lead_detail.phone_number;
                lead_detail['city'] = json.field_data[i].name === 'city' ? json.field_data[i].values[0] : lead_detail.city;
                lead_detail['state'] = json.field_data[i].name === 'state' ? json.field_data[i].values[0] : lead_detail.state;
                lead_detail['country'] = json.field_data[i].name === 'country' ? json.field_data[i].values[0] : lead_detail.country;
                lead_detail['gender'] = json.field_data[i].name === 'gender' ? json.field_data[i].values[0] : lead_detail.gender;
                lead_detail['date_of_birth'] = json.field_data[i].name === 'date_of_birth' ? json.field_data[i].values[0] : lead_detail.date_of_birth;
                lead_detail['job_title'] = json.field_data[i].name === 'job_title' ? json.field_data[i].values[0] : lead_detail.job_title;
            }
            map_value += lead_detail.street_address ? lead_detail.street_address : ""
            map_value += lead_detail.city ? lead_detail.city : ""
            map_value += lead_detail.state ? lead_detail.state : ""
            map_value += lead_detail.country ? lead_detail.country : ""
            lead_detail['map'] = map_value ? map_value : ""
            //if from lead and lead id is exits 
            if (leadId && flagPage) {
                console.log(params.receivedata,"params.receivedata.leadData",json)
                this.setState({
                    leadData: json,
                    dataTop: lead_detail,
                    checkMap: true,
                    isFlag:json.leadData && json.leadData.leadType && json.leadData.leadType == 'flag' ? true : false
                },() =>{
                    console.log(this.state.isFlag,"flag")
                })
            } else {

                this.setState({
                    leadData: json,
                    dataTop: lead_detail,
                    checkMap: true,
                    isFlag: json && json.leadType && json.leadType == 'flag' ? true : false
                })
            }


        }
        if (leadId && flagPage){
            this.getBadgeCountsUser()
        }
    }

    //Get Badge e Count
    getBadgeCountsUser() {
        getBadgeCounts().then((data) => {
            console.log(data, "datadatadatauuuu")
            this.setState({
                flag_badge: data.flag_leads_badge ? data.flag_leads_badge : 0,
                archieve_badge: data.archieve_leads_badge ? data.archieve_leads_badge : 0
            }, () => {
                console.log(this.state, "get Counr")
            })
            this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: data.flag_leads_badge ? data.flag_leads_badge : 0 })
            this.props.dispatch({ type: 'UPDATE_ARCHIVE_BADGE', archieve_badge: data.archieve_leads_badge ? data.archieve_leads_badge : 0 })
        }).catch((err) => {
            console.log(err)
        })
    }


    componentWillReceiveProps(nextProps) {
        this.setState({
            archieve_badge: nextProps.archieve_badge,
            flag_badge: nextProps.flag_badge
        }, () => {
            console.log(this.state, "will recievie")

        })

    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
    }
    backPressed = () => {
        this.props.navigation.navigate('AllLeads');
        return true;
    }
    gotoAllLead = () => {
        this.props.navigation.navigate('AllLead')
    }
    _keyExtractor = (item, index) => index + 'data';

    handleFlagUnflag = () => {
        
        console.log(this.state.leadData, "this.state.leadData.leadType", this.state.flag_badge)
        this.setState({
            loader: true
        }, () => {
            if (this.state.leadData && this.state.leadData.leadData  && this.state.leadData.leadData.leadType != 'flag') {
                addFlagLead(this.state.leadData, this.state.leadData.uid).then((res) => {
                    if (res) {
                        let flagdata = {
                            'leadType': 'flag',
                            'flag_id': res
                        };
                        flagLeadUpdate(this.state.leadData.dataId, flagdata).then((res) => {
                            let badge_data = {
                                flag_leads_badge: this.state.flag_badge + 1
                            };
                            updateUserData(badge_data, this.state.leadData.uid).then((userUpdate) => {
                                this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge + 1 })
                                getLeadDatail(this.state.leadData.leadId).then((res) => {
                                         let json = this.state.leadData
                                        json.leadData = res && res.length ? res[0] : {},
                                    this.setState({
                                        leadData:json,
                                        isFlag: res && res.length && res[0].leadType && res[0].leadType == 'flag' ? true : null
                                    }, () => {
                                        console.log(this.state.leadData, "update leadData============================")
                                    })
                                }).catch((err) => {
                                    console.log("werr", err)
                                })
                            }).catch((err) => {
                                console.log("Update badge error")
                            })
                            this.setState({ loader: false, isFlag: !this.state.isFlag, })
                            // alert('Leads Flag Updated successfully')
                        })
                    }
                }).catch((err) => {
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
                                console.log(flagRes, "flagResflagResflagResflagRes")
                                removeFlagLead(flagRes[0].dataId).then((remFlag) => {
                                    let badge_data = {
                                        flag_leads_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0
                                    };
                                    updateUserData(badge_data, this.state.leadData.uid).then((userUpdate) => {
                                        this.props.dispatch({ type: 'UPDATE_FLAG_BADGE', flag_badge: this.state.flag_badge > 0 ? this.state.flag_badge - 1 : 0 })
                                        getLeadDatail(this.state.leadData.leadId).then((res) => {
                                           let json = this.state.leadData
                                           json.leadData = res && res.length ? res[0] : {},
                                            this.setState({
                                                leadData: json,
                                                isFlag: res && res.length && res[0].leadType && res[0].leadType == 'unflag' ? false : null
                                            }, () => {
                                                console.log(this.state.leadData, "update leadData============================")
                                            })
                                        }).catch((err) => {
                                            console.log("werr", err)

                                        })
                                    }).catch((err) => {
                                        console.log("Update badge error")
                                    })
                                    // alert("Remove Flag")
                                    this.setState({ loader: false, isFlag: !this.state.isFlag, })

                                }).catch((err) => {
                                    // alert("Error in Removed")
                                })
                            }
                        }).catch((err) => {

                        })
                    }
                    // alert('Leads Flag Updated successfully')
                })
            }
        })

    }

    _renderData = ({ item, index }) => {
        console.log("item", item)
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'column', borderBottomWidth: 1, borderColor: '#d3d3d3', paddingTop: 10, paddingBottom: 10 }}>
                    <Text>{item.name}</Text>
                    <Text style={{ color: '#5890ff', fontSize: 16 }}>{item.values}</Text>
                </View>
            </View>
        )
    }

    renderSpinner() {
        return (
            <View style={{ position: 'absolute', top: height / 2, left: width / 2 }}>
                <ActivityIndicator size={'large'} color='#5890FF' />
            </View>
        )
    }
    goBack() {
        const { navigation } = this.props;
        navigation.goBack();
    }
    render() {
        console.log(this.state.dataTop, "this.state.dataTopthis.state.dataTop")
        let { params } = this.props.navigation.state;
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    {this.state.loader && this.renderSpinner()}
                    <View style={{ height: height / 3 + 20, backgroundColor: '#f8f8f8' }}>
                        <View style={{
                            flex: 1,
                            // backgroundColor: '#ccc',
                            flexDirection: 'row',
                            justifyContent: params && (params.archive || params.flag) ?
                                'space-between' : 'flex-start',
                            //paddingTop: 25, 
                            //marginHorizontal: 20
                        }}>
                            {/* <TouchableHighlight  hitSlop={hitSlop} onPress={() => this.goBack()}> */}

                            <TouchableOpacity
                                hitSlop={hitSlop}
                                onPress={() => this.props.navigation.navigate((params.flag) ? "FlagLead" : params.allLeads ? 'AllLeads' : "ArchivedLead")
                                    //onPress={() => alert('I am clicked')
                                }>
                                <View style={{
                                    flex: 1, flexDirection: 'row',
                                    // width: 100, height: 200,
                                    paddingLeft: 15,
                                    // backgroundColor:'red',
                                    alignItems: 'center', justifyContent: 'center',
                                }}  >

                                    <Icon name='chevron-left' size={18} color='#5890ff' />
                                    {
                                        params && params.flag && <Text style={{ color: '#5890ff', marginLeft: 5 }}> View Leads</Text>

                                    }
                                    {/* {
                                        params && params.archive && <Text style={{ color: '#5890ff',marginLeft:5 }}> View Leads</Text>

                                    } */}
                                </View>
                            </TouchableOpacity>

                            {
                                params && params.allLeads ? <View style={{
                                    // backgroundColor:'red',
                                    flex: 0.8, alignItems: 'center', justifyContent: 'center',
                                    marginLeft: 25,

                                }}>
                                    <Text style={{ color: 'black', fontSize: 18, alignSelf: 'center', fontFamily: 'Roboto-Bold' }}>Lead Detail</Text> 
                                    </View>:null
                            }

                            {params && params.flag ? <TouchableOpacity hitSlop={hitSlop} activeOpacity={0.7} onPress={() => this.handleFlagUnflag()}>
                                <View style={{
                                    flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20,
                                    paddingRight: 15,
                                }}>
                                    <Text style={{ color: '#5890ff', fontWeight: 'bold' }}>
                                        {this.state.isFlag ? 'UNFLAG' : 'FLAG'}{this.state.isFlag}
                                    </Text>
                                </View>

                            </TouchableOpacity>: null
                            }
                            {
                                params && params.archive ? <View style={{
                                    flex: 0.8, alignItems: 'center', justifyContent: 'center',
                                    // marginLeft: 25,
                                    // backgroundColor:'red',
                                    // backgroundColor: 'red',
                                    // marginLeft: 45
                                    // paddingHorizontal:10 

                                }}>
                                    <Text style={{ color: 'black', fontSize: 18, alignSelf: 'center', fontFamily: 'Roboto-Bold' }}>Lead Detail</Text>
                                     </View>:null
                            }
                            {params && params.archive && <TouchableOpacity activeOpacity={0.7} hitSlop={hitSlop}>

                                <View style={{
                                    flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 20,
                                    paddingRight: 15,
                                }}>
                                    <Text style={{ color: '#5890ff', fontWeight: 'bold', }}>
                                        {' '}
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            }

                        </View>


                        <View style={{ marginTop: 10 }}>
                            {this.state.dataTop.full_name ?
                                <Text style={{ alignSelf: 'center', color: 'black', fontSize: 16, fontFamily: 'Roboto-Bold' }}>
                                    {this.state.dataTop.full_name}
                                </Text>
                                : null}
                            {this.state.dataTop.city ?
                                <Text style={{ alignSelf: 'center' }}>
                                    {this.state.dataTop.city}
                                </Text>
                                : null}
                            {!this.state.dataTop.city && this.state.dataTop.email ?
                                <Text style={{ alignSelf: 'center' }}>
                                    {this.state.dataTop.email}
                                </Text>
                                : null}
                            {!this.state.dataTop.city && !this.state.dataTop.email && this.state.dataTop.phone_number ?
                                <Text style={{ alignSelf: 'center' }}>
                                    {this.state.dataTop.phone_number}
                                </Text>
                                : null}
                        </View>


                        {/* all images */}

                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, marginLeft: 10, marginRight: 10 }}>
                            {this.state.dataTop.phone_number ?
                                <TouchableOpacity hitSlop={hitSlop} onPress={() => Communications.text(this.state.dataTop.phone_number)}>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 }}>
                                        <Image source={msg} style={{ height: 35, width: 35 }} />
                                        <Text style={{ color: '#5890ff', alignSelf: 'center', fontSize: 12 }}>message</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                null}
                            {this.state.dataTop.phone_number ?
                                <TouchableOpacity hitSlop={hitSlop} onPress={() => Communications.phonecall(this.state.dataTop.phone_number, true)}>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 }}>
                                        <Image source={call} style={{ height: 35, width: 35 }} />
                                        <Text style={{ color: '#5890ff', alignSelf: 'center', fontSize: 12 }}>call</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                null
                            }
                            {this.state.dataTop.email ?
                                <TouchableOpacity hitSlop={hitSlop} onPress={() => Communications.email([this.state.dataTop.email], null, null, 'My Subject', 'My body text')}>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 }}>
                                        <Image source={mail} style={{ height: 35, width: 35 }} />
                                        <Text style={{ color: '#5890ff', alignSelf: 'center', fontSize: 12 }}>email</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                null
                            }
                            {this.state.dataTop.map && this.state.checkMap ?
                                <TouchableOpacity hitSlop={hitSlop} onPress={() => this.map(this.state.dataTop.map)}>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 }}>
                                        <Image source={map} style={{ height: 35, width: 35 }} />
                                        <Text style={{ color: '#5890ff', alignSelf: 'center', fontSize: 12 }}>map</Text>
                                    </View>
                                </TouchableOpacity>
                                :
                                null}

                        </View>
                        {/* all images */}
                    </View>
                    <ScrollView>
                        <View style={{ padding: 10 }}>
                            <FlatList
                                data={this.state.dataSource}
                                keyExtractor={this._keyExtractor.bind(this)}
                                renderItem={this._renderData.bind(this)}
                            />
                        </View>
                    </ScrollView>

                </View>
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
//mapping dispatcheable actions to component
function mapDispathToProps(dispatch) {
    return bindActionCreators({ listLeadForm, dispatch }, dispatch);
}
export default connect(mapStateToProps, mapDispathToProps)(Viewlead)


