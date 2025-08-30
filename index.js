/**
 * @format
 */

// TextEncoder polyfill for QR code generation
import 'text-encoding';

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
