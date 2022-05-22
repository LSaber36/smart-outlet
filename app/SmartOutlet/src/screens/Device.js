import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';

export const Device = ({ navigation }) => {
	const [outletState, setOutletState] = useState(false);
	const [outletName, setOutletName] = useState('');
	const [outletIDList, setOutletIDList] = useState([]);
	// TODO: Replace with outletID
	const { outletID } = useSelector(state => state.user);

	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, deviceInfoText, buttonView, buttonStyle, deleteButton } = deviceStyles;

	useEffect(() => {
		const unsubscribeOutlets = firestore()
			.collection('Outlets')
			.doc(outletID.toString())
			.onSnapshot(documentSnapshot => {
				console.log('Outlet ' + outletID + ' State: ' + documentSnapshot.get('state'));
				console.log('Outlet ' + outletID + ' Name: ' + documentSnapshot.get('name'));
				setOutletState(documentSnapshot.get('state'));
				setOutletName(documentSnapshot.get('name'));
			});

		const unsubscribeUser = firestore()
			.collection('Users')
			.doc('testAccount@smartoutlet.com')
			.onSnapshot(documentSnapshot => {
				console.log('Current outlet list: ' + documentSnapshot.get('outletIds'));
				setOutletIDList(documentSnapshot.get('outletIds'));
			});

		return () => {
			unsubscribeOutlets();
			unsubscribeUser();
		};
	}, []);

	function deleteOutlet() {
		console.log('Deleting outlet with ID: ' + outletID);
		console.log('Filtered List: ' + outletIDList.filter(element => element != outletID));

		// Remove the outlet from the user's outlet list
		firestore()
			.collection('Users')
			.doc('testAccount@smartoutlet.com')
			.set({
				outletIds: outletIDList.filter(element => element != outletID)
			})
			.then(() => {
				console.log('Removed outlet from account (ID: ' + outletID + ')');
			});

		// Delete the outlet from the outlet collection
		firestore()
			.collection('Outlets')
			.doc(outletID.toString())
			.delete()
			.then(() => {
				console.log('Deleted outlet: ' + outletName + ' (ID: ' + outletID + ')');
			});
	}

	return (
		<View style = { container }>
			<Text style = { textStyle }> Device Page </Text>
			<Text style = { deviceInfoText }> Outlet ID: { outletID } </Text>
			<Text style = { deviceInfoText }> Outlet Name: { (outletName != undefined) ? outletName : 'Undefined' } </Text>
			<Text style = { deviceInfoText }> Outlet State: { (outletState != undefined) ? (outletState ? 'On' : 'Off') : 'Undefined' } </Text>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Delete'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { [fullWidthHeight, deleteButton] }
					onPress = { () => {
						// Trigger modal to popup asking if you're sure
						deleteOutlet();
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