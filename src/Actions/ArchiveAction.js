import firebase from 'firebase';

//create archieve leads
export function addArchieveLead(data, usId) {
    let userId = firebase.auth().currentUser.uid;
    let store_date = new Date();
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/archieve_leads').push({
            "uid": userId,
            "formId": data.formId,
            "leadId": data.leadId,
            "view": 'unseen',
            "dataId": data.dataId,
            "store_date": "" + store_date
        }).then(function (insertedData) {
            console.log(insertedData.key, "gjhfgjdfinsertedDatainsertedDatainsertedData")
            firebase.database().ref('/archieve_leads').update({
                id: insertedData.key

            }).then(function () {
                var res = {
                    "formId": data.formId,
                    "id": insertedData.key,
                    "leadId": data.leadId,
                    "uid": userId,
                    "view": 'unseen'
                }
                resolve(res)
            }, function (err) {
                reject(err);
            });

        }, function (err) {
            console.log(err.message, "fgdgfdg")

            reject(err);
        });
    });

}
export function archiveLeadUpdate(id, data) {
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/leads/' + id).update(data).then(function () {
            resolve('updated form lead data');
        }, function (err) {
            console.log(err.message, "fgdgfdg")

            reject(err);
        });

    });

}

//remove lead
export function archieveLead(lead, deleteItem) {
    let id
    if (lead && deleteItem === 'yes') {
        id = lead.dataId;
    }
    else {
        id = null;
    }
    return new Promise((resolve, reject) => {
        if (id) {
            firebase.database().ref().child('/leads/' + id).remove().then(function () {
                console.log(id,"idididididid lead key ")
                resolve('Remove data from archieve_leads');
            }, function (err) {
                console.log(err.message, "error occur")
                reject(err);
            });
        }
    });
}

//remove lead
export function removeFlagLeadId(res) {
    console.log('res', res);
    let id = res;
    return new Promise((resolve, reject) => {
        firebase.database().ref().child('/flag_leads/' + id).remove().then(function () {
            console.log('deleted');
            resolve('removed leadForm');
        }, function (err) {
            reject(err);
        });
    });
}