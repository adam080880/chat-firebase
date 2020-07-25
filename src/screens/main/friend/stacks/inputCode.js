import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class InputCode extends React.Component {
  state = {
    isLoading: false,
    code: '',
  };

  submit = async (e) => {
    this.setState({
      isLoading: true,
    });
    try {
      if (this.state.code.length === 0) {
        throw 'Code must be filled';
      }

      const _me = await firestore()
        .collection('userDetails')
        .where('uid', '==', auth()._user.uid)
        .get();
      const _target = await firestore()
        .collection('userDetails')
        .where('code', '==', this.state.code)
        .get();

      let me = {};
      let target = {};

      await _me.forEach((doc) => {
        me = {id: doc.id, ...doc.data()};
      });

      await _target.forEach((doc) => {
        target = {id: doc.id, ...doc.data()};
      });

      if (me.uid === target.uid) {
        throw "You can't add yourself as friend";
      }

      const checkExist = await firestore()
        .collection('friends')
        .where('fromUid', '==', me.uid)
        .where('toUid', '==', target.uid)
        .get();

      if (checkExist.size > 0) {
        throw 'You already as friend';
      }

      await firestore()
        .collection('friends')
        .add({
          fromUid: me.uid,
          toUid: firestore().doc('userDetails/' + target.id),
          chatId: me.uid + target.uid,
        });
      await firestore()
        .collection('friends')
        .add({
          fromUid: target.uid,
          toUid: firestore().doc('userDetails/' + me.id),
          chatId: me.uid + target.uid,
        });

      Alert.alert('Success', 'Success add friend');
    } catch (err) {
      Alert.alert('Error add friend', err);
    } finally {
      this.setState({
        isLoading: false,
      });
    }
  };

  render() {
    return (
      <View style={{...{backgroundColor: '#F7F8F3', flex: 1, padding: 21}}}>
        <TextInput
          style={styled.input}
          onChangeText={(code) => this.setState({code})}
          placeholder={'Code'}
        />
        <View style={styled.control}>
          <TouchableOpacity
            style={styled.cta}
            disabled={this.state.isLoading}
            onPress={this.submit}>
            {this.state.isLoading && (
              <ActivityIndicator color={'white'} size={'small'} />
            )}
            {!this.state.isLoading && <Text style={styled.textCta}>ADD</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styled = StyleSheet.create({
  input: {
    borderBottomColor: '#2C3E66',
    borderBottomWidth: 1,
    color: '#2C3E66',
    marginBottom: 29.5,
    width: '100%',
  },
  control: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  textCta: {
    color: 'white',
    fontWeight: 'bold',
  },
  cta: {
    backgroundColor: '#FE6F5F',
    marginTop: 29.5,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 3,
  },
});
