/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  TextInput,
  Clipboard
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import RNLocation from "react-native-location";
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { useInterval } from './src/hooks';
import { requestLocationPermission, storeData, getPersistedLocations } from './src/services';

const App = () => {
  const [position, setPosition] = useState();
  const [delay, setDelay] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isTextVisible, setTextVisibility] = useState(false);

  const writeToClipboard = async (val) => {
    await Clipboard.setString(val);
    alert('Copied to Clipboard!');
  };

  const toggle = () => {
    if (delay) {
      setPosition(null);
      setDelay(null);
    } else {
      setDelay(1000)
    }
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
  const clearLocations = () => {
    setLocations([])
  }

  useEffect(() => {
    getPersistedLocations().then(res => {
      setLocations(res);
    });
    RNLocation
      .configure({
        distanceFilter: 0.2,
        desiredAccuracy: {
          ios: "best",
          android: "highAccuracy"
        },
        androidProvider: "playServices",
      })
      .then(() => RNLocation.requestPermission({
        ios: "whenInUse",
        android: {
          detail: "fine",
          rationale: {
            title: "Location permission",
            message: "We use your location to demo the library",
            buttonPositive: "OK",
            buttonNegative: "Cancel"
          }
        }
      }))
      .then(granted => {
        if (granted) {
          RNLocation.subscribeToLocationUpdates(ls => {
            console.log(ls)
            setPosition(ls[0])
            setLocations(locations.concat(ls));
          });
        }
      })
      .catch(err => {
        alert(JSON.stringify(err));
      });
  }, [])
  useEffect(() => {
    storeData('locations', JSON.stringify(locations));
  }, [locations]);
  useInterval(() => {
    // fetchLoc();
    // console.log('here')
    // RNLocation
    //   .configure({
    //     desiredAccuracy: {
    //       ios: "best",
    //       android: "highAccuracy"
    //     },
    //     androidProvider: "playServices",
    //   })
    //   .then(() => RNLocation.requestPermission({
    //     ios: "whenInUse",
    //     android: {
    //       detail: "fine",
    //       rationale: {
    //         title: "Location permission",
    //         message: "We use your location to demo the library",
    //         buttonPositive: "OK",
    //         buttonNegative: "Cancel"
    //       }
    //     }
    //   }))
    //   .then(granted => {
    //     if (granted) {
    //       RNLocation
    //         .getLatestLocation({ timeout: 60000 })
    //         .then(p => {
    //           console.log(p)
    //           if (!position) {
    //             setLocations(locations.concat(p));
    //           } else if (
    //             position.longitude != p.longitude ||
    //             position.latitude != p.latitude
    //           ) {
    //             setLocations(locations.concat(p));
    //           }
    //           setPosition(p);
    //         });
    //     }
    //   })
    //   .catch(err => {
    //     alert(JSON.stringify(err));
    //   });
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
                longitude: <Text style={styles.highlight}>{position && position.longitude}</Text>
              </Text>
              <Text style={styles.sectionDescription}>
                latitude: <Text style={styles.highlight}>{position && position.latitude}</Text>
              </Text>
              <Text style={styles.sectionDescription}>
                time: <Text style={styles.highlight}>{position && new Date(position.timestamp).toString()}</Text>
              </Text>
              {/* <Button
                onPress={toggle}
                title={delay ? "Pause" : "Start"}
                color={delay ? "#87090f" : "#098747"}
              /> */}
              <Button
                style={styles.utilityButton}
                onPress={() => writeToClipboard(JSON.stringify(locations))}
                title="Copy Locations"
                accessibilityLabel="StShow Locationsop"
              />
              <Button
                style={styles.utilityButton}
                onPress={() => setTextVisibility(!isTextVisible)}
                title={`${isTextVisible && 'Hide' || 'Show'} Collected Locations`}
                accessibilityLabel="StShow Locationsop"
              />
              {isTextVisible && (
                <TextInput
                  style={{ height: 200, borderColor: 'gray', borderWidth: 1 }}
                  multiline={true}
                  numberOfLines={4}
                  value={JSON.stringify(locations)}
                  editable={false}
                />
              )}
              <Button
                style={styles.utilityButton}
                onPress={clearLocations}
                title="Clear Locations"
                accessibilityLabel="Clear Locations"
              />
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
    color: '#9e9e9e'
  }
});

export default App;
