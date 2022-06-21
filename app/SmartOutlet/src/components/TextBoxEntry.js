import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles, colors } from '../styles';

export const TextBoxEntry = ({ header, placeholder, onChangeText, value, errorMesage, style }) => {
	const {	center, errorText } = styles;
	const { loginInputHeader, loginField, typedTextStyle } = textBoxStyles;

	return (
		<View style = { [loginField, style] }>
			<Text style = { loginInputHeader }>{ header }</Text>
			<TextInput
				style = { typedTextStyle }
				placeholder = { placeholder }
				placeholderTextColor = { colors.lightGray }
				onChangeText = { onChangeText }
				value = { value }
				autoCapitalize = { 'none' }
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
	},
	typedTextStyle: {
		width: '100%',
		borderWidth: 1,
		borderColor: colors.darkGray,
		padding: 10,
		fontSize: 16,
		borderRadius: 6,
		color: colors.dark
	}
};