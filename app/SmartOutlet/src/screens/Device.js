import React from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';

export const Device = ({ navigation, route }) => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, deviceInfoText, buttonView, buttonStyle } = deviceStyles;
	const deviceValue = route.params.value;
	const deviceKey = route.params.key;

	return (
		<View style = { container }>
			<Text style = { textStyle }> Device Page </Text>
			<Text style = { deviceInfoText }> { deviceValue } { deviceKey } </Text>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Back'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => navigation.goBack() }
				/>
			</View>
		</View>
	);
};

const deviceStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		paddingTop: '15%'
	},
	deviceInfoText: {
		color: colors.dark,
		fontSize: 20,
		paddingTop: '10%'
	},
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '85%'
	},
	buttonStyle: {
		width: '80%',
		height: '80%',
		backgroundColor: 'red'
	},
	registerTextView: {
		marginTop: '5%'
	}
};