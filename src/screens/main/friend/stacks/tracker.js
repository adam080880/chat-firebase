import React from 'react';
import MapView, {Marker} from 'react-native-maps';
import {StyleSheet, Alert, Image, Text} from 'react-native';
import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import GeoLocation from '@react-native-community/geolocation';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {connect} from 'react-redux';

const mapStateToProps = (state) => ({
  auth: state.auth,
});

class Tracker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: 0.7893,
      longitude: 113.9213,
      observer: false,
      observerUser: false,
      dataUser: false,
      observerFriend: false,
      friends: [],
    };
  }

  componentDidMount() {
    check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((res) => {
      switch (res) {
        case RESULTS.UNAVAILABLE:
          request(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ).then((result) => {});
          break;
        case RESULTS.DENIED:
          request(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ).then((result) => {});
          break;
        case RESULTS.GRANTED:
          GeoLocation.getCurrentPosition(
            (initPosition) => {
              this.setState(
                {
                  observerUser: firestore()
                    .collection('userDetails')
                    .where('uid', '==', auth()._user.uid)
                    .onSnapshot((querySnapshot) => {
                      querySnapshot.forEach((val) => {
                        this.setState(
                          {
                            dataUser: {...{id: val.id}, ...val.data()},
                          },
                          () => {
                            firestore()
                              .collection('userDetails')
                              .doc(val.id)
                              .update({
                                latitude: initPosition.coords.latitude,
                                longitude: initPosition.coords.longitude,
                              });
                          },
                        );
                      });
                    }),
                  latitude: initPosition.coords.latitude,
                  longitude: initPosition.coords.longitude,
                  observerFriend: firestore()
                    .collection('friends')
                    .where('fromUid', '==', auth()._user.uid)
                    .onSnapshot((doc) => {
                      doc.forEach((getFriends) => {
                        if (getFriends.data().toUid) {
                          getFriends
                            .data()
                            .toUid.onSnapshot((biodataFriend) => {
                              const friends = [
                                ...[
                                  {
                                    ...biodataFriend.data(),
                                    ...getFriends.data(),
                                  },
                                ],
                                ...this.state.friends.filter(
                                  (val) => val.uid !== biodataFriend.data().uid,
                                ),
                              ];
                              this.setState({
                                friends: friends.sort((a, b) =>
                                  a === b ? 0 : a ? -1 : 1,
                                ),
                                realFriends: friends.sort((a, b) =>
                                  a === b ? 0 : a ? -1 : 1,
                                ),
                              });
                            });
                        }
                      });
                    }),
                },
                () => {
                  this.setState({
                    observer: GeoLocation.watchPosition((position) => {
                      this.setState(
                        {
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude,
                        },
                        () => {
                          firestore()
                            .collection('userDetails')
                            .doc(this.props.auth.detail.id)
                            .update({
                              latitude: this.state.latitude,
                              longitude: this.state.longitude,
                            });
                        },
                      );
                    }),
                  });
                },
              );
            },
            (e) => {
              Alert.alert(e.message);
              this.props.navigation.goBack();
            },
          );
          break;
        case RESULTS.BLOCKED:
          request(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ).then((result) => {});
          break;
        default:
          console.log(res);
      }
    });
  }

  componentWillUnmount() {
    this.state.observerUser();
    this.state.observerFriend();
    GeoLocation.clearWatch(this.state.observer);
  }

  render() {
    return (
      <MapView
        style={styled.f1}
        initialRegion={{
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          latitudeDelta: 0.011,
          longitudeDelta: 0.011,
        }}>
        {this.state.dataUser && (
          <Marker
            coordinate={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
            }}>
            {this.state.dataUser.avatar && (
              <Image
                style={{...{width: 50, height: 50, borderRadius: 25}}}
                source={{uri: this.state.dataUser.avatar}}
              />
            )}
            {!this.state.dataUser.avatar && (
              <Text
                style={{
                  ...{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: 'white',
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    fontWeight: 'bold',
                    fontSize: 20,
                    color: '#2C3E66',
                    elevation: 3,
                  },
                }}>
                {this.state.dataUser.name.slice(0, 2).toUpperCase()}
              </Text>
            )}
          </Marker>
        )}

        {this.state.friends.map((val, index) => {
          val.latitude && (
            <Marker
              coordinate={{
                latitude: val.latitude,
                longitude: val.longitude,
              }}>
              {val.avatar && (
                <Image
                  style={{...{width: 50, height: 50, borderRadius: 25}}}
                  source={{uri: val.avatar}}
                />
              )}
              {!val.avatar && (
                <Text
                  style={{
                    ...{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: 'white',
                      textAlign: 'center',
                      textAlignVertical: 'center',
                      fontWeight: 'bold',
                      fontSize: 20,
                      color: '#2C3E66',
                      elevation: 3,
                    },
                  }}>
                  {val.name.slice(0, 2).toUpperCase()}
                </Text>
              )}
            </Marker>
          );
        })}
      </MapView>
    );
  }
}

export default connect(mapStateToProps)(Tracker);

const styled = StyleSheet.create({
  f1: {flex: 1},
});
