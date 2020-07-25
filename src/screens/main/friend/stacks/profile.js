import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import fireStore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/AntDesign';
import ImagePicker from 'react-native-image-picker';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: auth()._user.uid,
      data: false,
      subscriber: false,
      avatar: false,
      id: '',
      isLoading: true,
    };
  }

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      subscriber: fireStore()
        .collection('userDetails')
        .where(
          'uid',
          '==',
          this.props.route.params
            ? this.props.route.params.friendUid
            : this.state.uid,
        )
        .onSnapshot((querySnapshot) => {
          querySnapshot.forEach((documentSnapshot) => {
            this.setState({
              id: documentSnapshot.id,
              data: documentSnapshot.data(),
              isLoading: false,
            });
          });
        }),
    });
  }

  componentWillUnmount() {
    return this.state.subscriber();
  }

  getFileLocalePath = (response) => {
    const {uri, path} = response;
    return Platform.OS === 'android' ? path : uri;
  };

  changeImage = (e) => {
    ImagePicker.showImagePicker(
      {
        title: 'Select Avatar',
        storageOptions: {skipBackup: true, path: 'images'},
      },
      async (response) => {
        if (response.error) {
          Alert.alert('Upload file error', response.error);
          check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE).then((res) => {
            switch (res) {
              case RESULTS.UNAVAILABLE:
                request(
                  PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                ).then((result) => {});
                break;
              case RESULTS.DENIED:
                request(
                  PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                ).then((result) => {});
                break;
              case RESULTS.GRANTED:
                break;
              case RESULTS.BLOCKED:
                request(
                  PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                ).then((result) => {});
                break;
              default:
                console.log(res);
            }
          });
          check(PERMISSIONS.ANDROID.CAMERA).then((res) => {
            switch (res) {
              case RESULTS.UNAVAILABLE:
                request(PERMISSIONS.ANDROID.CAMERA).then((result) => {});
                break;
              case RESULTS.DENIED:
                request(PERMISSIONS.ANDROID.CAMERA).then((result) => {});
                break;
              case RESULTS.GRANTED:
                break;
              case RESULTS.BLOCKED:
                request(PERMISSIONS.ANDROID.CAMERA).then((result) => {});
                break;
              default:
                console.log(res);
            }
          });
        } else if (response.didCancel) {
        } else {
          const source = {uri: response.uri};
          this.setState({
            avatar: source,
            isLoading: true,
          });

          let imageName =
            new Date().getTime().toString() +
            'image' +
            this.state.data.name +
            '.' +
            response.type.split('/')[1];
          let uploadUri =
            Platform.OS === 'ios'
              ? response.uri.replace('file://', '')
              : response.uri;

          storage()
            .ref(imageName)
            .putFile(uploadUri)
            .then(async () => {
              Alert.alert('Success upload');
              fireStore()
                .collection('userDetails')
                .doc(this.state.id)
                .update({
                  avatar: await storage()
                    .ref('/' + imageName)
                    .getDownloadURL(),
                })
                .then(() => {})
                .catch(() => {
                  Alert.alert('Update failed');
                })
                .finally(() => {
                  this.setState({isLoading: false});
                });
            })
            .catch(() => {
              Alert.alert('Failed upload');
              this.setState({avatar: false});
            })
            .finally(() => {
              this.setState({isLoading: false});
            });
        }
      },
    );
  };

  render() {
    return (
      <View style={styled.container}>
        <View style={styled.alCenter}>
          <View style={styled.header}>
            <TouchableOpacity onPress={(e) => this.props.navigation.goBack()}>
              <Icon
                name={'arrowleft'}
                color={'#F7F8F3'}
                size={25}
                style={styled.m15}
              />
            </TouchableOpacity>
            {!this.props.route.params && (
              <TouchableOpacity
                onPress={(e) => this.props.navigation.navigate('EditProfile')}>
                <Icon
                  name={'edit'}
                  color={'#F7F8F3'}
                  size={25}
                  style={styled.m15}
                />
              </TouchableOpacity>
            )}
          </View>
          {(!this.state.data || this.state.isLoading) && (
            <ActivityIndicator style={styled.m15} size={'large'} />
          )}
          {this.state.data && !this.state.isLoading && (
            <>
              <TouchableOpacity
                onPress={this.props.route.params ? () => {} : this.changeImage}>
                {!this.state.data.avatar && (
                  <Text
                    style={{
                      ...styled.profileImage,
                      ...{
                        backgroundColor: 'white',
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        fontWeight: 'bold',
                        fontSize: 50,
                        color: '#2C3E66',
                        elevation: 3,
                      },
                    }}>
                    {this.state.data.name.slice(0, 2).toUpperCase()}
                  </Text>
                )}
                {this.state.data.avatar && (
                  <Image
                    resizeMode={'cover'}
                    style={styled.profileImage}
                    source={{uri: this.state.data.avatar}}
                  />
                )}
              </TouchableOpacity>
              <Text style={styled.title}>{this.state.data.name || ''}</Text>
              <View style={styled.rowStatus}>
                <View
                  style={{
                    ...styled.online,
                    ...{
                      backgroundColor: this.state.data.isLogin
                        ? '#AEDDCB'
                        : '#E5386D',
                    },
                  }}
                />
                <Text style={styled.cardStatus}>
                  {this.state.data.isLogin ? 'Online' : 'Offline'}
                </Text>
              </View>
              <View style={{...{flexDirection: 'row'}}}>
                <TouchableOpacity
                  style={styled.button}
                  onPress={(e) =>
                    this.props.navigation.navigate('TrackerStack')
                  }>
                  <Text
                    style={{
                      ...styled.fs13,
                      ...{color: '#F7F8F3', fontWeight: 'bold'},
                    }}>
                    TRACKING
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styled.button}
                  onPress={(e) => {
                    this.props.navigation.navigate('ChatStack', {
                      friendUid: this.state.data.uid,
                      meUid: auth()._user.uid,
                      chatId: this.props.route.params.chatId,
                    });
                  }}>
                  <Text
                    style={{
                      ...styled.fs13,
                      ...{color: '#F7F8F3', fontWeight: 'bold'},
                    }}>
                    CHAT
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styled.card}>
                <Text style={{...{fontWeight: 'bold'}}}>Code: </Text>
                <Text
                  style={{
                    ...{color: '#2C3E66', opacity: 0.64, marginHorizontal: 17},
                  }}>
                  {this.state.data.code}
                </Text>
              </View>
              <View style={styled.card}>
                <Text style={{...{fontWeight: 'bold'}}}>Phone: </Text>
                <Text
                  style={{
                    ...{color: '#2C3E66', opacity: 0.64, marginHorizontal: 17},
                  }}>
                  {this.state.data.phone
                    .split('')
                    .map((val, index) =>
                      (index + 1) % 4 === 0 &&
                      index !== this.state.data.phone.length - 1
                        ? val + '-'
                        : val,
                    )}
                </Text>
              </View>
            </>
          )}
        </View>
        <View style={styled.mb30} />
      </View>
    );
  }
}

const styled = StyleSheet.create({
  profileText: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  fs13: {fontSize: 13},
  container: {
    backgroundColor: '#F7F8F3',
    flex: 1,
    position: 'relative',
  },
  alCenter: {alignItems: 'center'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 165,
    width: '100%',
    backgroundColor: '#2C3E66',
  },
  m15: {margin: 15},
  mb30: {marginBottom: 30},
  profileImage: {
    width: 135,
    height: 135,
    borderRadius: 135 / 2,
    marginTop: -135 / 2,
    zIndex: 5,
  },
  title: {
    fontWeight: 'bold',
    color: '#2C3E66',
    marginTop: 15,
    fontSize: 13,
  },
  cardStatus: {color: '#2C3E66', opacity: 0.64, fontSize: 10},
  rowStatus: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  online: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#AEDDCB',
    marginRight: 3,
  },
  card: {
    borderRadius: 5,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    width: '100%',
    marginTop: 15,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 5,
    marginVertical: 15,
    backgroundColor: '#FE6F5F',
    borderRadius: 5,
  },
});
