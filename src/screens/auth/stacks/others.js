import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/AntDesign';

export default class Others extends React.Component {
  render() {
    return (
      <ScrollView style={styled.container}>
        <TouchableOpacity style={styled.card}>
          <View style={styled.cardBody}>
            <Icon
              name="google"
              size={30}
              style={styled.cardIcon}
              color={'#2C3E66'}
            />
            <Text>Sign in with Google</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styled.card}
          onPress={(e) => this.props.navigation.navigate('register')}>
          <View style={styled.cardBody}>
            <Icon
              name="adduser"
              size={30}
              style={styled.cardIcon}
              color={'#2C3E66'}
            />
            <Text>Register account</Text>
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
