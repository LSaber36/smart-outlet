import { AppRegistry } from 'react-native';
// Should launch App, which will then go to the splash page and contain the navigation stack
import App from './src/App';
import { name as appName } from './src/app.json';

AppRegistry.registerComponent(appName, () => App);