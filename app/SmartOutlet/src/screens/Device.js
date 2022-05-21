import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';

export const Device = ({ navigation }) => {
	const [deviceState, setDeviceState] = useState(false);
	const [deviceName, setDeviceName] = useState('');
	const { deviceID } = useSelector(state => state.user);

	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, deviceInfoText, buttonView, buttonStyle } = deviceStyles;

	useEffect(() => {
		const unsubscribe = firestore()
			.collection('Outlets')
			.doc(deviceID.toString())
			.onSnapshot(documentSnapshot => {
				console.log('Outlet ' + deviceID + ' State: ' + documentSnapshot.get('state'));
				console.log('Outlet ' + deviceID + ' Name: ' + documentSnapshot.get('name'));
				setDeviceState(documentSnapshot.get('state'));
				setDeviceName(documentSnapshot.get('name'));
			});

		return () => unsubscribe();
	}, []);

	return (
		<View style = { container }>
			<Text style = { textStyle }> Device Page </Text>
			<Text style = { deviceInfoText }> Device ID: { deviceID } </Text>
			<Text style = { deviceInfoText }> Device Name: { (deviceName != undefined) ? deviceName : 'Undefined' } </Text>
			<Text style = { deviceInfoText }> Device State: { (deviceState != undefined) ? (deviceState ? 'On' : 'Off') : 'Undefined' } </Text>
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
		marginTop: '55%'
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