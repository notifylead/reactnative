import firebase from 'firebase';
import { AsyncStorage } from 'react-native'
export function listArchieveLeads(id) {
    return new Promise((resolve, reject) => {

        // firebase.database().ref('/lead/').remove().then(function () {
        //     resolve('removed archieve_leads');
        // }, function (err) {
        //     reject(err);
        // })
        firebase.database().ref().child('/archieve_leads').orderByChild('uid').equalTo(id).once('value').then(function (snapshot) {
            var seen = {}
            let archievelead_data = []

            if (snapshot && snapshot.val()) {
                snapshot.forEach(element => {
                    let item = element.val();
                    item['key'] = element.key;
                    archievelead_data.push(item)
                    // if (seen.hasOwnProperty(item.leadId)) {
                    //     return false;
                    // } else {
                    //     seen[item.leadId] = true;
                    //     return true;
                    // }
                });
            }
            console.log(archievelead_data)
            resolve(archievelead_data)
        })
    });
}

export function archieveListLeadSingle(formId) {
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/archieve_leads').orderByChild('formId').equalTo(formId).on('value', (snapshot) => {
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

//remove archieve lead
export function deleteArchieveLead(lead) {
    // if (lead && deleteItem === 'yes') {
    //     var id = lead.id;
    // }
    // else {
    //     id = null;
    // }
    // var id = leadForm.id;
    return new Promise((resolve, reject) => {
        firebase.database().ref('/archieve_leads/' + lead.key).remove().then(function () {
            resolve('removed archieve_leads');
        }, function (err) {
            reject(err);
        })
    });
}

export function archieveLead(lead) {
    var id = lead.key;
    return new Promise((resolve, reject) => {
        firebase.database().ref('/leads/' + id).remove().then(function () {
            resolve('removed archieve_leads');
        }, function (err) {
            reject(err);
        })
    });
}




