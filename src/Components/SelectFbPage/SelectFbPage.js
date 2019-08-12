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
    AsyncStorage,
    Dimensions,
    ToastAndroid,
    SafeAreaView
} from 'react-native'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../Common/Header'
import firebase from 'firebase'
import { FORMLEAD_ACTION_TYPES } from '../../Actions/ActionTypes'

import { FbPageList } from '../../Config/Data'
import { styles } from './css/style'
const { width, height } = Dimensions.get('window')
import { listLeadAll, getLeadData, listLeadForm } from '../../Actions/LeadsAction';
import { MessageBar as MessageBarAlert, MessageBarManager } from 'react-native-message-bar'

let self
const FBSDK = require('react-native-fbsdk');
const {
    LoginManager,
    AccessToken,
} = FBSDK;
class SelectFbPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            FbPageList: [],
            loader: false,
            next: null,
            isLoadingMore: false,
            _data: [],
        }
        this.fetchMore = this._fetchMore.bind(this);
        this.fetchFacebookPages = this._fetchFacebookPages.bind(this)
        self = this
    }
    async componentDidMount() {
        debugger
        this.setState({ loader: true })

        const retrievedItem = await AsyncStorage.getItem("user_info");
        const item = JSON.parse(retrievedItem);
        // console.log(item)
        const facebookID = item.facebookID
        const access_token = item.accessToken
        console.log(facebookID, "facebookIDfacebookID")
        console.log(access_token, "access_tokenaccess_token")
        let url = `https://graph.facebook.com/v3.0/${facebookID}/accounts?limit=25&access_token=${access_token}`


        let dataArray = [];
        let response = await this.fetchFacebookPages(url)

        if (response && response.data) {
            dataArray = response.data;
        }

        while (response.next != null) {

            response = await this.fetchFacebookPages(response.next);

            if (response && response.data) {
                dataArray = dataArray.concat(response.data);
            }
        }


        await AsyncStorage.setItem('fbPages', JSON.stringify(dataArray));

        this.setState({
            FbPageList: dataArray,
            loader: false,
            isLoadingMore: false,
            isLoading: false
        });


        MessageBarManager.registerMessageBar(this.refs.alert);

    }
    componentWillUnmount() {
        // Remove the alert located on this master page from the manager
        MessageBarManager.unregisterMessageBar();
    }
    //**************** Pagimation Function   ***********/
    // someFunction( repeat(nextPage) => {
    //     if (nextPage) {
    //         someFunction(nextPage);
    //     }
    // })
    _fetchFacebookPages(url) {
        debugger
        return fetch(url,
            ['pages_show_list']).then(async (response) => {
                const json = await response.json();
                console.log(json, 'pages')
                if (json && json.data && json.data.length > 0) {

                    return { next: json.paging.next ? json.paging.next : null, data: json.data };
                }

                return { next: null, data: [] }

            }).catch((err) => {

                return { next: null, data: [] }
            })
    }
    //Get Fetch more data 
    _fetchMore() {

        if (this.state.next) {
            this.setState({
                isLoadingMore: true,
            }, () => {
                setTimeout(() => {
                    this.fetchFacebookPages(this.state.next)
                    this.setState({ next: null })
                }, 4000)
            })
        } else {
            this.setState({
                isLoadingMore: false
            })
        }
    }
    // Handle Refresh data
    // ********************* End Pagination *********************/

    checkLead(item) {
        debugger

        this.setState({ loader: true })
        fetch(`https://graph.facebook.com/v3.0/${item.id}/leadgen_forms?access_token=${item.access_token}`,
            ['ads_management', 'manage_pages']).then(async (response) => {
                console.log(response, 'checkLeadcheckLead')
                const json = await response.json();
                console.log(json, 'jsonjson')

                if (json.data && json.data.length > 0) {
                    this.setState({ loader: false })
                    this.props.navigation.navigate('SelectLeadAddForm', { data: item })

                }
                // else if (!json.data) {
                //     alert('Please add the lead forms first')
                //     this.setState({ loader: false })

                // }
                else {
                    this.setState({ loader: false })
                    MessageBarManager.showAlert({
                        title: '',
                        message: 'No Lead Form is found in this page',
                        alertType: 'error',
                        position: 'bottom',
                        duration: 5000
                    });
                }

            }).catch((err) => {
                this.setState({ loader: false })
                console.log(err)
            })
    }

    _keyExtractor = (item, index) => index + 'fbpage';
    _renderFbPagesView = ({ item, index }) => {
        return (
            <TouchableOpacity onPress={() => this.checkLead(item)} activeOpacity={0.8}>
                <View style={styles.flatListPages}>
                    <View style={styles.leftSection}>
                        <Image source={{ uri: 'https://graph.facebook.com/v3.0/' + item.id + '/picture' }} style={{ height: 35, width: 35 }} resizeMode='contain' />
                    </View>
                    <View style={styles.centerSection}>
                        <Text style={{ fontSize: 14, color: 'black' }}>{item.name}</Text>
                    </View>
                    <View style={styles.rightSection}>
                        <Icon name='chevron-right' size={20} color='#DEDEDE' />
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    renderSpinner() {
        return (
            <View style={{ position: 'absolute', top: height / 2, left: width / 2 }}>
                <ActivityIndicator size={'large'} color='#5890FF' />
            </View>
        )
    }
    // Get All Form Leads
    async getLeadAll() {
        this.props.navigation.navigate('AllLeads', {
            title: 'All Leads',
            type: 'multiple',
            formData: false, selectFromFB: true
        })
    }
    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
                <View style={styles.container}>
                    <Header title="Select Facebook Page"
                        navigateClick={() => this.props.navigation.navigate("DrawerOpen")}
                        cancel={() => this.getLeadAll()} text='CANCEL' iconame='menu' />
                    <ScrollView>
                        <View style={styles.FlatListView}>
                            <FlatList
                                data={this.state.FbPageList}
                                keyExtractor={this._keyExtractor.bind(this)}
                                renderItem={this._renderFbPagesView.bind(this)}
                            // onEndReached={() =>
                            //     this.setState({ isLoadingMore: true }, () => this.fetchMore())}
                            // ListFooterComponent={() => {
                            //     return (
                            //         this.state.isLoadingMore &&
                            //         <View style={{ flex: 1, padding: 15, justifyContent: 'center', alignItems: 'center' }}>
                            //             <ActivityIndicator size={'large'} color='black' />
                            //         </View>
                            //     );
                            // }}
                            />
                        </View>
                    </ScrollView>
                    {this.state.loader && <View style={{ flex: 1, left: width / 2, right: width / 2, top: height / 2, bottom: height / 2, position: 'absolute' }}>
                        <ActivityIndicator color='#5890FF' size='large' />
                    </View>}
                    <MessageBarAlert ref="alert" messageStyle={{ textAlign: 'center', fontSize: 16 }} />
                </View>
            </SafeAreaView>
        );
    }
}
function mapStateToProps(state) {
    return {
        leads: state.Leads.listLead,
        formLead: state.Leads.formLead
    }
}
function mapDispathToProps(dispatch) {
    return bindActionCreators({ listLeadForm, dispatch }, dispatch);
}
export default connect(mapStateToProps, mapDispathToProps)(SelectFbPage)
