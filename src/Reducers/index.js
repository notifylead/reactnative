import { combineReducers } from 'redux'
import AuthReducer from './AuthReducer'
import LeadReducer from './LeadReducer'

// Redux
export default combineReducers({
 // Auth: AuthReducer,
 Leads: LeadReducer
})
