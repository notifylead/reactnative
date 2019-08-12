import firebase from 'firebase';
import { AsyncStorage } from 'react-native'
export function listFlagLeads(id) {
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/flag_leads').orderByChild('uid').equalTo(id).once('value').then(function (snapshot) {
            let seen = {}
            let lead_data = []
        
            if (snapshot.exists()) {
                let count = 0
                snapshot.forEach(element => {
                    ++count
                    let item = element.val();
                    item['key'] = element.key;
                    lead_data.push(item)
                });
                // leadListArr = Object.values(snapshot.val());
                if (lead_data && lead_data.length > 0 && snapshot.numChildren() == count)
                    resolve(lead_data)
                 } 
                 else {
                resolve(lead_data)
                 }
        })
    });
}

export function flagListLeadSingle(formId) {
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/flag_leads').orderByChild('formId').equalTo(formId).on('value', (snapshot) => {
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

//remove flag lead
export function deleteFlagLead(lead, deleteItem) {
    // if (lead && deleteItem === 'yes') {
    //     var id = lead.id;
    // }
    // else {
    //     id = null;
    // }
    return new Promise((resolve, reject) => {
        firebase.database().ref('/flag_leads/' + lead.id).remove().then(function () {
            resolve('removed flag_leads');
        }, function (err) {
            reject(err);
        })
    });

}
