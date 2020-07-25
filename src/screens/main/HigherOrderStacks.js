import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

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
