export const APIBaseUrl = 'https://prodmycryptoswebapi.azurewebsites.net'
export const LoginApiUrl = APIBaseUrl + '/token'
export const SignupApiUrl = APIBaseUrl + '/api/Register/CreateAccount'
import * as firebase from 'firebase'

export const APIConstants = {
    ClientId: 'MyCryptosApp',
    ClientSecret: 'Abc@1235!',
    LoginGrantType: 'password',
    RefreshTokenGrantType: 'refresh_token'
}
export const HerokuConfig = {
    HKURL: 'https://notifyleads.herokuapp.com/' // aka heroku url for leads app
}

export const config = {
    apiKey: "AIzaSyBn9x6JzNHCVxFAi2-gIRjbGd8EnZrlBGc",
    authDomain: "facebooklead-fd7b1.firebaseapp.com",
    databaseURL: "https://facebooklead-fd7b1.firebaseio.com",
    projectId: "facebooklead-fd7b1",
    storageBucket: "facebooklead-fd7b1.appspot.com",
    messagingSenderId: "566226626870"
}


export const GCMConfig = {
    projectNumber: '566226626870', // aka sender id
    // gcm_api_key: 'AIzaSyAKzM_o76ipBObIL0LT8dKy-NBNN6eRyZY'
    gcm_api_key: 'AIzaSyDQr98yBxCP_7aDAvSlwQuX_tg4FU2Kgks'
}