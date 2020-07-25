import React from 'react';
import MapView from 'react-native-maps';
import {StyleSheet} from 'react-native';

export default class Tracker extends React.Component {
  render() {
    return (
      <MapView
        style={styled.f1}
        region={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    );
  }
}

const styled = StyleSheet.create({
  f1: {flex: 1},
});
