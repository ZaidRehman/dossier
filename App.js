/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment, useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  PermissionsAndroid,
  Button
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {
  Header,
  Colors,
} from 'react-native/Libraries/NewAppScreen';

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

export async function requestLocationPermission() 
{
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
  const [position, setPosition] = useState(0);
  const [delay, setDelay] = useState(1000);
  const fetchLoc = async () => {
    if (await requestLocationPermission()) {
      Geolocation.getCurrentPosition(
          (p) => {
              console.log(p);
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
          <Header />
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
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
                onPress={() => setDelay(1000)}
                title="Start"
                color="#841584"
                accessibilityLabel="Start"
              />
              <Button
                onPress={() => setDelay(null)}
                title="Stop"
                color="#841584"
                accessibilityLabel="Stop"
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
});

export default App;
