import React, { useState, useEffect} from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import database from '@react-native-firebase/database';

export const Device = ({ navigation, route }) => {
	const [deviceState, setDeviceState] = useState(false);
	const [deviceID, setDeviceID] = useState(0);

	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, deviceInfoText, buttonView, buttonStyle } = deviceStyles;

	// TO-DO: replace with Redux
	const deviceValue = route.params.value;
	const deviceKey = route.params.key;

	// Realtime database reference object
	const deviceStateRef = database().ref('/test');

	useEffect(() => {
		deviceStateRef.on('value', snapshot => {
			console.log('User data: ', snapshot.val());
			setDeviceState(snapshot.val().state);
			setDeviceID(snapshot.val().id);
		});
	});

	return (
		<View style = { container }>
			<Text style = { textStyle }> Device Page </Text>
			<Text style = { deviceInfoText }> { deviceValue } { deviceKey } </Text>
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