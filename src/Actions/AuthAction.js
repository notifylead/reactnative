import firebase from 'firebase';
import { Platform, AsyncStorage, PushNotificationIOS } from 'react-native'
// import DeviceInfo from 'react-native-device-info';
import FCM, { FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType } from 'react-native-fcm';
export function getUserDetails(uid) {
    return new Promise((resolve, reject) => {
        firebase.database().ref('/users/' + uid).once('value').then(function (snapshot) {
            var data = snapshot && snapshot.val();
            if (data !== null) {
                resolve(data);
            } else {
                reject('User not exist');
            }
        });
    })
}
//update facebook profile in users table
export function updateFacebookUser(uid, data, dp) {

    return new Promise((resolve, reject) => {
        let key = uid
        let first_name = data.first_name;
        let last_name = data.last_name;
        let gender = data.gender || "Prefer not to say";
        let updatedUserData = {
            firstname: first_name,
            lastname: last_name,
            picture: dp,
            LastLogin: (new Date()).getTime()
        };
        let user = firebase.database().ref('/users/' + key)
        user.update(updatedUserData).then(function () {
            resolve(updatedUserData);
        }, function (err) {
            reject(err);
        });
    });
}

function addDeviceTokenToFirebase(uid, devicetype, Mobile_token, resolve, reject) {
    let device_datas = firebase.database().ref('/users/' + uid + '/device_tokens/')
    device_datas.push({
        type: devicetype,
        token: Mobile_token
    }).then(function (insertedData) {
        AsyncStorage.setItem('devicetoken', Mobile_token)
        console.log('inserted', insertedData);
        resolve('inserted');
    }, function (err) {
        reject(err);
    });
}


//add device tokens
export function addDeviceToken(uid) {
    return new Promise((resolve, reject) => {

        let Mobile_token;
        let devicetype;

        if (Platform.OS === 'ios') {

            //    PushNotificationIOS.requestPermissions().then(() => console.log('granted111')).catch(() => console.log('notification permission rejected for push notigfication'));;
            FCM.requestPermissions().then(() => console.log('granted')).catch(() => console.log('notification permission rejected'));
            FCM.getFCMToken().then(token => {
                devicetype = "IOS";
                Mobile_token = token;
                addDeviceTokenToFirebase(uid, devicetype, Mobile_token, resolve, reject)

            })
            // PushNotificationIOS.addEventListener('register', (token) => {
            //     alert("In IOS  0000000000"+token)
            //     // devicetype = "IOS";
            //     // Mobile_token = token;

            //     //save to firebase
            //   //  addDeviceTokenToFirebase(uid, devicetype, Mobile_token, resolve, reject)
            // });

        } else if (Platform.OS === 'android') {

            devicetype = "ANDROID";
            FCM.requestPermissions().then(() => console.log('granted')).catch(() => console.log('notification permission rejected'));
            FCM.getFCMToken().then(token => {
                Mobile_token = token;
                addDeviceTokenToFirebase(uid, devicetype, Mobile_token, resolve, reject)

            })
        }
    });
}
//remove device tokens
export async function removeDeviceToken(uid) {

    let self = this;
    var i = 0, j = 0;
    var delete_data = [];

    return new Promise(async (resolve, reject) => {
        var devce_token = await AsyncStorage.getItem('devicetoken');

        let device_db = firebase.database().ref('/users/' + uid + '/device_tokens/')
            .orderByChild("token").equalTo(devce_token);
        device_db.once("value", function (snapshot) {

            var device_data = snapshot.val();
            for (let data in device_data) {
                i = i + 1;
                delete_data.push({ id: data });
            }
            if (delete_data.length != 0) {
                for (let delete_id of delete_data) {
                    firebase.database().ref('/users/' + uid + '/device_tokens/' + delete_id.id).remove().then(function () {
                        j = j + 1;
                        console.log('i', i);
                        console.log('j', j);
                        if (i == j) {
                            i = 0;
                            j = 0;

                            resolve('removed all device token');
                        }
                    }, function (err) {

                        reject(error);
                    });
                }
            } else {
                resolve('removed all device token');
            }
        }, function (error) {
            console.log("Error: " + error.code);
            reject(error);
        });
    });
}

//Add new user detail in facebook in users table
export function addFacebookUser(uid, data, dp) {

    return new Promise((resolve, reject) => {
        var key = uid
        var first_name = data.first_name;
        var last_name = data.last_name;
        var gender = data.gender || "Prefer not to say";
        var updatedUserData = {
            "uid": key,
            "fbid": data.id,
            "firstname": first_name,
            "lastname": last_name,
            "email": data.email,
            "picture": dp,
            "createdAt": (new Date()).getTime(),
            "LastLogin": (new Date()).getTime(),
            "flag_leads_badge": 0,
            "archieve_leads_badge": 0,
            "leads_badge": 0,
            "interval": 0,
            "from_time": (new Date()).getTime(),
            "do_not_disturb": 0
        };

        !updatedUserData.email && delete updatedUserData.email


        let user = firebase.database().ref('/users/' + key)
        user.update(updatedUserData).then(function () {
            resolve(updatedUserData);
        }, function (err) {
            reject(err);
        });
    })

    // .then(function (success) {
    //     resolve("success", success);
    // }, function (err) {
    //     reject("err", err);
    // });
}
export function checkIsSubscibed(uid) {
    return firebase.database().ref('/users/' + uid).once('value').then(function (snapshot) {
        var data = snapshot && snapshot.val();
        console.log(data, "datadatadata")
        if (data && (data.isSubscribe || data.subscribe_type)) {
            return true
        } else {

            return false
        }
    }).catch((err) => {
        return false

    })

}
// export function getfacebookUserDetails(uid) {
//     var key = uid
//     return new Promise((resolve, reject) => {
//         const user_db = this.af.database.object(`users/${key}`);
//         user_db.subscribe(data => {
//             if (data.$value !== null) {
//                 resolve(data);
//             } else {
//                 reject('User not exist');
//             }
//         });
//     });
// }

export function updateUserData(id, data) {
    console.log(id, data);
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/users/' + id).update(data).then(function (snapshot) {
            var data = snapshot && snapshot.val();
            if (data !== null) {
                resolve('updated user data');
            } else {
                reject('User not exist');
            }
        })

    });
}


// check Fb Pages is exits

export async function checkFbPagesIsExits(facebookID, access_token) {
    return fetch(`https://graph.facebook.com/v3.0/${facebookID}/accounts?access_token=${access_token}`,
        ['pages_show_list']).then(async (response) => {
            const json = await response.json();
            if (json && json.data && json.data.length > 0) {
                return true
            } else {
                return false
            }
        }).catch((err) => {
            return false
        })
}