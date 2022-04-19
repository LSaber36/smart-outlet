import React from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';

const SplashScreen = () => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, buttonView, buttonStyle } = deviceStyles;

	return (
		<View style = { container }>
			<Text style = { textStyle }> Device Page </Text>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Back'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
				/>
			</View>
		</View>
	);
};

const deviceStyles = {
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
		height: '80%',
		backgroundColor: 'red'
	},
	registerTextView: {
		marginTop: '5%'
	}
};

export default SplashScreen;