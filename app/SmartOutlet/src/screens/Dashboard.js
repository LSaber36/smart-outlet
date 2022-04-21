import React from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';

export const Dashboard = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer } = styles;
	const { textStyle, navButtonView, buttonStyle, deviceButtonView } = dashboardStyles;

	return (
		<View style = { container }>
			<Text style = { textStyle }> Dashboard Page </Text>
			<View style = { deviceButtonView }>
				<Button
					title = 'Device 1'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { [fullWidthHeight] }
					onPress = { () => { navigation.navigate('Device') } }
				/>
			</View>
			<View style = { navButtonView }>
				<Button
					title = '?'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
				/>

				<Button
					title = 'Settings'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => { navigation.navigate('Settings') } }
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
	deviceButtonView: {
		height: '10%',
		width: '80%',
		marginTop: '20%',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	navButtonView: {
		height: '10%',
		width: '80%',
		marginTop: '20%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	buttonStyle: {
		width: '35%',
		height: '80%'
	}
};