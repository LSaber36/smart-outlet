import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles, colors } from '../styles';

export const TextBox = ({ header, placeholder, onChangeText, value, errorMesage, style }) => {
	const {	center, input, errorText } = styles;
	const { loginInputHeader, loginField } = textBoxStyles;

	return (
		<View style = { [loginField, style] }>
			<Text style = { loginInputHeader }>{ header }</Text>
			<TextInput
				style = { input }
				placeholder = { placeholder }
				onChangeText = { onChangeText }
				value = { value }
			/>
			<View style = { center }>
				<Text style = { errorText }>{ errorMesage }</Text>
			</View>
		</View>
	);
};

const textBoxStyles = {
	forgotPasswordText: {
		color: colors.secondaryDark,
		marginLeft: '30%'
	},
	forgotPasswordView: {
		marginTop: '2%'
	},
	registerTextView: {
		marginTop: '5%'
	},
	loginFormStyle: {
		width: '100%',
		marginTop: '15%'
	},
	loginInputHeader: {
		color: colors.dark,
		marginLeft: '5%',
		marginBottom: '1%'
	},
	loginField: {
		width: '75%',
		marginTop: '5%'
	}
};