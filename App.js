/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  PermissionsAndroid,
  Button,
  TextInput,
  Clipboard
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-community/async-storage';

const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (e) {
    // saving error
    console.log(e)
  }
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

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

const App = () => {
  const [position, setPosition] = useState();
  const [delay, setDelay] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isTextVisible, setTextVisibility] = useState(false);

  const writeToClipboard = async (val) => {
    await Clipboard.setString(val);
    alert('Copied to Clipboard!');
  };

  const stop = () => {
    setPosition(null);
    setDelay(null);
  }
  const fetchLoc = async () => {
    if (await requestLocationPermission()) {
      Geolocation.getCurrentPosition(
        (p) => {
          if (!position) {
            setLocations(locations.concat(p));
          } else if (
              position.coords.longitude != p.coords.longitude || 
              position.coords.latitude != p.coords.latitude
            ) {
               setLocations(locations.concat(p));
            }
            setPosition(p);
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }
  const getPersistedLocations = async () => {
    const value = await AsyncStorage.getItem('locations');
   if(value) {
      setLocations(JSON.parse(value))
    }
  }

  useEffect(() => {
    getPersistedLocations()
  }, [])
  useEffect(() => {
    storeData('locations', JSON.stringify(locations))
  }, [locations])
  useInterval(() => {
    fetchLoc();
  }, delay);
  
  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Position</Text>
              <Text style={styles.sectionDescription}>
                longitude: <Text style={styles.highlight}>{position && position.coords.longitude}</Text>
              </Text>
              <Text style={styles.sectionDescription}>
                latitude: <Text style={styles.highlight}>{position && position.coords.latitude}</Text>
              </Text>
              <Text style={styles.sectionDescription}>
                time: <Text style={styles.highlight}>{position && new Date(position.timestamp).toString()}</Text>
              </Text>
              <Button
                onPress={() => setDelay(5000)}
                title="Start"
                color="#841584"
                accessibilityLabel="Start"
              />
              <Button
                onPress={stop}
                title="Stop"
                color="#841584"
                accessibilityLabel="Stop"
              />
              <Button
                style={styles.utilityButton}
                onPress={() => setTextVisibility(!isTextVisible)}
                title={`${isTextVisible && 'Hide' || 'Show'} Collected Locations`}
                accessibilityLabel="StShow Locationsop"
              />
              <Button
                style={styles.utilityButton}
                onPress={() => writeToClipboard(JSON.stringify(locations))}
                title="Copy Locations"
                accessibilityLabel="StShow Locationsop"
              />
              {isTextVisible && (
                <TextInput
                  style={{ height: 200, borderColor: 'gray', borderWidth: 1 }}
                  multiline={true}
                  numberOfLines={4}
                  value={JSON.stringify(locations)}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  utilityButton: {
    marginTop: 8,
  }
});

export default App;
