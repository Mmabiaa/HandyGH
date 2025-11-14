/**
 * Mock implementation of react-native-restart
 * This is a temporary mock until the actual package is installed
 *
 * To install the real package:
 * npm install react-native-restart
 */

import { Alert } from 'react-native';

class RestartMock {
  Restart(): void {
    if (__DEV__) {
      console.log('[Restart] App restart requested');
      Alert.alert(
        'Restart Required',
        'Please manually restart the app to continue.',
        [{ text: 'OK' }]
      );
    }
  }
}

export default new RestartMock();
