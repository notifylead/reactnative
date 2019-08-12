import firebase from 'firebase';
import { AsyncStorage } from 'react-native'

import { LEADLIST_ACTION_TYPES } from './ActionTypes'


export function getLeadsList(id) {
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leadForm').orderByChild('uid').equalTo(id).once('value').then(function (snapshot) {
            let getLeadsListArr = []
            snapshot.forEach(element => {
                let item = element.val();
                item['key'] = element.key;
                getLeadsListArr.push(item)
            });
            // if (getLeadsListArr.length) {
            //     resolve(getLeadsListArr.length);
            // } else {
            //reject('User LeadList not exist');
            resolve(getLeadsListArr.length);
            // }
        })
    });
}
//check lead form details using formid
export function checkLeadForm(id) {
    debugger
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leadForm').orderByChild('formId').equalTo(id).limitToFirst(1).once('value').then(function (snapshot) {
            var data = snapshot.val()
            console.log("checkLeadForm", data)
            if (data) {
                resolve('yes');
            } else {
                resolve('no');
            }
        })
    });
}
//check lead form details using formid
export function getActiveLeadForm(uId, pageId) {

    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leadForm').orderByChild('uid').equalTo(uId).once('value').then(function (snapshot) {
            let pageLeads = [];

            if (snapshot.exists()) {
                let activeleads = Object.values(snapshot.val())
                pageLeads = activeleads.filter(x => x.pageId == pageId)
                resolve(pageLeads);
            } else {
                resolve(pageLeads);
            }
        })
    });
}
export function removeActiveLead(leadId) {

    firebase.database().ref('/leadForm/' + leadId).remove().then(function (snapshot) {

    }).catch(err => {


    })

}
//create Lead form
export function createLeadsForm(data) {
    let self = this;
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leadForm').push({
            "uid": data.uid,
            "createdAt": data.createdAt,
            "facebook_page": data.facebook_page,
            "leads_ads_form": data.leads_ads_form,
            "formId": data.formId,
            "pageId": data.pageId,
            "badge_count": 0,
            "push_notifications": true,
            "page_picture": data.page_picture
        }).then(function (insertedData) {
            firebase.database().ref().child('leadForm/' + insertedData.key).update({
                id: insertedData.key
            }).then(function () {
                resolve(insertedData.key);
            }, function (err) {
                reject(err);
            });
        }, function (err) {
            reject(err);
        });
    });
}


export function createLeads(data) {
    debugger
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leads').push({
            "uid": data.uid,
            "createdAt": "" + data.createdAt,
            "formId": data.formId,
            "leadId": data.leadId,
            "store_date": "" + data.store_date,
            "lead_seen": false
        }).then(function (insertedData) {
            firebase.database().ref().child('/leads/' + insertedData.key).update({
                id: insertedData.key
            }).then(function () {
                resolve(insertedData.key);
            }, function (err) {
                reject(err);
            });

        }, function (err) {
            reject(err);
        });
    });
}

//get list of lead form
export function listLeadForm(id) {
    return (dispatch) => {
        dispatch({ type: LEADLIST_ACTION_TYPES.LEADLIST_REQUEST })
        return new Promise((resolve, reject) => {
            firebase.database().ref().child('/leadForm').orderByChild('uid').equalTo(id).on('value', (snapshot) => {
                let leadListArr = []
                let count = 0
                if (snapshot.exists) {
                    snapshot.forEach(element => {
                        ++count
                        let item = element.val();
                        item['key'] = element.key;
                        leadListArr.push(item)
                        console.log(leadListArr)
                    });
                }
                if (leadListArr && leadListArr.length > 0 && count == snapshot.numChildren()) {
                    dispatch({
                        type: LEADLIST_ACTION_TYPES.LEADLIST_REQUEST_SUCCESS,
                        payload: { listLead: leadListArr }
                    })
                    resolve(leadListArr);
                }
                else {
                    dispatch({
                        type: LEADLIST_ACTION_TYPES.LEADLIST_REQUEST_FAIL,
                        payload: { listLead: [] }
                    })
                    resolve(leadListArr);
                }
            })
        });
    }
}
export function listLeadForm1(id) {
    debugger
    console.log("leaddformmmmmmmmmmmmmmmm");
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leadForm').orderByChild('formId').equalTo(id).limitToFirst(1).once('value').then(function (snapshot) {

            let data = []
            snapshot.forEach(element => {
                let item = element.val();
                item['key'] = element.key;
                data.push(item)
                console.log(data)
            });
            if (data) {
                var data1 = data[0];
                console.log(data, "dattttttt");
                resolve(data1);
            } else {
                resolve('no data');
            }
        })
    });
}


//update form data
export function updateFormData(id, data) {
    debugger
    console.log(id, data);
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leadForm/' + id).update(data).then(function () {
            resolve('updated form data');
        }, function (err) {
            reject(err);
        });

    });
}

