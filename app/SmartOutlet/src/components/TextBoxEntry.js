import React from 'react';
import { View, Text, TextInput, Dimensions } from 'react-native';
import { styles, colors } from '../styles';

const { height, width } = Dimensions.get('screen');

export const TextBoxEntry = ({ header, placeholder, onChangeText, value, errorMessage, style, keyboardType }) => {
	const {	center, errorText } = styles;
	const { loginField, loginInputHeaderView, loginInputHeaderText, typedTextStyle } = textBoxStyles;

	return (
		<View style = { [loginField, style] }>
			<View style = { loginInputHeaderView }>
				<Text style = { loginInputHeaderText }>{ header }</Text>
			</View>
			<TextInput
				style = { typedTextStyle }
				placeholder = { placeholder }
				placeholderTextColor = { colors.lightGray }
				onChangeText = { onChangeText }
				value = { value }
				autoCapitalize = { 'none' }
				keyboardType = { keyboardType }
			/>
			<View style = { center }>
				<Text style = { errorText }>{ errorMessage }</Text>
			</View>
		</View>
	);
};

const textBoxStyles = {
	loginField: {
		width: '75%',
		marginTop: '5%',
		alignItems: 'center'
	},
	loginInputHeaderView: {
		width: '100%',
		height: height * 0.025,
		alignItems: 'flex-start'
	},
	loginInputHeaderText: {
		color: colors.dark,
		marginLeft: '8%',
		marginBottom: '1%'
	},
	typedTextStyle: {
		width: '95%',
		height: height * 0.06,
		borderWidth: 1,
		borderColor: colors.darkGray,
		padding: 10,
		fontSize: 16,
		borderRadius: 6,
		color: colors.dark
	}
};