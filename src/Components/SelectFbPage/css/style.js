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
    }
})