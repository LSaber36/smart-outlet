import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../styles';

export const InfoBox = ({ header, value }) => {
	const { container, infoHeader, infoText } = infoBoxStyles;

	return (
		<View style = { container }>
			<Text style = { infoHeader }> { header }: </Text>
			<Text style = { infoText }>{ value }</Text>
		</View>
	);
};

const infoBoxStyles = {
	container: {
		marginLeft: '15%',
		marginBottom: '8%'
	},
	infoHeader: {
		color: colors.dark,
		fontSize: 20
	},
	infoText: {
		color: colors.dark,
		fontSize: 20,
		marginTop: '2%'
	}
};