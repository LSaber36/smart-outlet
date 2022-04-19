import React from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';

const SplashScreen = () => {
	const {	container, fullWidthHeight, buttonContainer } = styles;
	const { textStyle, buttonView, buttonStyle } = dashboardStyles;

	return (
		<View style = { container }>
			<Text style = { textStyle }> Dashboard Page </Text>
			<View style = { buttonView }>
				<Button
					title = '?'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
				/>

				<Button
					title = 'Settings'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
				/>
			</View>
		</View>
	);
};

const dashboardStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		marginTop: '65%'
	},
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '40%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	buttonStyle: {
		width: '35%',
		height: '80%',
		backgroundColor: 'red'
	}
};

export default SplashScreen;