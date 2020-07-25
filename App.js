import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Auth from './src/screens/auth';
import Main from './src/screens/main/HigherOrderStacks';
import {Provider} from 'react-redux';
import MainStore from './src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {AppState} from 'react-native';

class App extends React.Component {
  state = {
    router: 'auth',
    user: {},
    initializing: true,
    subscribe: false,
  };

  handleChangeAppState = (nextAppState) => {
    const timee = new Date().toLocaleTimeString();
    if (auth()._user) {
      if (nextAppState === 'active') {
        firestore()
          .collection('userDetails')
          .where('uid', '==', this.state.user.uid)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((documentSnapshot) => {
              firestore()
                .collection('userDetails')
                .doc(documentSnapshot.id)
                .update({
                  isLogin: true,
                  lastOnline: timee.toString(),
                });
            });
          });
      } else {
        firestore()
          .collection('userDetails')
          .where('uid', '==', this.state.user.uid)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((documentSnapshot) => {
              firestore()
                .collection('userDetails')
                .doc(documentSnapshot.id)
                .update({
                  isLogin: false,
                  lastOnline: timee.toString(),
                });
            });
          });
      }
    }
  };

  changePage = (router) => {
    this.setState({
      router,
    });
  };

  onAuthStateChanged = (user) => {
    this.setState({user});
    if (this.state.initializing) {
      this.setState({initializing: false});
    }
  };

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      subscribe: auth().onAuthStateChanged(this.onAuthStateChanged),
    });
    AppState.addEventListener('change', this.handleChangeAppState);
  }

  componentWillUnmount() {
    this.state.subscribe();
    AppState.removeEventListener('change', this.handleChangeAppState);
  }

  render() {
    if (this.state.initializing) {
      return null;
    }
    return (
      <Provider store={MainStore.store}>
        <PersistGate persistor={MainStore.persistor}>
          <NavigationContainer>
            {!this.state.user && <Auth changePage={this.changePage} />}
            {this.state.user && <Main changePage={this.changePage} />}
          </NavigationContainer>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
