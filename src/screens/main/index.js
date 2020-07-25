import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import StackChats from './chat/stacks/list';
import StackFriend from './friend/stacks/list';
import StackSetting from './setting/stacks/settings';

const TopTab = createMaterialTopTabNavigator();

export default class Main extends React.Component {
  stackSettingInjected = (changePage) => (props) => (
    <StackSetting changePage={changePage} {...props} />
  );
  render() {
    return (
      <>
        <TopTab.Navigator
          tabBarOptions={{
            style: {backgroundColor: '#2C3E66'},
            labelStyle: {color: 'white', fontWeight: 'bold'},
          }}>
          <TopTab.Screen
            name="stack_chats"
            options={{title: 'Chats'}}
            component={StackChats}
          />
          <TopTab.Screen
            name="stack_friend"
            options={{title: 'Friends'}}
            component={StackFriend}
          />
          <TopTab.Screen
            name="stack_setting"
            options={{title: 'Settings'}}
            component={this.stackSettingInjected(this.props.changePage)}
          />
        </TopTab.Navigator>
      </>
    );
  }
}
