import React from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import Icon from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class Friend extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    code: '',
    friends: [],
    realFriends: [],
    isLoading: false,
    subscribe: false,
  };

  fetchList = async () => {
    this.setState({
      isLoading: true,
    });

    try {
      this.setState({
        subscribe: firestore()
          .collection('friends')
          .where('fromUid', '==', auth()._user.uid)
          .onSnapshot((doc) => {
            doc.forEach((getFriends) => {
              if (getFriends.data().toUid) {
                getFriends.data().toUid.onSnapshot((biodataFriend) => {
                  const friends = [
                    ...[{...biodataFriend.data(), ...getFriends.data()}],
                    ...this.state.friends.filter(
                      (val) => val.uid !== biodataFriend.data().uid,
                    ),
                  ];
                  this.setState({
                    friends: friends.sort((a, b) => (a === b ? 0 : a ? -1 : 1)),
                    realFriends: friends.sort((a, b) =>
                      a === b ? 0 : a ? -1 : 1,
                    ),
                  });
                });
              }
            });
          }),
      });
    } catch (err) {
    } finally {
      this.setState({
        isLoading: false,
      });
    }
  };

  componentWillUnmount() {
    this.state.subscribe();
  }

  renderCardPending = (val, index) => {
    return (
      <TouchableOpacity
        key={index}
        style={styled.card}
        onPress={(e) =>
          this.props.navigation.navigate('ProfileStack', {
            friendUid: val.uid,
            chatId: val.chatId,
          })
        }>
        {val.avatar && (
          <Image
            resizeMode={'cover'}
            style={styled.cardImage}
            source={{
              uri: val.avatar,
            }}
          />
        )}
        {!val.avatar && (
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
            {val.name.slice(0, 2).toUpperCase()}
          </Text>
        )}
        <View style={styled.cardContent}>
          <View style={styled.cardProfile}>
            <Text style={styled.cardName}>{val.name}</Text>
            <View style={styled.rowStatus}>
              <View
                style={{
                  ...styled.online,
                  ...{backgroundColor: val.isLogin ? '#AEDDCB' : '#E5386D'},
                }}
              />
              <Text style={styled.cardStatus}>
                {val.isLogin ? 'Online' : 'Offline - ' + val.lastOnline}
              </Text>
            </View>
          </View>
          <View>
            <TouchableOpacity>
              <Icon name={'right'} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  search = (search) => {
    this.setState({
      realFriends: this.state.friends.filter((val) =>
        val.name.toLowerCase().includes(search.toLowerCase()),
      ),
    });
  };
  componentDidMount() {
    // Pending
    this.fetchList();
  }
  render() {
    return (
      <View style={{...{position: 'relative', flex: 1}}}>
        <TouchableOpacity
          onPress={(e) => this.props.navigation.navigate('AddFriend')}
          style={{
            ...{
              bottom: 0,
              right: 0,
              position: 'absolute',
              zIndex: 50,
              margin: 20,
              justifyContent: 'center',
              alignItems: 'center',
            },
          }}>
          <Icon
            name={'plus'}
            size={30}
            color={'white'}
            style={{
              ...{padding: 10, borderRadius: 100, backgroundColor: '#FE6F5F'},
            }}
          />
        </TouchableOpacity>
        <ScrollView style={styled.container}>
          <TextInput
            style={styled.input}
            onChangeText={this.search}
            placeholder={'Search friend'}
          />
          {this.state.realFriends.map(this.renderCardPending)}
        </ScrollView>
      </View>
    );
  }
}

const styled = StyleSheet.create({
  container: {
    backgroundColor: '#F7F8F3',
  },
  input: {
    elevation: 1,
    backgroundColor: 'white',
    color: '#2C3E66',
    width: '100%',
    paddingHorizontal: 15,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: 'white',
    borderBottomColor: '#F7F8F3',
    borderBottomWidth: 2,
    alignItems: 'center',
    flexDirection: 'row',
  },
  cardImage: {
    width: 52,
    height: 52,
    borderRadius: 52 / 2,
    marginRight: 17,
  },
  cardBody: {flexDirection: 'row', alignItems: 'center'},
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  cardProfile: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  cardName: {color: '#2C3E66', fontWeight: 'bold'},
  cardStatus: {color: '#2C3E66', opacity: 0.64, fontSize: 10},
  rowStatus: {flexDirection: 'row', alignItems: 'center'},
  online: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#AEDDCB',
    marginRight: 3,
  },
});
