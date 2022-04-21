import React from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';

export const Login = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, buttonView, buttonStyle, registerTextView } = loginStyles;

	return (
		<View style = { container }>
			<Text style = { textStyle }> Login Page </Text>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Login'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => { navigation.navigate('Dashboard') } }
				/>
			</View>
			<View style = { [registerTextView, center] }>
				<Text>{ 'Don\'t have an account? ' }</Text>
				<Text style = {{ color: colors.secondaryDark }}>
					Register here
				</Text>
			</View>
		</View>
	);
};

const loginStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		paddingTop: '65%'
	},
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '40%'
	},
	buttonStyle: {
		width: '80%',
		height: '80%'
	},
	registerTextView: {
		marginTop: '5%'
	}
};