//get list of all leads
// export function listLeadAll(uid) {
//     
//     // 62evhd3mX1fAb3QiVS31WYUN4FI3
//     return new Promise((resolve, reject) => {
//         firebase.database().ref().child('/leads').orderByChild('uid').equalTo(uid).once('value').then(function (snapshot) {
//             console.log(snapshot.val())
//             let leadListArr = []
//             
//             snapshot.forEach(element => {
//                 let item = element.val();
//                 item['dataId'] = element.key;
//                 leadListArr.push(item)
//                 console.log(leadListArr, "leadListArrleadListArrleadListArr")
//             });
//             if (leadListArr && leadListArr.length > 0) {
//                 
//                 resolve(leadListArr);
//             } else {
//                 
//                 resolve(leadListArr);
//             }
//         })

//     })

// }

//get list of all leads
export function listLeadAll(uid) {
debugger
    // 62evhd3mX1fAb3QiVS31WYUN4FI3
    return new Promise((resolve, reject) => {
        let userId = firebase.auth().currentUser.uid;
        console.log(uid, "uiduid")
        firebase.database().ref('leads').orderByChild('uid').equalTo(uid).on('value', (snapshot) => {
            let leadListArr = []
            if (snapshot.exists()) {
                let count = 0
                snapshot.forEach(element => {
                    ++count
                    let item = element.val();
                    item['dataId'] = element.key;
                    leadListArr.push(item)
                });
                // leadListArr = Object.values(snapshot.val());
                if (leadListArr && leadListArr.length > 0 && snapshot.numChildren() == count)
                    console.log(snapshot.numChildren(), "countcountcount", count)
                resolve(leadListArr)
            }
            else {

                resolve(leadListArr)
            }
        }, (error) => {
            // 
            reject(error)
        })

    })

}
//get list of all leads

export function getSingleLead(formId) {
    // console.log("1714943718572475",formId)
    // 62evhd3mX1fAb3QiVS31WYUN4FI3
    return new Promise((resolve, reject) => {
        let userId = firebase.auth().currentUser.uid;
        firebase.database().ref('leads').orderByChild('formId').equalTo(formId).on('value', (snapshot) => {
            let leadListArr = []
            let count = 0
            snapshot.forEach(element => {
                let item = element.val();
                item['dataId'] = element.key;
                if (element.key)
                    leadListArr.push(item)
                ++count
            });
            if (leadListArr && leadListArr.length > 0 && count == snapshot.numChildren()) {
                resolve(leadListArr);
            } else {
                resolve(leadListArr);
            }
        }, (error) => {
            reject(error)
        })

    })

}
//Get Lead Data
export const getLeadData = (formId, access_token) => {
    console.log("formId", formId)
    return fetch(`https://graph.facebook.com/v3.0/${formId}/leads?access_token=${access_token}`,
        ['ads_management', 'manage_pages']).then(async (response) => {
            let responseData = await response.json()
            console.log(responseData)
            return responseData;
        }).catch((err) => {
            return err
        })
}


//Het Lead form
export async function getleadgenforms() {
    alert('details')
    const data = await AsyncStorage.getItem("user_info");
    const itemData = JSON.parse(data);
    const facebookID = itemData.facebookID
    const access_token = 'EAAPtlf0iBSkBANErAx0htjIAfKbiUAkOtOic45ZABcqmD4c1shs42iQXkDm8lFnkmRsYASosO8O52BA6hsrM1WztsmEOKwUkCXMbllheTP3Dl9O4gOyp1BiBcyueT1zhCPaH3bDG2iOWiUoiptV8ALALVVPK9ndl9kr2WIg1ldhB520PoKnDXoZCdwar4ZD';
    const pageid = '255350341677993';
    const response = await fetch(`https://graph.facebook.com/v3.0/${pageid}/leadgen_forms?access_token=${access_token}`,
        ['ads_management', 'manage_pages'])

    const json = await response.json();

    console.log(json, "details");
    // this.setState({
    //   FbPageList: json.data
    // })
    // console.log(this.state.FbPageList);
}


//create flag leads
export function addFlagLead(data, id) {
    // console.log(data,"data",id)
    let userId = firebase.auth().currentUser.uid;
    let store_date = new Date();

    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/flag_leads').push().then(function (insertedData) {
            console.log(insertedData.key, "gjhfgjdfinsertedDatainsertedDatainsertedData")
            firebase.database().ref('/flag_leads/' + insertedData.key).update({
                "uid": userId,
                "formId": data.formId,
                "leadId": data.leadId,
                "view": 'unseen',
                "dataId": data.dataId,
                "store_date": "" + store_date,
                id: insertedData.key
            }).then(function () {
                resolve(insertedData.key);
            }, function (err) {
                reject(err);
            });

        }, function (err) {
            console.log(err.message, "fgdgfdg")
            reject(err);
        });
    });
}
//update flag leads
export function flagLeadUpdate(id, data) {

    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leads/' + id).update(data).then(function () {
            resolve('Update flag Successfully');
        }, function (err) {
            console.log(err.message, "fgdgfdg")

            reject(err);
        });

    });

}

