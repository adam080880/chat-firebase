import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';

export default () => {
  check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((res) => {
    switch (res) {
      case RESULTS.UNAVAILABLE:
        request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {});
        break;
      case RESULTS.DENIED:
        request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {});
        break;
      case RESULTS.GRANTED:
        break;
      case RESULTS.BLOCKED:
        break;
    }
  });
};
