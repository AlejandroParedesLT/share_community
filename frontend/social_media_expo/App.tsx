import { AppRegistry } from 'react-native';
import App from './src/app';  // Ensure this points to the correct entry file
import { name as appName } from './app.json'; 

AppRegistry.registerComponent(appName, () => App);