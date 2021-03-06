import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { colors } from '../styles';

const { width } = Dimensions.get('screen');

export const InfoBox = ({ header, value }) => {
	const { container, infoContainer, infoHeader, infoView, infoText } = infoBoxStyles;

	return (
		<View style = { container }>
			<View style = { infoContainer }>
				<Text style = { infoHeader }>{ header }:</Text>
				<View style = { infoView }>
					<Text style = { infoText }>{ value }</Text>
				</View>
			</View>
		</View>
	);
};

const infoBoxStyles = {
	container: {
		width: width * 0.8,
		padding: '2%',
		marginBottom: '6%',
		alignItems: 'center',
		borderRadius: 10,
		backgroundColor: colors.primaryDark
	},
	infoContainer: {
		width: '90%'
	},
	infoHeader: {
		fontSize: 17,
		color: colors.offWhite
	},
	infoView: {
		width: '100%'
	},
	infoText: {
		color: colors.offWhite,
		fontSize: 17,
		marginTop: '2%'
	}
};