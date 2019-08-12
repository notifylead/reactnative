import React, { Component } from 'react'

import {
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    ActivityIndicator,
} from 'react-native'
import { Header, Icon } from 'react-native-elements'
//import Icon from 'react-native-vector-icons/FontAwesome';
const hitSlop = { top: 15, bottom: 15, left: 15, right: 15 };

class HeaderComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    leftComponent() {
        return (
            <TouchableOpacity hitSlop ={hitSlop} onPress={this.props.navigateClick} >
                <View style={{ alignItems: 'center' }}>
                    <Icon name={this.props.iconame} size={28} color='#5890FF' />
                </View>
            </TouchableOpacity>
        )
    }
    rightComponent() {
        return (
            <TouchableOpacity  hitSlop ={hitSlop} onPress={this.props.cancel} >
                <View style={{ alignItems: 'center' ,justifyContent:'center'}}>
                    {/* <Icon name={this.props.iconame} size={30} color='#5890FF' /> */}
                    <Text style={{ color: '#5890FF', fontSize: 18,fontFamily:'Roboto-Bold'  }}>{this.props.text}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <Header
                placement="left"
                leftComponent={this.leftComponent()}
                centerComponent={{ text: this.props.title, style: { color: '#000', fontSize: 16, fontWeight: 'bold', } }}
                rightComponent={this.rightComponent()}
                backgroundColor={'#F8F8F8'}
            />
        );
    }
}

export default HeaderComponent
