import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import database from '@react-native-firebase/database';
import { useSelector } from 'react-redux';

export const Device = ({ navigation }) => {
	const [deviceState, setDeviceState] = useState(false);
	const { deviceID } = useSelector(state => state.user);

	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, deviceInfoText, buttonView, buttonStyle } = deviceStyles;

	// Realtime database reference object
	const deviceStateRef = database().ref('/test');

	useEffect(() => {
		deviceStateRef.on('value', snapshot => {
			console.log('User data: ', snapshot.val());
			setDeviceState(snapshot.val().state);
		});
	});

	return (
		<View style = { container }>
			<Text style = { textStyle }> Device Page </Text>
			<Text style = { deviceInfoText }> Device ID: { deviceID } </Text>
			<Text style = { deviceInfoText }> Device State: { deviceState ? 'On' : 'Off' } </Text>
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
		marginTop: '60%'
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