import React, { Component } from "react";
import { View, Text, StyleSheet, Image, SafeAreaView, FlatList, AsyncStorage, ScrollView, Platform, ActivityIndicator, Dimensions, Linking } from 'react-native';
import { CheckBox, Button } from 'react-native-elements'
import Header from '../../Common/Header'
import * as firebase from 'firebase'
import { paymentsIOS, paymentsAndroid } from '../Payments/Payment'
import InAppBilling from 'react-native-billing'
import { NativeModules } from 'react-native';
const { InAppUtils } = NativeModules
import * as _ from 'underscore';
import moment from 'moment';
const { height, width } = Dimensions.get('window');
const subscriptionLogo = require('../../Assets/icon/subscription.png')
import axios from 'axios';
import { HerokuConfig } from '../../Config/index'
const data = [
    { price: '720.00', description: 'Month to Month Subscription (Notify Leads)' },
    { price: '7,700.00', description: 'Yearly Subscription (Notify Leads)' },
]
export default class Subscription extends Component {
    constructor(props) {
        super(props);
        this.state = {
            monthlychecked: false,
            yearlychecked: false,
            monthly_checked: true,
            yearly_checked: false,
            show_subscription: true,
            show_sub: false,
            products_list: [],
            product_list: [],
            subscription_data: '',
            subscription_date: {},
            product_name: '',
            user: {},
            loader: false
        }
    }

