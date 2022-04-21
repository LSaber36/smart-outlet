import React from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';

export const Signup = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, buttonView, buttonStyle, loginTextView } = loginStyles;

	return (
		<View style = { container }>
			<Text style = { textStyle }> Signup Page </Text>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Sign Up'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
				/>
			</View>
			<View style = { [loginTextView, center] }>
				<Text>{ 'Already have an account? ' } </Text>
				<Text style = {{ color: colors.secondaryDark }}>
					Log in
				</Text>
			</View>
		</View>
	);
};

const loginStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		marginTop: '65%'
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
	loginTextView: {
		marginTop: '5%'
	}
};