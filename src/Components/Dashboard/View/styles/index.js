import { Dimensions, StyleSheet, Image } from 'react-native'
const { height, width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    adsLogo: {
        height: height / 4, 
        justifyContent: 'flex-end' 
    },

    textView1: { height: height / 5,
         marginTop: 15 },
    textProps: {
        fontSize: 22,
         fontWeight: 'bold',
          alignSelf: 'center',
           color: '#000000'
    },
    textView2: {
        height: height / 3,
         marginTop: 10,
          paddingLeft: 15, 
          paddingRight: 15,
    },
    buttonView: {
        paddingLeft: 4,
        paddingRight:4,
        marginTop:30,
        paddingBottom:10,
         marginBottom: 15 
    },
    textProps1:{  fontSize: 14,
         alignSelf: 'center',
          color: '#000000' 
        },
    textProps2:{  fontSize: 14, 
        alignSelf: 'center',
         color: '#000000' },
 
})