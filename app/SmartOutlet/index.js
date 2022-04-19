import { AppRegistry } from 'react-native';
// Should launch App, which will then go to the splash page and contain the navigation stack
import App from './src/App';
import Splash from './src/screens/Splash';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import Dashboard from './src/screens/Dashboard';
import Device from './src/screens/Device';
import Settings from './src/screens/Settings';
import { name as appName } from './src/app.json';

AppRegistry.registerComponent(appName, () => Dashboard);