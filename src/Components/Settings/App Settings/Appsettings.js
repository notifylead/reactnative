import React, { Component } from 'react'

import {
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    ActivityIndicator, Dimensions, Linking, FlatList, Switch, ScrollView,
    SafeAreaView,
    AsyncStorage

} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Header from '../../../Common/Header'
import { Button } from 'react-native-elements'
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import sytles, { styles } from '../../../Components/Settings/App Settings/styles/index';
import ToggleSwitch from 'toggle-switch-react-native'
import firebase from 'firebase'
import { getUserDetails, updateUserData } from '../../../Actions/AuthAction'
import { updateFormData2 } from '../../../Actions/LeadsAction'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import moment from 'moment';

const { width, height } = Dimensions.get('window')

class Appsettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            time: 'OFF',
            FbPageList: [],
            switchvalue: true,
            switchvalue1: true,
            switchvalue2: true,
            dataSource: [],
            do_not_disturb: 0,
            value: '',
            text: '',
            showDisturbTime: false,
            selectedIndex: '',
            selected: 0,
            checkvalue: '',
            enable: false
        }
    }
    async onSelect(index, value) {

        this.setState({
            text: `${value}`,
            selectedIndex: index,
            selected: index
        }, () => {
            console.log("this.state.text", this.state.text)

        })
    }



    onToggle(isOn, item) {
        
        console.log(item)
        this.setState({ enable: isOn }, () => {
            // console.log('Changed to ' + this.state.enable)
            if (isOn == true) {
                
                console.log('yes')
                let value = {
                    key: item.key,
                    push_notifications: this.state.enable
                }
                this.updateNotifications(value);
            }
            else {
                
                console.log('No')
                let value = {
                    key: item.key,
                    push_notifications: this.state.enable
                }
                this.updateNotifications(value)
            }
        })





    }


    user_details() {
        let userId = firebase.auth().currentUser.uid;
        getUserDetails(userId).then((data) => {
            let value = (data.do_not_disturb) > 20 ?
                (data.do_not_disturb) / 60
                : (data.do_not_disturb == -1) ? 'ON' : 'OFF'
            this.setState({ time: value, selected: data.selectedIndex ? data.selectedIndex : 0 })
        })
    }


    componentWillMount() {
        this.user_details()
    }

    listForm = async () => {
        
        let userId = firebase.auth().currentUser.uid;
        // this.setState({ time: (this.state.text) ? this.state.text : this.state.time })
        let showDisturbTime = 'no';
        return getUserDetails(userId).then(async (data) => {
            
            console.log("getUserDetails=============", data)
            let user_details = data;
            this.setState({ do_not_disturb: user_details.do_not_disturb });
            let user_name = user_details.firstname + ' ' + user_details.lastname;
            if (user_details.hasOwnProperty('picture')) {
                let user_image = user_details.picture;
            } else {
                let user_image = "";
            }
            this.listLeadForm(userId).then(async (result) => {
                await this.setState({ dataSource: result })
            }).catch((err) => {
                console.log("errr message :", err)
            })
            //check do not disturb status
            let startDate = moment(new Date(user_details.from_time), 'YYYY-M-DD HH:mm:ss');
            var endDate = moment(new Date(), 'YYYY-M-DD HH:mm:ss');
            var secondsDiff = endDate.diff(startDate, 'seconds');

            if (user_details.do_not_disturb != - 1) {
                if (secondsDiff > user_details.interval) {
                    this.setState({ do_not_disturb: 0 });
                    this.onChangeEvent();
                }
            }
        }).catch((error) => {
            console.log('error', error);
        });
    }
    componentDidMount() {
        this.listForm()
    }

    //Get the upadte data after app loads
    componentWillReceiveProps(nextProps) {
        console.log("nextProps", nextProps)
        let value = (nextProps.doNotText) > 0 ?
            (nextProps.doNotText) / 60
            : (nextProps.doNotText == -1) ? 'ON' : 'OFF'
        this.setState({
            time: value,
            selected: nextProps.selected
        }, () => {
            console.log(this.state, "will recievie")

        })
    }


    //Update UserData

    onChangeEvent() {

        let userId = firebase.auth().currentUser.uid;
        console.log("this.state.do_not_disturb", this.state.do_not_disturb);
        let data = {
            do_not_disturb: this.state.do_not_disturb,
            interval: this.state.do_not_disturb * 60,
            from_time: (new Date()).getTime(),
            selectedIndex: this.state.selected
        };
        if (this.state.do_not_disturb) {
            updateUserData(userId, data).then((res) => {
                this.props.dispatch({
                    type: 'UPDATE_DO_NOT_DISTURB',
                    text: this.state.do_not_disturb ? this.state.do_not_disturb : 0,
                    selected: this.state.selected,
                    //checkvalue: this.state.checkvalue
                })
                this.setState({ text: '' })
                console.log(res)
            }).catch((err) => {
                console.log(err)
            })
        }

    }

    //Update Notifications 
    updateNotifications(result) {
        
        let userId = firebase.auth().currentUser.uid;
        console.log('update Notification', result);
        var data = {
            push_notifications: result.push_notifications
        };
        updateFormData2(result.key, data).then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
    }

    addDoNotDisturb = () => {

        if (this.state.text) {
            this.listForm().then(() => {
                this.setState({
                    showDisturbTime: false,
                    time: this.state.text,
                    do_not_disturb: this.state.text,
                    // selected: value,
                }, () => {
                    this.onChangeEvent()
                })
            })

        }
        else {
            this.listForm().then(() => {
                this.setState({
                    showDisturbTime: false,
                    // selected: value,
                }, () => {
                    this.user_details()
                })
            })

        }
    }

    listLeadForm = (id) => {
        return new Promise((resolve, reject) => {
            firebase.database().ref().child('/leadForm').orderByChild('uid').equalTo(id).on('value', (snapshot) => {
                let leadListArr = []
                snapshot.forEach(element => {
                    let item = element.val();
                    item['key'] = element.key;
                    leadListArr.push(item)
                    console.log(leadListArr)
                    // console.log(this.state.dataSource)
                });
                if (leadListArr && leadListArr.length > 0) {
                    resolve(leadListArr);
                }
                else {
                    resolve(leadListArr);
                }

            })
        });
    }

    _keyExtractor = (item, index) => index + 'data';
    _renderData = ({ item, index }) => {
        return (
            <TouchableOpacity activeOpacity={.8}>

                <View style={{ flex: 1, paddingTop: 10, paddingBottom: 10 }}>
                    <View style={{ flexDirection: 'row', paddingBottom: 15, justifyContent: 'space-between', borderBottomColor: '#dcdcdc', borderBottomWidth: 1 }}>

                        <View style={{ flex: 0.7 }}>
                            <Text style={{ fontSize: 16, paddingLeft: 6, color: '#000000' }} numberOfLines={1}>{item.leads_ads_form}</Text>
                        </View>

                        <View style={{ flex: 0.2 }}>
                            <ToggleSwitch
                                onToggle={(isOn) => this.onToggle(isOn, item)} onColor='#5890ff'
                                offColor='#d3d3d3'
                                size='small'
                                isOn={item.push_notifications}
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    render() {
        return (
            <SafeAreaView style={{ flex: 1, }}>
                <View style={styles.container}>
                    <Header title={this.state.showDisturbTime ? 'Do not Disturb' : 'App Settings'}
                        navigateClick={() => this.props.navigation.navigate("DrawerOpen")}
                        iconame='menu' />
                    {
                        (!this.state.showDisturbTime) ?
                            <View>
                                <View style={[styles.textView1, { marginTop: 10, marginLeft: 10 }]} >
                                    <Text style={styles.textProps}>Do Not Disturb</Text>
                                    <Button
                                        title={
                                            (this.state.time != 'OFF' && this.state.time != 'ON') ?
                                                (this.state.time < 1 && this.state.time != 0) ? this.state.time * 60 + 'Min' :(this.state.time == 1 )?this.state.time + 'Hour': this.state.time + 'Hours'
                                                :
                                                this.state.time
                                        }
                                        color='white'
                                        onPress={() => this.setState({ showDisturbTime: true })}

                                        buttonStyle={{
                                            backgroundColor: "#5890ff",
                                            height: 40,
                                            width: 95,
                                            marginTop: 2
                                        }}
                                        textStyle={{ fontWeight: 'bold' }}
                                    />
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
                            :
                            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                                <ScrollView>
                                    <RadioGroup onSelect={(index, value) => this.onSelect(index, value)} style={{ flexDirection: 'column', paddingLeft: 20 }}
                                        selectedIndex={this.state.selected}>
                                        <RadioButton index={0} value={0}>
                                            <Text>OFF</Text>
                                        </RadioButton>
                                        <RadioButton index={1} value={20}>
                                            <Text>20 Minutes</Text>
                                        </RadioButton>
                                        <RadioButton index={2} value={60}>
                                            <Text>1 Hour</Text>
                                        </RadioButton>
                                        <RadioButton index={3} value={120}>
                                            <Text>2 Hours</Text>
                                        </RadioButton>
                                        <RadioButton index={4} value={240}>
                                            <Text>4 Hours</Text>
                                        </RadioButton>
                                        <RadioButton index={5} value={480}>
                                            <Text>8 Hours</Text>
                                        </RadioButton>
                                        <RadioButton index={6} value={1440}>
                                            <Text>24 Hours</Text>
                                        </RadioButton>
                                        <RadioButton index={7} value={-1}>
                                            <Text>ON(untill turned off manually)</Text>
                                        </RadioButton>
                                    </RadioGroup>
                                </ScrollView>
                                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, margin: 10 }}>
                                    <Button
                                        title='OK'
                                        color='white'
                                        onPress={this.addDoNotDisturb}
                                        buttonStyle={{
                                            backgroundColor: "#5890ff",
                                            borderRadius: 5
                                        }}
                                        textStyle={{ fontWeight: 'bold' }}
                                    />
                                </View>
                            </View>
                    }
                </View>
            </SafeAreaView>
        );
    }
}



function mapStateToProps(state) {

    return {
        doNotText: state.Leads.doNotText,
        selected: state.Leads.selected
    }
}
//mapping dispatcheable actions to component
function mapDispathToProps(dispatch) {
    return bindActionCreators({ dispatch }, dispatch);
}
export default connect(mapStateToProps, mapDispathToProps)(Appsettings)