    async componentWillMount() {

        this.setState({ loader: true })
        let userid = firebase.auth().currentUser.uid;
        let user
        await this.getUserDetails(userid).then((res) => {
            user = res
            if (user && (user.isSubscribe || user.subscribe_type)) {
                debugger
                var mydate = new Date(user.expiry_date);
                console.log(mydate.toDateString());
                this.setState({
                    show_subscription: false,   // set it to false
                    show_sub: true,
                    // subscription_date: user.subscribe_type && (user.subscribe_type == "monthly_fblead_subscription" || user.subscribe_type == "monthly") ?
                    //     moment().add(1, 'months').calendar() : moment().add(1, 'years').calendar(),
                    subscription_date: (user.expiry_date) ? new Date(user.expiry_date) : (user.subscribe_type && (user.subscribe_type == "monthly_fblead_subscription" || user.subscribe_type == "monthly")) ?
                        moment().add(1, 'months').calendar() : moment().add(1, 'years').calendar(),
                    user: user
                    // SignedIn: true,
                    // loading: false,
                }, () => {
                    (user.expiry_date) ? null :
                        this.updateExpiryDate(userid)
                })
            }
            else {
                this.setState({
                    show_subscription: true,
                    show_sub: true,
                    user: user
                    // SignedIn: false,
                    // loading: false
                })
            }
        }).catch((err) => {
            console.log("err", err)
        })


        if (Platform.OS === "ios") {
            this.state.products_list = ['monthly_fblead_subscription', 'yearly_fblead_subscription'];
            return new Promise((resolve, reject) => {
                InAppUtils.loadProducts(this.state.products_list, (error, products) => {
                    if (error) {
                        alert("error")
                        this.setState({ loader: false })
                        reject({ error: error, response: null })
                    } else {
                        this.setState({ loader: false })
                        this.setState({ product_list: products })
                        // console.log(this.state.product_list[0].currencySymbol, "products_listproducts_listproducts_listproducts_list");
                        resolve({ error: null, response: products })
                    }
                })
            })
        } else {
            this.state.products_list = ['monthly', 'yearly'];
            InAppBilling.open()
                .then(() => {
                    InAppBilling.getSubscriptionDetailsArray(this.state.products_list).then((products) => {
                        this.setState({ product_list: products, loader: false }, () => {
                            // InAppBilling.isSubscribed(this.state.product_list[0]).then((res) => {
                            //     if (res) {
                            //         // this.setState({ userSubscribed: true })
                            //     } else {
                            //         let data = {}
                            //         data["subscribe_type"] = ""
                            //         data["expiry_data"] = ""
                            //         this.setState({ userSubscribed: false, show_subscription: true, show_sub: true }, () => {
                            //             firebase.database().ref('/users').child(uid).update(data)
                            //                 .then(function () {
                            //                     resolve('remove');
                            //                 }).catch((err) => {
                            //                     alert("not update_subscribe_type")
                            //                     console.log(err, "err")
                            //                 });
                            //         })
                            //     }
                            // })
                        })
                        InAppBilling.close()
                    }).catch((err) => {
                        this.setState({ loader: false })
                        console.log(err);
                        InAppBilling.close()
                    });
                })
        }


    }
    updateExpiryDate = (uid) => {
        debugger
        return new Promise((resolve, reject) => {
            firebase.database().ref('/users').child(uid).update({
                expiry_date: moment(this.state.subscription_date).valueOf()
            }).then(function () {
                resolve('added subscribe_db');
            }).catch((err) => {
                alert("not update_subscribe_type")
                console.log(err, "err")
            });
        });
    }
    async getUserDetails(uid) {
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
    add_subscribe_type(uid, data) {
        console.log(uid, data, "uiduiduiduiduid")
        data.uid = uid;
        return new Promise((resolve, reject) => {
            firebase.database().ref('/subscribe').child(uid).update(data).then(function () {
                // alert("add_subscribe_type")
                // this.af.database.object('/subscribe/' + uid).update(data).then(function () {
                resolve('added in subscribe db');
            }).catch((err) => {
                alert("not add_subscribe_type")
                console.log(err, "err")
            });
        });
    }
    update_subscribe_time(uid) {
        debugger
        return new Promise((resolve, reject) => {
            // let base_url = 'http://192.168.1.132:5000/getpurchaseDate';

            let base_url = HerokuConfig.HKURL + 'getpurchaseDate';
            var headers =
            {
                'Content-Type': 'application/json',
            }
            let payload_data = {
                uid: uid
            }

            axios.post(base_url, payload_data, { headers: headers }).then(res => {
                console.log(res.data, 'added update_subscribe_time')
                resolve("added update_subscribe_time")
            }).catch(err => {
                if (err.response) {
                    reject(err.response.data)
                } else {
                    reject(err.message)
                }
            })
            // fetch(base_url, { payload_data }, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
            //     .then((data) => {
            //         console.log("data", data);
            //         // alert("added update_subscribe_time")
            //         resolve('added purchase/expiry time in db');
            //     }, err => {
            //         alert(err.message + "not update_subscribe_time")
            //         console.log("err", err);
            //         reject(err);
            //     })
        });
    }

    update_subscribe_type(uid, subscribe_type) {
        return new Promise((resolve, reject) => {
            firebase.database().ref('/users').child(uid).update({
                subscribeDevice: (Platform.OS === "ios") ? "ios" : "android",
                subscribe_type: subscribe_type,
                isSubscribe: true,
                expired_status: false
            }).then(function () {
                // alert("added update_subscribe_type")
                resolve('added subscribe_db');
            }).catch((err) => {
                alert("not update_subscribe_type")
                console.log(err, "err")
            });
        });
    }
    restore_subscription(payload_data) {
        debugger
        // var sample= {
        //     receipt:payload_data.receipt
        // }


        return new Promise((resolve, reject) => {
            debugger
            var headers =
            {
                'Content-Type': 'application/json',
            }
            let base_url = HerokuConfig.HKURL + 'getTransactionDetails';
            // let base_url = 'http://192.168.1.132:5000/getTransactionDetails';

            // let base_url = 'http://192.168.0.104:5000/getTransactionDetails';
            // , maxContentLength: 104857600 
            // 5024000000
            // 4294967295
            // ,maxContentLength:10048000000
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

        // return new Promise((resolve, reject) => {
        //     let base_url = HerokuConfig.HKURL + 'getTransactionDetails';
        //     // let base_url = 'http://192.168.0.104:5000/getTransactionDetails';

        //     fetch(base_url, {
        //         method: 'POST', // or 'PUT'
        //         body: JSON.stringify(payload_data), // data can be `string` or {object}!
        //         headers: {
        //             'Content-Type': 'application/json'
        //         }
        //     }).then(res => res.json())
        //         .then((response) => {
        //             console.log('Success:', JSON.stringify(response))
        //             resolve("successfully restored")
        //         }).catch((err) => {
        //             alert(err.message)
        //             console.log("err", err);
        //             reject(err);
        //         })
        // })

        // .catch(error => console.error('Error:', error));

        // fetch(base_url, { payload_data }, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        //     .then((data) => {
        //         console.log("data", data);
        //         // alert("added update_subscribe_time")
        //         resolve("successfully restored");
        //     }, err => {
        //         alert(err.message + "not update_subscribe_time")
        //         console.log("err", err);
        //         reject(err);
        //     })
        // });
    }
    restore_purchase() {
        debugger
        let product
        this.setState({ loader: true })
        //ios start
        if (Platform.OS === "ios") {
            return new Promise((resolve, reject) => {
                if (Platform.OS === "ios") {
                    return new Promise((resolve, reject) => {
                        InAppUtils.loadProducts(this.state.products_list, (error, products) => {
                            if (error) {
                                this.setState({ loader: false })
                                reject({ error: error, response: null })
                            } else {
                                this.setState({ loader: false })
                                // resolve({ error: null, response: products })
                                InAppUtils.restorePurchases((error, response) => {
                                    if (error) {
                                        resolve({ response: [] })
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
                                                        latest_record.uid = this.state.user.uid;
                                                        this.restore_subscription(latest_record).then((res) => {
                                                            if (res == "Restored Successfully") {
                                                                this.setState({ loader: false, show_sub: true, show_subscription: false })

                                                            }
                                                            else {
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
                    })
                }
            })
        }
        //ios finish
        //android  start
        else {
            return new Promise((resolve) => {
                this.getUserDetails(this.state.user.uid).then((res) => {
                    if (res && (res.subscribe_type || res.isSubscribe)) {
                        this.setState({
                            subscription_date:
                                (res.expiry_date) ? new Date(res.expiry_date) : new Date(1548847865000),
                            show_subscription: false,
                        }, () => {
                            // InAppBilling.close()
                            InAppBilling.open()
                                .then(() => {
                                    InAppBilling.loadOwnedPurchasesFromGoogle()
                                        .then((response) => {
                                            InAppBilling.listOwnedSubscriptions()
                                                .then(subProductIds => {
                                                    // alert(JSON.stringify(subProductIds))
                                                    subProductIds = subProductIds || []
                                                    if (subProductIds.length) {
                                                        InAppBilling.getSubscriptionTransactionDetails(subProductIds[0]).then(subscription => {
                                                            product = JSON.parse(subscription.receiptData)
                                                            product['uid'] = res.uid
                                                            this.restore_subscription(product).then((res) => {
                                                                // alert(JSON.stringify(res)+'update res');
                                                                return InAppBilling.close()
                                                            }).catch((err) => {
                                                                alert(JSON.stringify(err.message) + "120")
                                                                console.log('err', err);
                                                                return InAppBilling.close();
                                                            });
                                                        }).catch((err) => {
                                                            alert(JSON.stringify(err.message) + "130")
                                                            console.log('err', err);
                                                            return InAppBilling.close();
                                                        });
                                                    } else {
                                                        return InAppBilling.close()
                                                        resolve({ response: [] })
                                                    }
                                                }).catch((err) => {
                                                    alert(JSON.stringify(err.message) + "140")
                                                    console.log('err', err);
                                                    return InAppBilling.close();
                                                });
                                        }).catch((err) => {
                                            alert(JSON.stringify(err.message) + "150")
                                            console.log('err', err);
                                            return InAppBilling.close();
                                        });
                                }).catch((err) => {
                                    alert(JSON.stringify(err.message) + "160")
                                    console.log('err', err);
                                    return InAppBilling.close();
                                });
                        })
                    }
                }).catch((err) => {
                    alert(JSON.stringify(err.message) + "900")
                    console.log('err', err);
                    return InAppBilling.close();
                });
            }).catch((err) => {
                alert(JSON.stringify(err.message) + "160")
                console.log('err', err);
                return InAppBilling.close();
            });
        }

        //android finish
    }
    subscribe = async () => {
        await this.setState({ loader: true })
        if (this.state.monthlychecked) {
            this.setState({ subscription_data: 'monthly' })
            if (Platform.OS === "ios") {
                await this.setState({ product_name: 'monthly_fblead_subscription' })
            } else {
                this.setState({ product_name: 'monthly' })
            }
        } else if (this.state.yearlychecked) {
            this.setState({ subscription_data: 'yearly' })
            if (Platform.OS === "ios") {
                await this.setState({ product_name: 'yearly_fblead_subscription' })
            } else {
                this.setState({ product_name: 'yearly' })
            }
        } else {
            this.setState({ subscription_data: '', product_name: '', loader: false })
        }
        if (this.state.subscription_data === '') {
            alert("Please select subscription")
            this.setState({ loader: false })
        }

        else {


            //if platform ios
            if (Platform.OS === "ios") {
                debugger
                return new Promise(async (resolve, reject) => {
                    this.setState({ loader: false })
                    InAppUtils.purchaseProduct(this.state.product_name, async (error, data) => {
                        if (error) {
                            resolve({ error, data: null })
                        } else {
                            // this.setState({ loader: true })
                            this.add_subscribe_type(this.state.user.uid, data).then(async (res) => {
                                // InAppBilling.consumePurchase(data.productId).then((success) => {
                                // InAppBilling.isPurchased(data.productId).then((success) => {
                                //call heroku server for adding purchase,expire time in db
                                this.update_subscribe_time(this.state.user.uid).then(async (res) => {
                                    debugger
                                    //add product type in db
                                    this.update_subscribe_type(this.state.user.uid, this.state.subscription_data).then(async (res) => {
                                        let fbPages = await AsyncStorage.getItem('fbPages');
                                        let itemVal = JSON.parse(fbPages);
                                        if (itemVal && itemVal.length > 0) {
                                            this.setState({ loader: false })
                                            // this.props.navigation.navigate("AllLeads")
                                        }
                                        else {
                                            this.setState({ loader: false })
                                            // this.props.navigation.navigate("Home")
                                        }
                                    }).catch((err) => {
                                        console.log('this.usersService.update_subscribe_type ', err);
                                    });
                                }).catch((err) => {
                                    alert(JSON.stringify(err.message) + "hello")
                                    console.log('this.usersService.update_subscribe_time ', err);
                                });
                                // }).catch(err => {
                                //     console.log('InAppPurchase.consume ', err);
                                // });
                            }).catch((err) => {
                                console.log('this.usersService.add_subscribe_type ', err);
                            })
                            resolve({ error: null, response })
                        }
                    })
                })

            }

            //if platform android
            else {
                await InAppBilling.open()
                    .then(async () => {
                        await InAppBilling.subscribe(this.state.product_name)
                            .then(async (data) => {
                                console.log("You purchased: ", data);
                                this.add_subscribe_type(this.state.user.uid, data).then(async (res) => {
                                    //InAppBilling.consumePurchase(data.productId).then((success) => {
                                    // InAppBilling.isPurchased(data.productId).then((success) => {
                                    // console.log('product was successfully consumed!', success);
                                    //call heroku server for adding purchase,expire time in db
                                    this.update_subscribe_time(this.state.user.uid).then(async (res) => {
                                        //add product type in db
                                        this.update_subscribe_type(this.state.user.uid, this.state.subscription_data).then(async (res) => {
                                            console.log('update res', res);
                                            let fbPages = await AsyncStorage.getItem('fbPages');
                                            let itemVal = JSON.parse(fbPages);
                                            if (itemVal && itemVal.length > 0) {
                                                // this.props.navigation.navigate("AllLeads")
                                            }
                                            else {
                                                // this.props.navigation.navigate("Home")
                                            }
                                            // let user_data = JSON.parse(window.localStorage.getItem('user'));
                                            // user_data.subscribe_type = self.subscription_data;
                                            // window.localStorage.setItem('user', JSON.stringify(user_data));
                                            // window.localStorage.removeItem('removed_leads');
                                            // self.events.publish('user:subscribed', 'true');
                                            // self.loaderService.hideSpinner();
                                            // self.loaderService.showSuccessToast('Subscribed Successfully');
                                            // self.navCtrl.setRoot(HomePage);
                                            // this.setState({
                                            //     subscription_date:
                                            //         (res.expiry_date) ? new Date(res.expiry_date) : new Date(1548847865000),
                                            //     show_subscription: false,
                                            // }, () => {
                                            //     alert('Subscribed Successfully');
                                            // })
                                            return InAppBilling.close();
                                        }).catch((err) => {
                                            console.log('this.usersService.update_subscribe_type ', err);
                                            return InAppBilling.close();
                                        });
                                    }).catch((err) => {
                                        alert(JSON.stringify(err.message) + "hello")
                                        console.log('this.usersService.update_subscribe_time ', err);
                                        return InAppBilling.close();
                                    });
                                    // }).catch(err => {
                                    //     console.log('InAppPurchase.consume ', err);
                                    //     return InAppBilling.close();
                                    // });
                                }).catch((err) => {
                                    console.log('this.usersService.add_subscribe_type ', err);
                                    return InAppBilling.close();
                                })
                            }).catch((err) => {
                                alert(err.message)
                                console.log('this.usersService.add_subscribe_type ', err);
                                return InAppBilling.close();
                            })
                    }).catch((err) => {
                        console.log('this.usersService.add_subscribe_type ', err);
                        return InAppBilling.close();
                    })
            }
        }
    }
    render() {

        console.log(this.state.subscription_date, 'subscription_date')
        let privacyUrl = "https://notifylead.com/privacy-policy/"
        let termsUrl = "https://notifylead.com/terms-and-condition/"
        return (
            <SafeAreaView style={{ flex: 1, }}>
                <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                    <Header title="Subscription" navigateClick={() => this.props.navigation.navigate("DrawerOpen")} iconame='menu' />
                    <ScrollView>
                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 20, paddingBottom: 10 }}>
                                <Image source={subscriptionLogo} style={{ flex: 1 }} />
                            </View>


                            {
                                (this.state.show_subscription && this.state.show_sub) ?

                                    <View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text>
                                                For adding more than 1 lead,please subscribe accordingly.
                                </Text>
                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row', }}>
                                            <View style={{ flex: 0.2 }}>
                                                <CheckBox
                                                    checkedColor='#5890FF'
                                                    checked={this.state.monthlychecked}
                                                    onPress={() => this.setState({ monthlychecked: !this.state.monthlychecked }, () => {
                                                        (this.state.monthlychecked) ? (Platform.OS === "ios") ? this.setState({ yearlychecked: false, subscription_data: 'monthly_fblead_subscription' }) :
                                                            this.setState({ yearlychecked: false, subscription_data: 'monthly' }) : this.setState({ subscription_data: '' })
                                                    })}
                                                    containerStyle={{ backgroundColor: '#FFF', borderWidth: 0 }}
                                                />
                                            </View>
                                            <View style={{ flex: 0.8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                <Text style={{ color: '#000', fontFamily: 'Roboto-Regular', fontWeight: '700' }}>{(this.state.product_list && this.state.product_list.length) ? (Platform.OS === "ios") ? this.state.product_list[0].priceString : this.state.product_list[0].priceText : ''}</Text>
                                                <Text style={{ color: '#000', fontFamily: 'Roboto-Regular', fontWeight: '700' }}>{' '}/{' '}Month</Text>
                                            </View>
                                        </View ><View style={{ flex: 1, flexDirection: 'row', }}>
                                            <View style={{ flex: 0.2 }}>
                                                <CheckBox
                                                    checkedColor='#5890FF'
                                                    checked={this.state.yearlychecked}
                                                    onPress={() => this.setState({ yearlychecked: !this.state.yearlychecked }, () => {
                                                        (this.state.yearlychecked) ? (Platform.OS === "ios") ? this.setState({ monthlychecked: false, subscription_data: 'yearly_fblead_subscription' }) :
                                                            this.setState({ monthlychecked: false, subscription_data: 'yearly' }) : this.setState({ subscription_data: '' })
                                                    })}
                                                    containerStyle={{ backgroundColor: '#FFF', borderWidth: 0 }}
                                                />
                                            </View>
                                            <View style={{ flex: 0.8, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>

                                                <Text style={{ fontFamily: 'Roboto-Regular', fontWeight: '700' }}>{(this.state.product_list && this.state.product_list.length) ? (Platform.OS === "ios") ? this.state.product_list[1].priceString : this.state.product_list[1].priceText : ''}</Text>
                                                <Text style={{ fontFamily: 'Roboto-Regular', fontWeight: '700' }}>{' '}/{' '}Year</Text>
                                            </View>
                                        </View >
                                        <View style={{ flex: 1, paddingHorizontal: 20, marginTop: 10 }}>
                                            <Text style={{ paddingBottom: 10, fontWeight: 'bold', fontSize: 12, fontFamily: 'Roboto-Regular' }}>Please Note:</Text>
                                            <Text style={{ paddingBottom: 10, fontSize: 12, fontFamily: 'Roboto-Regular' }}>Payment will be charged to iTunes Account at confirmation of purchase</Text>
                                            <Text style={{ paddingBottom: 10, fontSize: 12, fontFamily: 'Roboto-Regular' }}>Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end
                                        of the current period.</Text>
                                            <Text style={{ paddingBottom: 10, fontSize: 12, fontFamily: 'Roboto-Regular' }}>Account will be charged for renewal within 24-hours prior to the end of the current period, and identify
                                        the cost of the renewal.</Text>
                                            <Text style={{ paddingBottom: 10, fontSize: 12, fontFamily: 'Roboto-Regular' }}>Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account
                                        Settings after purchase.</Text>
                                            <Text style={{ fontSize: 12, fontFamily: 'Roboto-Regular' }}>Any unused portion of a free trial period, if offered, will be forfeited when the user purchases a subscription
                                         to that publication, where applicable.</Text>
                                        </View>


                                        <View style={{
                                            flex: 0.8,
                                            justifyContent: 'center', alignItems: 'center',
                                            marginTop: 20
                                        }}>

                                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                                <Text style={{ textAlign: 'center' }}>

                                                    <Text style={{ fontSize: 14, color: '#797979' }}
                                                    >For more information{' '}</Text>

                                                    <Text style={{ fontSize: 14, color: '#5890ff', fontWeight: 'bold' }}
                                                        onPress={() => this.props.navigation.navigate('Web', { data: termsUrl })}
                                                    >Terms of Service </Text>


                                                    <Text style={{ fontSize: 14, color: '#797979', }}> and </Text>

                                                    <Text onPress={() => this.props.navigation.navigate('Web', { data: privacyUrl })}
                                                        style={{ fontSize: 14, color: '#5890ff', fontWeight: 'bold' }}>Privacy Policy </Text>


                                                </Text>

                                            </View>
                                        </View>
                                        <View style={{
                                            paddingLeft: 4,
                                            paddingRight: 4,
                                            marginTop: 20,
                                            paddingBottom: 10,
                                            // marginBottom: 15
                                        }}>
                                            <Button
                                                title='Subscribe'
                                                color='white'
                                                onPress={() => this.subscribe()}

                                                buttonStyle={{
                                                    backgroundColor: "#5890ff",
                                                    borderRadius: 5
                                                }}
                                                textStyle={{ fontWeight: 'bold', fontFamily: 'Roboto-Regular' }}
                                            />
                                        </View>
                                        <View style={{
                                            paddingLeft: 4,
                                            paddingRight: 4,
                                            paddingBottom: 10,
                                            marginBottom: 15
                                        }}>
                                            <Button
                                                title='Restore Subscription'
                                                color='#777'
                                                onPress={() => this.restore_purchase()}
                                                buttonStyle={{
                                                    backgroundColor: "#FFF",
                                                    borderRadius: 5
                                                }}
                                                textStyle={{ fontWeight: 'bold', fontSize: 16, fontFamily: 'Roboto-Regular' }}
                                            />
                                        </View>
                                        {/* <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }} onPress={() => this.restore_purchase()}>
                                        <Text style={{ fontSize: 18 }}>Restore Subscription</Text>
                                    </View> */}
                                    </View>
                                    :
                                    (this.state.show_sub) ?
                                        <View style={{ flex: 1, paddingTop: 20, justifyContent: 'space-between' }}>
                                            <View style={{ flex: 1, alignItems: "center", }}>
                                                <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Roboto-Regular' }}>Subscription Details</Text>
                                                <Text style={{ fontFamily: 'Roboto-Regular' }}>You are subscribed until: {(this.state.subscription_date) ? moment(this.state.subscription_date).format("DD MMM YYYY")
                                                    // this.state.subscription_date.toDateString()
                                                    : this.state.subscription_date.getTime()
                                                } </Text>
                                            </View>
                                            <View style={{
                                                flex: 1,
                                                justifyContent: 'flex-end',
                                                paddingTop: 20,
                                                paddingLeft: 4,
                                                paddingRight: 4,
                                                paddingBottom: 10,
                                                marginBottom: 15
                                            }}>
                                                <Button
                                                    title='Manage Subscription'
                                                    color='#777'
                                                    onPress={() => {
                                                        (this.state.user.subscribeDevice) ? (this.state.user.subscribeDevice == "ios") ?
                                                            Linking.openURL("https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/manageSubscriptions").catch(err => alert('An error occurred' + err))
                                                            :
                                                            Linking.openURL("https://play.google.com/store/account/subscriptions").catch(err => alert('An error occurred' + err)) : (Platform.OS === "ios") ? Linking.openURL("https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/manageSubscriptions").catch(err => alert('An error occurred' + err))
                                                                :
                                                                Linking.openURL("https://play.google.com/store/account/subscriptions").catch(err => alert('An error occurred' + err))
                                                    }}
                                                    buttonStyle={{
                                                        backgroundColor: "#5890ff",
                                                        borderRadius: 5
                                                    }}
                                                    textStyle={{ color: '#FFF', fontWeight: 'bold', fontSize: 16, fontFamily: 'Roboto-Regular' }}
                                                />
                                            </View>
                                        </View>
                                        :
                                        <View />
                                // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#5890ff" /></View>
                            }

                        </View>
                    </ScrollView>
                    {
                        (this.state.loader) ?
                            <View style={{ flex: 1, left: width / 2, right: width / 2, top: height / 2, bottom: height / 2, position: 'absolute' }}>
                                <ActivityIndicator size="large" color="#5890ff" /></View> :
                            null
                    }
                </View >
            </SafeAreaView>
        )
    }
}