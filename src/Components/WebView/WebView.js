import React, { Component } from 'react';
import { WebView, ActivityIndicator, Platform,SafeAreaView, TouchableOpacity, StyleSheet, TextInput, View } from 'react-native';
import { Header, Icon } from 'react-native-elements'
export default class Web extends Component {

    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props);
        this.state = {
            data: 'hgdajgdagddgadgjag'
        }
    }
    ActivityIndicatorLoadingView() {

        return (

            <ActivityIndicator
                color='#5890ff'
                size='large'
                style={styles.ActivityIndicatorStyle}
            />
        );
    }




    leftComponent() {
        return (
            <TouchableOpacity onPress={() => this.props.navigation.goBack()} >
                <View style={{ alignItems: 'center', width: 70 }}>
                    <Icon name="chevron-left" size={30} color='grey' />
                </View>
            </TouchableOpacity>
        )
    }


    rightComponent() {
        return (
            <TouchableOpacity onPress={() => this.props.navigation.goBack()} >
                <View style={{ alignItems: 'center', justifyContent: 'center', width: 70 }}>
                    <Icon name="close" size={25} color='grey' />

                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, }}>
            <View style={{ flex: 1 }}>
                <Header
                    placement="left"
                    // leftComponent={this.leftComponent()}
                    rightComponent={this.rightComponent()}
                    backgroundColor={'#F8F8F8'}
                    // outerContainerStyles={{ height: 45 }}
                />


                {/* <Header
                    placement="left"

                    rightComponent={{ icon: 'close', color: '#000000' }}
                    backgroundColor={'#F8F8F8'}
                    outerContainerStyles={{ height: 50 }}
                /> */}
                <WebView
                    source={{ uri: this.props.navigation.state.params.data }}
                    style={styles.WebViewStyle}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    renderLoading={this.ActivityIndicatorLoadingView}
                    startInLoadingState={true}
                />
            </View>
            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create(
    {

        WebViewStyle:
            {
                marginTop: (Platform.OS) === 'ios' ? 20 : 0
            },

        ActivityIndicatorStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center'

        }
    });