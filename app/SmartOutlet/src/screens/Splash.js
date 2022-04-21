import React from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';

export const Splash = ({ navigation }) => {
	const {	container } = styles;
	const { textStyle } = splashStyles;

	return (
		<View style = { container }>
			<Text style = { textStyle }> Splash Page </Text>
		</View>
	);
};

const splashStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		marginTop: '65%'
	}
};