import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  View,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import fireStore from '@react-native-firebase/firestore';

import Icon from 'react-native-vector-icons/AntDesign';

export default class Settings extends React.Component {
  logout = (e) => {
    try {
      const timee = new Date().toLocaleTimeString();
      fireStore()
        .collection('userDetails')
        .where('uid', '==', auth()._user.uid)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach(async (documentSnapshot) => {
            fireStore()
              .collection('userDetails')
              .doc(documentSnapshot.id)
              .update({
                isLogin: false,
                lastOnline: timee,
              });
            await auth().signOut();
          });
        });
      Alert.alert('Logout success', 'Logout success');
    } catch (exception) {
      Alert.alert('Logout error', 'Error when trying to logout');
      console.log(exception);
    }
  };
  render() {
    return (
      <ScrollView style={styled.container}>
        <TouchableOpacity
          style={styled.card}
          onPress={(e) => this.props.navigation.navigate('ProfileStack')}>
          <View style={styled.cardBody}>
            <Icon
              name="user"
              size={30}
              style={styled.cardIcon}
              color={'#2C3E66'}
            />
            <Text>Profile</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styled.card} onPress={this.logout}>
          <View style={styled.cardBody}>
            <Icon
              name="logout"
              size={30}
              style={styled.cardIcon}
              color={'#2C3E66'}
            />
            <Text>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styled = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F3',
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'white',
    borderBottomColor: '#F7F8F3',
    borderBottomWidth: 2,
  },
  cardBody: {flexDirection: 'row', alignItems: 'center'},
  cardIcon: {marginRight: 15},
});
