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
import {setUser} from '../../../redux/actions/auth';
import {connect} from 'react-redux';

const mapStateToProps = (state) => ({
  auth: state.auth,
});

const mapDispatchToProps = {
  setUser,
};

class Login extends React.Component {
  state = {
    email: '',
    password: '',
    hero: true,
    isLoading: false,
  };

  signIn = (email, password) => async (e) => {
    if (this.state.email.length < 1 || this.state.password.length < 1) {
      Alert.alert('Failed', 'Email and password must be filled');
    } else {
      this.setState({
        isLoading: true,
      });
      try {
        const timee = new Date().toLocaleTimeString();
        await auth().signInWithEmailAndPassword(email, password);
        firestore()
          .collection('userDetails')
          .where('uid', '==', auth()._user.uid)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach(async (documentSnapshot) => {
              this.props.setUser(
                {email, password},
                {
                  ...documentSnapshot.data(),
                  ...{
                    id: documentSnapshot.id,
                    isLogin: true,
                    lastOnline: timee,
                  },
                },
              );
              firestore()
                .collection('userDetails')
                .doc(documentSnapshot.id)
                .update({
                  isLogin: true,
                  lastOnline: timee,
                });
            });
          });
        Alert.alert('Login Success', 'Success');
      } catch (exception) {
        console.log(exception);
        switch (exception.code) {
          case 'auth/invalid-email': {
            Alert.alert('Login Error', 'Email address is invalid!');
            break;
          }
          case 'auth/email-already-in-use': {
            Alert.alert('Login Error', 'Email address is already in use!');
            break;
          }
          case 'auth/wrong-password': {
            Alert.alert('Login Error', 'Wrong password!');
            break;
          }
          case 'auth/user-not-found': {
            Alert.alert('Login Error', 'User is not found!');
            break;
          }
          default: {
            console.log(exception);
            Alert.alert('Login Error', 'Error when trying to login');
          }
        }
      } finally {
        this.setState({
          isLoading: false,
        });
      }
    }
  };

  render() {
    return (
      <View style={styled.container}>
        <View style={styled.hero}>
          <Text style={styled.heroText}>JUST.TYPE</Text>
          <Text style={styled.heroSecondary}>Welcome, please login first</Text>
        </View>

        <View style={styled.content}>
          <TextInput
            onFocus={(e) => this.setState({hero: false})}
            onBlur={(e) => this.setState({hero: true})}
            placeholder="Email"
            onChangeText={(email) => this.setState({email})}
            placeholderTextColor={'#F7F8F3'}
            style={styled.input}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={(password) => this.setState({password})}
            placeholderTextColor={'#F7F8F3'}
            style={styled.input}
          />
          <View style={styled.control}>
            <TouchableOpacity
              disabled={this.state.isLoading}
              style={styled.cta}
              onPress={this.signIn(this.state.email, this.state.password)}>
              {this.state.isLoading && (
                <ActivityIndicator color={'white'} size={'small'} />
              )}
              {!this.state.isLoading && (
                <Text style={styled.textCta}>LOGIN</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styled.secondary}
              onPress={(e) => this.props.navigation.navigate('other')}>
              <Text style={styled.textCta}>Other options</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Login);
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
