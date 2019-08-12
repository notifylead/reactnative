import React, { Component } from 'react'
import {
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    ScrollView,
    FlatList,
    Alert,
    Dimensions,
    BackHandler,
    SafeAreaView
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../Common/Header'
import { CheckBox } from 'react-native-elements'
import { styles } from './css/style'
import firebase from 'firebase'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getUserDetails } from '../../Actions/AuthAction'
import { getLeadsList, checkLeadForm, createLeadsForm, createLeads, listLeadForm1, updateFormData, listLeadForm, getActiveLeadForm, removeActiveLead } from '../../Actions/LeadsAction'
const { height, width } = Dimensions.get('window');
import * as _ from 'underscore';
import moment from 'moment';
import { MessageBar as MessageBarAlert, MessageBarManager } from 'react-native-message-bar'


class SelectLeadAddForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: false,
            checked: [],
            SelectedPageForms: [],
            checkedarr: [],
            loader: false,
            activeUser: null,
            leadsLength: 0,
            activeLeads: []
        }

        console.log("props....", props)
    }



    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backPressed);
    }


    backPressed = () => {
        this.props.navigation.navigate('SelectFbPage');
        return true;
    }


    async componentDidMount() {
        debugger
        var userId = firebase.auth().currentUser.uid;
        const { params } = this.props.navigation.state

        this.setState({ loader: true })

        await fetch(`https://graph.facebook.com/v3.0/${params.data.id}/leadgen_forms?access_token=${params.data.access_token}`,
            ['ads_management', 'manage_pages']).then(async (response) => {
                debugger
                const json = await response.json();
                let statusOfLeads = json.data;
                let allLeads = statusOfLeads.filter((value, index) => value.status === "ACTIVE");
                debugger
                console.log(json)
                this.setState({
                    SelectedPageForms: allLeads
                }, () => {
                    if (this.state.SelectedPageForms && this.state.SelectedPageForms.length > 0) {
                        debugger
                        let intialCheck = this.state.SelectedPageForms.map(x => false);
                        this.setState({ checked: intialCheck })
                    }
                })
                console.log(this.state.SelectedPageForms)
                var subscribe_data = {
                    "access_token": params.data.access_token
                }; console.log(params.data.access_token)
                await fetch(`https://graph.facebook.com/v3.0/${params.data.id}/subscribed_apps?access_token=${params.data.access_token}`, {
                    method: 'POST',
                    headers: {
                        "Authorization": params.data.access_token
                    },
                    body: JSON.stringify(subscribe_data)
                },
                ).then(async data => {
                    this.setState({ loader: false })
                    console.log("data sentttt", await data.json());
                }).catch(err => {
                    this.setState({ loader: false })
                    console.log("err", err.json().message);
                })
            }).catch((err) => {
                this.setState({ loader: false })
                console.log(err)
            })
        MessageBarManager.registerMessageBar(this.refs.alert);

        this.getActiveLeadForm(userId, params.data.id)
    }

    //get selected page lead usind Uid pand Page Id of Active Page
    getActiveLeadForm(userId, pageId) {

        let arr = [];

        getActiveLeadForm(userId, pageId).then(activeLeads => {

            let intialCheck = this.state.SelectedPageForms.map(x => {

                let activeLead = activeLeads.filter(lead => lead.formId == x.id)

                if (activeLead.length) {

                    arr.push(x)

                    return true
                }
                else {
                    return false
                }

            });
            this.setState({ checked: intialCheck, checkedarr: arr, activeLeads })


        })
    }
    //Choose lead
    handleChange = (index, item) => {
        debugger
        var userId = firebase.auth().currentUser.uid;
        getLeadsList(userId).then((leadsCount) => {

            console.log(leadsCount, 'leadsCountleadsCount');
        }).catch((error) => {
            console.log('error in value', error);
        })
        let checked = [...this.state.checked];
        checked[index] = !checked[index];

        if (checked[index]) {

            this.setState({
                checked, value: checked[index],
                checkedarr: [...this.state.checkedarr, item]
            }, () => console.log(this.state.checkedarr))

        } else {

            const exitIndex = this.state.checkedarr.indexOf(item);
            this.state.checkedarr.splice(exitIndex, 1);

            let selectedLead = this.state.activeLeads.filter(x => x.formId == item.id)

            if (selectedLead.length) {
                removeActiveLead(selectedLead[0].id)
            }

            this.setState({
                checked, value: checked[index],
                checkedarr: this.state.checkedarr
            }, () => console.log(this.state.checkedarr, "äsgjkagskjdgaskd"))
        }

        if (this.state.activeUser) {

            // alert(this.state.activeUser.isSubscribe)

            if (!this.state.activeUser.isSubscribe) {

                //check if un-subscribe user has lead else if select more then one lead
                if (this.state.leadsLength >= 1) {

                    this.showAlert()
                }
                else {
                    if (this.state.checkedarr.length > 1) {

                        this.showAlert()
                    }
                }
            }
        } else {

            getUserDetails(userId).then((user) => {
                //check user is Subscribed then add multepel forms
                if (!user.isSubscribe) {
                    getLeadsList(userId).then((leadsLength) => {

                        this.setState({ activeUser: user, leadsLength })

                        //check if un-subscribe user has lead else if select more then one lead
                        if (leadsLength >= 1) {

                            this.showAlert()
                        }
                        else {
                            if (this.state.checkedarr.length > 1) {

                                this.showAlert()
                            }
                        }
                    }).catch((error) => { })
                }
            }).catch((error) => {
                console.log('error', error);
            });
        }
    }

    //showAlter
    showAlert() {

        Alert.alert(
            'Subscribe',
            'Subscribe to have full access to this feature',
            [
                {
                    text: 'Cancel', onPress: () => {
                        let intialCheck = this.state.checkedarr.map(x => false);
                        this.setState({ checked: intialCheck, checkedarr: [] })
                    }, style: 'cancel'
                },
                { text: 'Subscribe', onPress: () => this.props.navigation.navigate('Subscription') },
            ],
            { cancelable: false }
        )
    }

    //Create lead
    async createLeadList() {
        debugger

        // if((this.state.activeUser.isSubscribe || this.state.leadsLength <= 1)){

        this.setState({
            loader: true
        }, () => {
            let userId = firebase.auth().currentUser.uid;
            const { params } = this.props.navigation.state
            if (this.state.checkedarr.length > 0) {
                let total_length = 0;
                _.each(this.state.checkedarr, (lead) => {
                    console.log("lead", lead)
                    total_length = total_length + 1;

                    let data = lead;
                    let form_data = {
                        'facebook_page': params.data.name,
                        'leads_ads_form': lead.name,
                        'formId': lead.id,
                        'pageId': params.data.id,
                        'createdAt': moment(new Date()).format('h:mm a'),
                        'uid': userId,
                        'page_picture': "https://graph.facebook.com/v3.0/" + params.data.id + "/picture"
                    };
                    //check that the form is alredy added or not
                    checkLeadForm(lead.id).then((res) => {
                        console.log(res, "jkjjjkjkj")
                        if (res === 'yes') {
                            this.setState({
                                loader: false,
                            })
                            let intialCheck = this.state.checkedarr.map(x => false);
                            this.setState({ checked: intialCheck, checkedarr: [] })
                            MessageBarManager.showAlert({
                                title: '',
                                message: `${lead.name} is already created.`,
                                alertType: 'error',
                                position: 'bottom',
                                animationType: 'SlideFromBottom',
                            });
                        }
                        else {
                            debugger
                            //create lead form
                            createLeadsForm(form_data).then((res) => {
                                let formData = form_data;
                                let formDataid = res;
                                console.log(res, "fir=rom id key")

                                //alert(lead.name + " is added successfully")

                                console.log('createLeadsForm res', res)
                                if (data && data.name !== 'none') {
                                    console.log(data, "datatatatattata")
                                    fetch(`https://graph.facebook.com/v3.0/${data.id}/leads?access_token=${params.data.access_token}`,
                                        ['ads_management', 'manage_pages']).then(async (response) => {
                                            const json = await response.json();
                                            let leadList = json.data
                                            console.log(leadList)
                                            if (leadList.length) {
                                                _.each(leadList, (lead2) => {
                                                    let LocalValue = lead2
                                                    let lead_data = {
                                                        'createdAt': moment(new Date()).format('h:mm a'),
                                                        'uid': userId,
                                                        'formId': data.id,
                                                        'id': formDataid,
                                                        'leadId': LocalValue.id,
                                                        'store_date': new Date()
                                                    };
                                                    console.log(lead_data, "lead_datalead_data")
                                                    createLeads(lead_data).then((res) => {

                                                        listLeadForm1(data.id).then((res1) => {
                                                            let badge;
                                                            let localvalue1 = res1;
                                                            badge = localvalue1.badge_count + 1;
                                                            let badge_count = {
                                                                badge_count: badge
                                                            }

                                                            updateFormData(localvalue1.key, badge_count).then((res) => {

                                                                this.setState({
                                                                    loader: false
                                                                })


                                                                if (total_length == this.state.checkedarr.length) {
                                                                    // this.props.listLeadForm(userId).then((res) => {
                                                                    //     console.log(res)
                                                                    // }).catch(err => {
                                                                    //     console.log("err", err)
                                                                    // })
                                                                    if (this.state.checkedarr.length == 1) {
                                                                        console.log('navigate-AllLeads')
                                                                        debugger
                                                                        this.props.navigation.navigate('AllLeads', {

                                                                            title: lead.name, formData: { formId: lead.id }, type: 'single'
                                                                        })
                                                                    }
                                                                    else if (this.state.checkedarr.length > 1) {
                                                                        debugger
                                                                        console.log('navigate-AllLeads')
                                                                        this.props.navigation.navigate('AllLeads', { type: 'multiple' })
                                                                    }

                                                                }
                                                            })
                                                        })
                                                    })
                                                })
                                            } else {
                                                debugger
                                                console.log('empty response from facebook native');
                                                this.setState({
                                                    loader: false
                                                })
                                                if (total_length == this.state.checkedarr.length) {
                                                    if (this.state.checkedarr.length == 1) {
                                                        debugger
                                                        this.props.navigation.navigate('AllLeads', {

                                                            title: lead.name, formData: { formId: lead.id }, type: 'single'
                                                        })
                                                    }
                                                    else if (this.state.checkedarr.length > 1) {
                                                        debugger
                                                        this.props.navigation.navigate('AllLeads', { type: 'multiple' })
                                                    }
                                                }
                                            }
                                        }).catch((err) => {
                                            console.log("error", err)
                                        })
                                }
                                else {
                                    console.log("error")
                                }
                            }, function (err) {
                                console.log(err);
                            })
                        }
                    }).catch((err) => {
                        console.log(err)
                    })
                })
            }
            else {
                this.setState({
                    loader: false
                })
                alert("choose any lead")
            }
        })
        // }else{
        //     
        // }

    }

    componentWillUnmount() {
        MessageBarManager.unregisterMessageBar();
        BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
    }

    _keyExtractor = (item, index) => index + 'leadAddForm';
    _renderLeadAddFormView = ({ item, index }) => {
        let { checked } = this.state;
        console.log(checked[index])
        return (
            <View style={styles.leadAddforms}>
                <CheckBox
                    title={item.name}
                    center
                    containerStyle={styles.checkBox}
                    onPress={() => this.handleChange(index, item)}
                    checkedColor='#5890FF'
                    checked={checked[index]} />
            </View>
        )
    }
    render() {
        console.log(this.state.activeUser, 'this.state.activeUser')
        let { checked } = this.state
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
                <View style={styles.container}>
                    <Header title="Select Leads Ads Form" navigateClick={() => this.props.navigation.navigate("DrawerOpen")}
                        cancel={() => this.props.navigation.navigate('SelectFbPage')} text='CANCEL' iconame='menu' />
                    <ScrollView>
                        <View style={styles.FlatListView}>
                            <FlatList
                                extraData={this.state.checked}
                                data={this.state.SelectedPageForms}
                                keyExtractor={this._keyExtractor.bind(this)}
                                renderItem={this._renderLeadAddFormView.bind(this)}
                            />
                        </View>
                    </ScrollView>
                    <View style={styles.okButton}>
                        <TouchableOpacity onPress={() => this.createLeadList()} activeOpacity={0.7}>
                            <View style={styles.okButtonView}>
                                <Text style={styles.okText}>OK</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* {this.state.loader && <View style={{ flex: 1, left: width / 2, right: width / 2, top: height / 2, bottom: height / 2, position: 'absolute' }}>
                        <ActivityIndicator color='#5890FF' size='large' />
                    </View>} */}

                    {this.state.loader && <View
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
                            backgroundColor: "rgba(0,0,0,0.1)"
                        }}>
                        <ActivityIndicator color='#5890FF' size='large' />
                    </View>
                    }
                    <MessageBarAlert ref="alert" messageStyle={{ fontSize: 14, }} duration={2000}
                        viewTopOffset={-20} viewLeftOffset={20} viewRightOffset={20} viewBottomOffset={20}
                        stylesheetError={{ backgroundColor: '#C0392B', messageColor: 'white' }}
                    />
                </View>
            </SafeAreaView>
        );
    }
}
// export default SelectLeadAddForm

//mapping reducer states to component
function mapStateToProps(state) {
    return {
        leads: state.Leads,
    }
}
//mapping dispatcheable actions to component
function mapDispathToProps(dispatch) {
    return bindActionCreators({ listLeadForm }, dispatch);
}
export default connect(mapStateToProps, mapDispathToProps)(SelectLeadAddForm)
