import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';

export const Device = ({ navigation }) => {
	const [deviceState, setDeviceState] = useState(false);
	const [deviceName, setDeviceName] = useState('');
	const [deviceList, setDeviceList] = useState([]);
	const { deviceID } = useSelector(state => state.user);

	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, deviceInfoText, buttonView, buttonStyle, deleteButton } = deviceStyles;

	useEffect(() => {
		const unsubscribeOutlets = firestore()
			.collection('Outlets')
			.doc(deviceID.toString())
			.onSnapshot(documentSnapshot => {
				console.log('Outlet ' + deviceID + ' State: ' + documentSnapshot.get('state'));
				console.log('Outlet ' + deviceID + ' Name: ' + documentSnapshot.get('name'));
				setDeviceState(documentSnapshot.get('state'));
				setDeviceName(documentSnapshot.get('name'));
			});

		const unsubscribeUser = firestore()
			.collection('Users')
			.doc('testAccount@smartoutlet.com')
			.onSnapshot(documentSnapshot => {
				console.log('Current device list: ' + documentSnapshot.get('outletIds'));
				setDeviceList(documentSnapshot.get('outletIds'));
			});

		return () => {
			unsubscribeOutlets();
			unsubscribeUser();
		};
	}, []);

	function deleteDevice() {
		console.log('Deleting outlet with ID: ' + deviceID);
		console.log('Filtered List: ' + deviceList.filter(element => element != deviceID));

		// Remove the device from the user's device list
		firestore()
			.collection('Users')
			.doc('testAccount@smartoutlet.com')
			.set({
				outletIds: deviceList.filter(element => element != deviceID)
			})
			.then(() => {
				console.log('Removed outlet from account (ID: ' + deviceID + ')');
			});

		// Delete the device from the device collection
		firestore()
			.collection('Outlets')
			.doc(deviceID.toString())
			.delete()
			.then(() => {
				console.log('Deleted outlet: ' + deviceName + ' (ID: ' + deviceID + ')');
			});
	}

	return (
		<View style = { container }>
			<Text style = { textStyle }> Device Page </Text>
			<Text style = { deviceInfoText }> Device ID: { deviceID } </Text>
			<Text style = { deviceInfoText }> Device Name: { (deviceName != undefined) ? deviceName : 'Undefined' } </Text>
			<Text style = { deviceInfoText }> Device State: { (deviceState != undefined) ? (deviceState ? 'On' : 'Off') : 'Undefined' } </Text>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Delete'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { [fullWidthHeight, deleteButton] }
					onPress = { () => {
						// Trigger modal to popup asking if you're sure
						deleteDevice();
						navigation.goBack();
					} }
				/>
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
		marginTop: '5%'
	},
	deleteButton: {
		backgroundColor: colors.delete
	},
	registerTextView: {
		marginTop: '5%'
	}
};