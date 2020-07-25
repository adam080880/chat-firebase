import React from 'react';
import {
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import fireStore from '@react-native-firebase/firestore';

export default class EditProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: auth()._user.uid,
      isLoading: false,
      subscribe: false,
      data: false,
      id: '',
      name: '',
      phone: '',
    };
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      subscribe: fireStore()
        .collection('userDetails')
        .where('uid', '==', this.state.uid)
        .onSnapshot((querySnapshot) => {
          querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            this.setState({
              id: documentSnapshot.id,
              data: data,
              name: data.name,
              phone: data.phone,
            });
          });
        }),
    });
  }

  componentWillUnmount() {
    return this.state.subscribe();
  }

  editProfile = (e) => {
    this.setState({isLoading: true});
    fireStore()
      .collection('userDetails')
      .doc(this.state.id)
      .update({
        name: this.state.name,
        phone: this.state.phone,
      })
      .then(() => {
        Alert.alert('Update success');
      })
      .catch(() => {
        Alert.alert('Update failed');
      })
      .finally(() => {
        this.setState({isLoading: false});
      });
  };

  render() {
    return (
      <>
        <View style={{...{backgroundColor: '#F7F8F3', flex: 1, padding: 21}}}>
          <TextInput
            style={styled.input}
            onChangeText={(name) => this.setState({name})}
            placeholder={'Name'}
            defaultValue={this.state.data ? this.state.data.name : ''}
          />
          <TextInput
            style={styled.input}
            onChangeText={(phone) => this.setState({phone})}
            placeholder={'Phone'}
            defaultValue={this.state.data ? this.state.data.phone : ''}
          />
          <View style={styled.control}>
            <TouchableOpacity
              style={styled.cta}
              disabled={this.state.isLoading}
              onPress={this.editProfile}>
              {this.state.isLoading && (
                <ActivityIndicator color={'white'} size={'small'} />
              )}
              {!this.state.isLoading && (
                <Text style={styled.textCta}>EDIT</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </>
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