//getL Lead Details
export function getLeadDatail(leadId) {
    return new Promise((resolve, reject) => {
        let userId = firebase.auth().currentUser.uid;
        firebase.database().ref('leads').orderByChild('leadId').equalTo(leadId).once('value', (snapshot) => {
            let leadListArr = []
            if (snapshot.exists) {
                snapshot.forEach(element => {
                    let item = element.val();
                    item['dataId'] = element.key;
                    leadListArr.push(item)
                });
            }

            if (leadListArr && leadListArr.length > 0) {
                resolve(leadListArr);
            } else {
                resolve(leadListArr);
            }
        }, (error) => {
            console.log(error, "erorrorooor")
            reject(error)
        })

    })
}

//remove lead
export function removeFlagLead(flagId) {
    return new Promise((resolve, reject) => {
        if (flagId) {
            firebase.database().ref().child('/flag_leads/' + flagId).remove().then(function () {
                resolve('Remove Flag from leaf');
            }, function (err) {
                console.log(err.message, "fgdgfdg")
                reject(err);
            });
        }
    });

}

// Get Flag Lead 

export function getFlagLead(leadId) {
    return new Promise((resolve, reject) => {
        firebase.database().ref('flag_leads').orderByChild('leadId').equalTo(leadId)
            .on('value', (snapshot) => {
                let leadListArr = []
                snapshot.forEach(element => {
                    let item = element.val();
                    item['dataId'] = element.key;
                    leadListArr.push(item)
                });
                if (leadListArr && leadListArr.length > 0) {
                    resolve(leadListArr);
                } else {
                    resolve(leadListArr);
                }
            }, (error) => {
                console.log(error, "erorrorooor")
                reject(error)
            })
    });

}

//update user data
export function updateUserData(data, uid) {

    console.log(data, "datadatadatadatadatadata")
    // let userId = firebase.auth().currentUser.uid;
    return new Promise((resolve, reject) => {
        firebase.database().ref('/users/' + uid).update(data).then(function () {
            resolve('updated user data');
        }, function (err) {
            reject(err);
        });
    });
}

//get badge counts
export function getBadgeCounts() {
    let userId = firebase.auth().currentUser.uid;
    return new Promise((resolve, reject) => {
        firebase.database().ref('/users/' + userId).once('value', (snapshot) => {
            console.log(snapshot.val(), "snapshotsnapshotsnapshot")
            resolve(snapshot.val())
        }, (error) => {
            reject(error)
        })
    });
}
export function listLeadSingleDelete(formId) {
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leads').orderByChild('formId').equalTo(formId).once('value', (snapshot) => {
            // firebase.database().ref('leads').orderByChild('formId').equalTo(id).on('value', (snapshot) => {
            let data = []
            snapshot.forEach(element => {
                let item = element.val();
                item['key'] = element.key;
                data.push(item)
                console.log(data)
            });
            console.log(data)
            if (data && data.length) {
                resolve(data);
            } else {
                resolve(data);
            }
        })
    })

}

//remove lead form
export function removeLeadForm(id) {
    // var id = leadForm.id;
    return new Promise((resolve, reject) => {
        firebase.database().ref('/leadForm/' + id).remove().then(function () {
            resolve('removed leadForm');
        }, function (err) {
            reject(err);
        })
    });
}

// firebase.database().ref('users').child(uid).update(defaults)
export function getCheckLeads(id) {

    return new Promise((resolve, reject) => {
        firebase.database().ref().child('leads').orderByChild('leadId').equalTo(id).on('value', (snapshot) => {
            console.log("hree in  ", snapshot.val())

            let data = []
            snapshot.forEach(element => {
                let item = element.val();
                item['key'] = element.key;
                data.push(item)
                console.log(data)
            });
            console.log("checkLeadForm", data)
            if (data) {
                resolve(data);
            } else {
                resolve('no');
            }
        })
    })
}


//update leads 
export function updateLead(id, data) {
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leads/' + id).update(data).then(function (snapshot) {
            console.log("snapshot,", snapshot)
            resolve('updated lead');
        }, function (err) {
            reject(err);
        });
    });
}


//update form data
export function updateFormData2(id, data) {
    debugger
    console.log(id, data);
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leadForm/' + id).update(data).then(function (snapshot) {
            // console.log("snapshot,", snapshot)
            resolve('updated lead');
        }, function (err) {
            reject(err);
        });
    });
}
//list lead form data



