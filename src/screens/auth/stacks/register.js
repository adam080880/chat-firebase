import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default class Register extends React.Component {
  state = {
    email: '',
    password: '',
    cpassword: '',
    isLoading: false,
  };
  stringRandomGenerator = (limit) =>
    new Promise((resolve) => {
      const string = '1234567890qwertyuiopasdfghjklzxcvbnm;.<>][-=+_/?,`~';
      let result = '';
      for (let a = 0; a < limit; a++) {
        result += string.charAt(Math.floor(Math.random() * string.length));
      }
      resolve(result);
    });
  signUp = (email, password) => async (e) => {
    if (
      this.state.email.length < 1 ||
      this.state.password.length < 1 ||
      this.state.cpassword.length < 1
    ) {
      Alert.alert(
        'Failed',
        'Email, password and confirm password must be required',
      );
    } else {
      const timee = new Date().toLocaleTimeString();
      if (this.state.password !== this.state.cpassword) {
        Alert.alert('Failed', 'Password and confirm password are not match');
      } else {
        this.setState({
          isLoading: true,
        });
        try {
          const createdUser = await auth().createUserWithEmailAndPassword(
            email,
            password,
          );
          const {uid} = createdUser.user;
          const random = await this.stringRandomGenerator(4);
          const code = random.concat(
            new Date().getTime().toString().slice(-4).toString(),
          );
          await firestore()
            .collection('userDetails')
            .add({
              uid,
              name: email.split('@')[0].toLowerCase(),
              phone: '',
              code: code,
              isLogin: true,
              lastOnline: timee,
            });
        } catch (exception) {
          switch (exception.code || exception) {
            case 'auth/invalid-email': {
              Alert.alert('Register Error', 'Email address is invalid!');
              break;
            }
            case 'auth/email-already-in-use': {
              Alert.alert('Register Error', 'Email address is already in use!');
              break;
            }
            case 'auth/weak-password': {
              Alert.alert('Register Error', 'Weak password!');
              break;
            }
            default: {
              console.log(exception.code || exception);
              Alert.alert('Register Error', exception.code || exception);
            }
          }
        } finally {
          this.setState({
            isLoading: false,
          });
        }
      }
    }
  };
  render() {
    return (
      <View style={styled.container}>
        <View style={styled.hero}>
          <Text style={styled.heroText}>JUST.TYPE</Text>
          <Text style={styled.heroSecondary}>Welcome, please register</Text>
        </View>
        <View style={styled.content}>
          <TextInput
            onChangeText={(email) => this.setState({email})}
            placeholder="Email"
            placeholderTextColor={'#F7F8F3'}
            style={styled.input}
          />
          <TextInput
            onChangeText={(password) => this.setState({password})}
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor={'#F7F8F3'}
            style={styled.input}
          />
          <TextInput
            onChangeText={(cpassword) => this.setState({cpassword})}
            placeholder="Confirm Password"
            secureTextEntry={true}
            placeholderTextColor={'#F7F8F3'}
            style={styled.input}
          />
          <View style={styled.control}>
            <TouchableOpacity
              style={styled.cta}
              disabled={this.state.isLoading}
              onPress={this.signUp(this.state.email, this.state.password)}>
              {this.state.isLoading && (
                <ActivityIndicator color={'white'} size={'small'} />
              )}
              {!this.state.isLoading && (
                <Text style={styled.textCta}>REGISTER</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styled.secondary}
              onPress={(e) => this.props.navigation.navigate('login')}>
              <Text style={styled.textCta}>Back to login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styled = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E66',
    padding: 41,
  },
  hero: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  heroText: {fontSize: 45, color: '#AEDDCB', fontFamily: 'serif'},
  heroSecondary: {color: '#F7F8F3', fontSize: 20, marginTop: 8},
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  input: {
    borderBottomColor: '#F7F8F3',
    borderBottomWidth: 1,
    color: '#F7F8F3',
    marginBottom: 29.5,
    width: '100%',
  },
  cta: {
    backgroundColor: '#FE6F5F',
    marginTop: 29.5,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 3,
  },
  secondary: {
    paddingVertical: 13,
    marginTop: 29.5,
  },
  textCta: {
    color: 'white',
    fontWeight: 'bold',
  },
  control: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
