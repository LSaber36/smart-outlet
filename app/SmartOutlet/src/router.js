import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from './styles';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
	/* Splash Screen */ Splash,
	/* Auth Screens  */ Login, Signup,
	/* Main Screens  */ Dashboard, Device, Settings
} from './screens';

const SplashStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

const SplashStackNavigator = () => (
	<SplashStack.Navigator>
		<SplashStack.Screen name = 'Splash' component = { Splash } />
	</SplashStack.Navigator>
);

const AuthStackNavigator = () => (
	<AuthStack.Navigator>
		<AuthStack.Screen name = 'Login' component = { Login } />
		<AuthStack.Screen name = 'Signup' component = { Signup } />
	</AuthStack.Navigator>
);

const MainStackNavigator = () => (
	<MainStack.Navigator>
		<MainStack.Screen
			name = 'Dashboard'
			component = { Dashboard }
			options = { ({ navigation }) => ({
				headerRight: () => (
					<Icon
						name = 'gear'
						color = { colors.lightGray }
						size = { 30 }
						onPress = { () => navigation.navigate('Settings') }
					/>
				)
			}) }
		/>
		<MainStack.Screen name = 'Device' component = { Device } />
		<MainStack.Screen name = 'Settings' component = { Settings } />
	</MainStack.Navigator>
);

const Router = ({ isLoading, isLoggedIn }) => {
	return (
		<NavigationContainer>
			{ isLoading ? <SplashStackNavigator /> :
				isLoggedIn ? <MainStackNavigator /> : <AuthStackNavigator />
			}
		</NavigationContainer>
	);
};

export default Router;