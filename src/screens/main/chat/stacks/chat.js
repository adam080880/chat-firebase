import React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subscribe: false,
      chats: [],
      chat: '',
      user: false,
      subscribe2: false,
    };
  }
  componentDidMount() {
    // console.log(this.props.route.params);
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      subcribe: database()
        .ref('chats/' + this.props.route.params.chatId)
        .orderByChild('created_at')
        .on('value', (snapshot) => {
          if (!snapshot.exists()) {
            this.setState({chats: []});
          } else {
            const res = Object.values(snapshot)[0].value;
            this.setState({
              chats: Object.keys(res).map((val) => ({
                ...res[val],
              })),
            });
          }
        }),
      subscribe2: firestore()
        .collection('userDetails')
        .where('uid', '==', this.props.route.params.friendUid)
        .onSnapshot((querySnapshot) => {
          querySnapshot.forEach((val) => {
            this.setState({
              user: {...{id: val.id}, ...val.data()},
            });
          });
        }),
    });
  }

  send = (e) => {
    const add = database()
      .ref('/chats/' + this.props.route.params.chatId)
      .push();

    add.set(
      ...[
        {
          msg: this.state.chat,
          fromUid: auth()._user.uid,
          createdAt: new Date().getTime(),
        },
      ],
    );
    this.setState({
      chat: '',
    });
  };

  componentWillUnmount() {
    database().ref('/users').off();
    this.state.subscribe2();
  }
  render() {
    return (
      <View style={styled.container}>
        {this.state.user && (
          <View style={styled.card}>
            <TouchableOpacity onPress={(e) => this.props.navigation.goBack()}>
              <Icon
                name={'arrowleft'}
                size={25}
                style={{...{marginRight: 15}}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) =>
                this.props.navigation.navigate('ProfileStack', {
                  friendUid: this.state.user.uid,
                  chatId: this.props.route.params.chatId,
                })
              }
              style={{...{flexDirection: 'row', alignItems: 'center'}}}>
              {this.state.user.avatar && (
                <Image
                  resizeMode={'cover'}
                  style={styled.cardImage}
                  source={{
                    uri: this.state.user.avatar,
                  }}
                />
              )}
              {!this.state.user.avatar && (
                <Text
                  style={{
                    ...styled.cardImage,
                    ...{
                      backgroundColor: 'white',
                      textAlign: 'center',
                      textAlignVertical: 'center',
                      fontWeight: 'bold',
                      fontSize: 20,
                      color: '#2C3E66',
                      elevation: 3,
                    },
                  }}>
                  {this.state.user.name.slice(0, 2).toUpperCase()}
                </Text>
              )}
              <View style={styled.cardContent}>
                <View style={styled.cardProfile}>
                  <View
                    style={{...{alignItems: 'center', flexDirection: 'row'}}}>
                    <Text style={styled.cardName}>{this.state.user.name}</Text>
                  </View>
                  <View
                    style={{...{alignItems: 'center', flexDirection: 'row'}}}>
                    <Text style={styled.cardRecent}>
                      {this.state.user.isLogin
                        ? 'Online'
                        : 'Offline - ' + this.state.user.lastOnline}
                    </Text>
                    <View
                      style={{
                        ...styled.online,
                        ...{
                          backgroundColor: this.state.user.isLogin
                            ? '#AEDDCB'
                            : '#E5386D',
                          marginLeft: 5,
                        },
                      }}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styled.chatContainer}>
          {this.state.chats
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((val, index) => (
              <View
                key={index}
                style={
                  val.fromUid === auth()._user.uid
                    ? styled.rowMe
                    : styled.rowFriend
                }>
                <TouchableOpacity style={styled.ballon}>
                  <Text style={styled.textBallon}>{val.msg}</Text>
                  <Text style={styled.hoursBallon}>
                    {new Date(val.createdAt).toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          <View style={styled.mb20} />
        </ScrollView>
        <View style={styled.control}>
          <TextInput
            placeholder="Type a message"
            onChangeText={(chat) => this.setState({chat})}
            value={this.state.chat}
            style={styled.controlText}
          />
          <TouchableOpacity style={styled.buttonControl} onPress={this.send}>
            <Icon name={'rocket1'} size={20} style={styled.buttonIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styled = StyleSheet.create({
  mb20: {marginBottom: 20},
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F7F8F3',
  },
  cardRecent: {color: '#2C3E66', opacity: 0.64, fontSize: 10},
  chatContainer: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  rowFriend: {
    alignItems: 'flex-start',
  },
  rowMe: {
    alignItems: 'flex-end',
  },
  ballon: {
    backgroundColor: 'white',
    marginTop: 15,
    marginHorizontal: 15,
    justifyContent: 'center',
    flexDirection: 'column',
    elevation: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  textBallon: {
    color: '#2C3E66',
    marginBottom: 5,
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  hoursBallon: {
    textAlign: 'right',
    fontSize: 10,
    color: '#2C3E66',
    opacity: 0.64,
    paddingBottom: 5,
    paddingRight: 5,
  },
  control: {
    marginHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    marginBottom: 5,
  },
  buttonControl: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#2C3E66',
    marginLeft: 10,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: 'white',
    borderBottomColor: '#F7F8F3',
    borderBottomWidth: 2,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 3,
  },
  cardImage: {
    width: 52,
    height: 52,
    borderRadius: 52 / 2,
    marginRight: 17,
  },
  online: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#AEDDCB',
    marginRight: 3,
  },
  buttonIcon: {color: '#F7F8F3'},
  controlText: {
    flex: 1,
    fontSize: 13,
    color: '#2C3E66',
    padding: 10,
    borderColor: '#CBD0D9',
    borderWidth: 1,
    borderRadius: 55 / 2,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
});
