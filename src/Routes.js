import React from 'react'
import {
  DrawerNavigator,
  StackNavigator,
  TabNavigator,
  addNavigationHelpers
} from 'react-navigation';
import {Dimensions} from 'react-native'
const {width,height} = Dimensions.get('window')
import Login from './Components/Auth/View/Login'
import Home from './Components/Dashboard/View/Home'
import SelectFbPage from './Components/SelectFbPage/SelectFbPage'
import SelectLeadAddForm from './Components/SelectLeadAddForm/SelectLeadAddForm'
import Appsettings from './Components/Settings/App Settings/Appsettings';
import SideBar from './Components/Sidebar'
import Splash from './Components/Splash'
import DND from './Components/Settings/App Settings/DND/Donotdisturb';
import AllLeads from './Components/All Leads/AllLeads';
import Viewlead from './Components/All Leads/Lead Detail/Leaddetail';
import FlagLead from './Components/All Leads/Flag Lead/flaglead';
import ArchivedLead from './Components/All Leads/Archived Lead/ArchivedLead';
import Web from './Components/WebView/WebView'
import Subscription from './Components/Subscriptions/Subscription';
// import { Dimensions } from '../../../Library/Caches/typescript/2.6/node_modules/@types/react-native';
//Drawer
// const LeadStack = () => {
//  return StackNavigator({
  
//     },
//   }, {
//     initialRouteName: 'AllLeads',
//   })

// }
export const Drawer = (showStarted) => {
return DrawerNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: {
        header: null
      }
    },
    SelectFbPage: {
      screen: SelectFbPage,
      navigationOptions: {
        header: null
      }
    },
    SelectLeadAddForm: {
      screen: SelectLeadAddForm,
      navigationOptions: {
        header: null
      }
    },
    Appsettings: {
      screen: Appsettings,
      navigationOptions: {
        header: null
      },
    },
    DND: {
      screen: DND,
      navigationOptions: {
        header: null
      },
    },
  
    Subscription: {
      screen: Subscription,
      navigationOptions: {
        header: null
      },
    },
    AllLeads: {
      screen: AllLeads,
      navigationOptions: {
        header: null
      },
    },
    
    FlagLead: {
      screen: FlagLead,
      navigationOptions: {
        header: null
      },
    },
    ArchivedLead: {
      screen: ArchivedLead,
      navigationOptions: {
        header: null
      },
    },
    Viewlead: {
      screen: Viewlead,
      navigationOptions: {
        header: null
      },
    },
    Login: {
      screen: Login,
      navigationOptions: {
        header: null
      },
    },
 

  },
  {
    initialRouteName: showStarted ? "AllLeads" : "Home",
    contentOptions: {
      activeTintColor: "#fff"
    },
    drawerWidth:width-50,
    contentComponent: props => <SideBar {...props} />
  }
);
}
//Root navigator
export const createRootNavigator = (user,showStarted) => {
console.log(user)
  return StackNavigator({
    Splash: {
      screen: Splash,
      navigationOptions: {
        header: null
      },
    },
    Drawer: {
      screen: Drawer(showStarted),
      navigationOptions: {
        header: null
      },
    },
    Login: {
      screen: Login,
      navigationOptions: {
        header: null
      },
    },
    Web: {
      screen: Web,
      navigationOptions: {
        header: null
      },
    },
    // SelectFbPage: {
    //   screen: SelectFbPage,
    //   navigationOptions: {
    //     header: null
    //   }
    // },
    // SelectLeadAddForm: {
    //   screen: SelectLeadAddForm,
    //   navigationOptions: {
    //     header: null
    //   }
    // },
    DND: {
      screen: DND,
      navigationOptions: {
        header: null
      },
    },
    Appsettings: {
      screen: Appsettings,
      navigationOptions: {
        header: null
      },
    },
  
    // AllLeads: {
    //   screen: AllLeads,
    //   navigationOptions: {
    //     header: null
    //   },
    // },
    // Viewlead: {
    //   screen: Viewlead,
    //   navigationOptions: {
    //     header: null
    //   },
    // },
    // FlagLead: {
    //   screen: FlagLead,
    //   navigationOptions: {
    //     header: null
    //   },
    // },
    // ArchivedLead: {
    //   screen: ArchivedLead,
    //   navigationOptions: {
    //     header: null
    //   },
    // },
    // SelectLeadAddForm: {
    //   screen: SelectLeadAddForm,
    //   navigationOptions: {
    //     header: null
    //   }
    // },

  }, {
      initialRouteName: (user) ? "Drawer" : "Login",
    })
}
