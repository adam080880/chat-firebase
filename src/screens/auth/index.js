import React from 'react';

import LoginStack from './stacks/login';
import RegisterStack from './stacks/register';
import Others from './stacks/others';

import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

export default class Auth extends React.Component {
  constructor(props) {
    super(props);
  }
  LoginStackInjected = (changePage) => (props) => (
    <>
      <LoginStack changePage={changePage} {...props} />
    </>
  );
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="login"
          component={this.LoginStackInjected(this.props.changePage)}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register"
          component={RegisterStack}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="other"
          component={Others}
          options={{
            title: 'Other options',
            headerTintColor: '#F7F8F3',
            headerStyle: {backgroundColor: '#2C3E66'},
          }}
        />
      </Stack.Navigator>
    );
  }
}
