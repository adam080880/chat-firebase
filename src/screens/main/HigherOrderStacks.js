import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {Alert} from 'react-native';
import {PERMISSIONS, RESULTS, request, check} from 'react-native-permissions';
import GeoLocation from '@react-native-community/geolocation';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import TabStack from './index';
import ChatStack from './chat/stacks/chat';
import ProfileStack from './friend/stacks/profile';
import TrackerStack from './friend/stacks/tracker';
import EditProfile from './friend/stacks/editProfile';
import InputCode from './friend/stacks/inputCode';

const Stack = createStackNavigator();

export default class HigherOrderStacks extends React.Component {
  TabStackInjected = (changePage) => (props) => (
    <TabStack changePage={changePage} {...props} />
  );

  state = {
    latitude: 0.7893,
    longitude: 113.9213,
    latitudeDelta: 0.011,
    longitudeDelta: 0.011,
    observer: false,
    observerUser: false,
    dataUser: false,
    observerFriend: false,
    friends: [],
  };

  handleMove = () => {
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
  };

  componentDidMount() {
    this.handleMove();
  }

  componentWillUnmount() {
    this.state.observerUser();
    GeoLocation.clearWatch(this.state.observer);
  }

  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="TabStacks"
          options={{title: 'JUST.TYPE'}}
          component={this.TabStackInjected(this.props.changePage)}
        />
        <Stack.Screen
          name="ChatStack"
          component={ChatStack}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ProfileStack"
          component={ProfileStack}
          options={{
            title: 'Profile',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TrackerStack"
          component={TrackerStack}
          options={{
            title: 'Tracker',
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            title: 'Edit Profile',
          }}
        />
        <Stack.Screen
          name="AddFriend"
          component={InputCode}
          options={{
            title: 'Input Friend Code',
          }}
        />
      </Stack.Navigator>
    );
  }
}
