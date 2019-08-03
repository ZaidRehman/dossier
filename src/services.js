import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export async function requestLocationPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                'title': 'Example App',
                'message': 'Example App access to your location '
            }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can use the location")
            return true;
        } else {
            console.log("location permission denied")
            return false;
        }
    } catch (err) {
        console.warn(err)
    }
}

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        // saving error
        console.log(e)
    }
}

export const getPersistedLocations = async () => {
    const value = await AsyncStorage.getItem('locations');
    if (value) {
        return JSON.parse(value)
    }
    return []
}
