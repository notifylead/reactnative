import { Dimensions, StyleSheet, Image } from 'react-native'
const { height, width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    textView1: {
        padding: 2, flexDirection: 'row', justifyContent: 'space-between'
     },
    textProps: {
        fontWeight: 'bold',
         marginTop: 10,
          marginLeft: 5, 
          color: '#000000'
    }
 
})