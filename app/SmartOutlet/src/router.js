import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
	/* Splash Screen */ Splash,
	/* Auth Screens  */ Login, Signup,
	/* Main Screens  */ Dashboard, Device, Settings
} from './screens';

const Stack = createNativeStackNavigator();

const Router = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name = 'Signup' component = { Signup } />
				<Stack.Screen name = 'Login' component = { Login } />
				<Stack.Screen name = 'Dashboard' component = { Dashboard } />
				<Stack.Screen name = 'Splash' component = { Splash } />
				<Stack.Screen name = 'Device' component = { Device } />
				<Stack.Screen name = 'Settings' component = { Settings } />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default Router;