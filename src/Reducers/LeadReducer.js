import { LEADLIST_ACTION_TYPES, FORMLEAD_ACTION_TYPES } from '../Actions/ActionTypes'
import { REHYDRATE } from 'redux-persist/constants'

const INITIAL_STATE = {
    listLead: [],
    formLead: [],
    fbPages: [],
    flag_badge: 0,
    archieve_badge: 0,
    leads_badge: 0,
    doNotText: '',
    selected: '',
    checkvalue: ''

}

export default (state = INITIAL_STATE, action) => {

    switch (action.type) {
        case LEADLIST_ACTION_TYPES.LEADLIST_REQUEST:
            return { ...state }
        case LEADLIST_ACTION_TYPES.LEADLIST_REQUEST_FAIL:
            return { ...state, listLead: [] }
        case LEADLIST_ACTION_TYPES.LEADLIST_REQUEST_SUCCESS:
            return { ...state, listLead: action.payload.listLead, }
        case FORMLEAD_ACTION_TYPES.FORMLEAD_REQUEST_SUCCESS:
            return { ...state, formLead: action.responseData, }
        case FORMLEAD_ACTION_TYPES.FORMLEAD_REMOVESUCCESS:
            let newFormLead = state.formLead.filter((item, index) => {
                return action.checkedarr.indexOf(item.leadId) == -1;
            })
            return { ...state, formLead: newFormLead, }
        // case 'GET_ALL_FBPAGE' : 
        // return { ...state, fbPages: action.fbPages, }
        case 'UPDATE_FLAG_BADGE':
            return { ...state, flag_badge: action.flag_badge }
        case 'UPDATE_ARCHIVE_BADGE':
            return { ...state, archieve_badge: action.archieve_badge }

        case 'UPDATE_FORMLEAD_DATA':
            let newFormLeadUpdate = state.formLead.map((item, index) => {
                if (action.formLead.indexOf(item.leadId) == -1) {
                    // 
                    console.log(item.leadId, "if reducxer")
                } else {
                    // 
                    item.leadType = action.flagdata.leadType
                    item.flag_id = action.flag_id
                }
                return item;
                // return action.checkedarr.indexOf(item.id) == -1 
            })

            return { ...state, formLead: newFormLeadUpdate, }


        case 'UPDATE_DO_NOT_DISTURB':
            return { ...state, doNotText: action.text, selected: action.selected, checkvalue: action.checkvalue }

        case REHYDRATE: {
            //  console.log(action.payload ,"useruseruseruseruseruseruseruseruseruser")
            return { ...state, ...action.payload.Leads }
        }
        default:
            return state;
    }
}