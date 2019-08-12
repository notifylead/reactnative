import React, { Component } from 'react';
import { Text, View, ScrollView,SafeAreaView } from 'react-native';
import { Button } from 'react-native-elements'
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import Header from '../../../../Common/Header';

export default class DND extends Component {

  static navigationOptions = {
    header: null
  }

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      text: ''
    }
  }


  onSelect(index, value) {
    this.setState({
      text: `${value}`
    })
  }

  /*onSelect(index, value){
    if(index==0){
      
      this.setState({
      text: 'Off',
    })
  	
    }
    if(index==1){
     this.setState({
      text: '20 Minutes',
    })
    }
    }*/

  gotoAppsettings = (index, value) => {
    this.props.navigation.navigate('Appsettings', { time: this.state.text })
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1,}}>
      <View style={{ flex: 1 ,backgroundColor:'#ffffff'}}>
        <Header title="Do Not Disturb" navigateClick={() => this.props.navigation.navigate("DrawerOpen")} iconame='menu' />

        <ScrollView>
          <RadioGroup onSelect={(index, value) => this.onSelect(index, value)} selectedIndex={0} style={{ flexDirection: 'column', paddingLeft: 20 }}>

            <RadioButton index={0} value={'OFF'}>
              <Text>OFF</Text>
            </RadioButton>
            <RadioButton index={1} value={'20 Minutes'}>
              <Text>20 Minutes</Text>
            </RadioButton>

            <RadioButton index={2} value={'1 Hour'}>
              <Text>1 Hour</Text>
            </RadioButton>
            <RadioButton index={3} value={'2 Hours'}>
              <Text>2 Hours</Text>
            </RadioButton>
            <RadioButton index={4} value={'4 Hours'}>
              <Text>4 Hours</Text>
            </RadioButton>
            <RadioButton index={5} value={'8 Hours'}>
              <Text>8 Hours</Text>
            </RadioButton>
            <RadioButton index={6} value={'24 Hours'}>
              <Text>24 Hours</Text>
            </RadioButton>

            <RadioButton index={7} value={'ON'}>
              <Text>ON(untill turned off manually)</Text>
            </RadioButton>

          </RadioGroup>
        </ScrollView>
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, margin: 10 }}>
          <Button
            title='OK'
            color='white'
            onPress={this.gotoAppsettings}

            buttonStyle={{
              backgroundColor: "#5890ff",
              borderRadius: 5
            }}
            textStyle={{ fontWeight: 'bold' }}
          />
        </View>

      </View>
      </SafeAreaView>
    );
  }
}
