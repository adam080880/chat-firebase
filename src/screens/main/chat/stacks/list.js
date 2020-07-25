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

export default class List extends React.Component {
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

  componentDidMount() {
    // Pending
    this.fetchList();
  }

  search = (search) => {
    this.setState({
      realFriends: this.state.friends.filter((val) =>
        val.name.toLowerCase().includes(search.toLowerCase()),
      ),
    });
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
                    ...[
                      {
                        ...biodataFriend.data(),
                        ...{chatId: getFriends.data().chatId},
                      },
                    ],
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
    console.log(val);
    return (
      <TouchableOpacity
        key={index}
        style={styled.card}
        onPress={(e) =>
          this.props.navigation.navigate('ChatStack', {
            friendUid: val.uid,
            meUid: auth()._user.uid,
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
            <View style={{...{alignItems: 'center', flexDirection: 'row'}}}>
              <Text style={styled.cardName}>{val.name}</Text>
              <View
                style={{
                  ...styled.online,
                  ...{
                    backgroundColor: val.isLogin ? '#AEDDCB' : '#E5386D',
                    marginLeft: 5,
                  },
                }}
              />
            </View>
            <Text style={styled.cardRecent}>See chats</Text>
          </View>
          <View style={styled.cardNotif}>
            <Icon name={'right'} size={20} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <ScrollView style={styled.container}>
        <TextInput
          style={styled.input}
          onChangeText={this.search}
          placeholder={'Search friend'}
        />
        {this.state.realFriends.map(this.renderCardPending)}
      </ScrollView>
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
  online: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#AEDDCB',
    marginRight: 3,
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
  cardRecent: {color: '#2C3E66', opacity: 0.64, fontSize: 10},
});
