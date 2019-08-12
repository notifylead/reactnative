import { Dimensions, StyleSheet, Image } from 'react-native'
const { height, width } = Dimensions.get('window');
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white', justifyContent: 'center', alignContent: 'center',
    },
    FlatListView: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    okButton: {
        bottom: 0,
        margin: 30,
        right: 0,
        left: 0,
        padding: 10,
        justifyContent: 'center', backgroundColor: '#5890FF',
        borderRadius: 5
    },
    flatListPages: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1
    },
    centerSection: {
        flex: 0.8,
        padding: 10,
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    rightSection: {
        flex: 0.1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    leftSection: {
        flex: 0.1,
        padding: 10
    },
    okButtonView: { justifyContent: 'center', alignItems: 'center' },
    okText: { color: 'white', fontSize: 16 },
    leadAddforms: {
        flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'center',
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1
    },
    checkBox:{ backgroundColor: 'white', borderWidth: 0 }
})