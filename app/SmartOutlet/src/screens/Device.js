import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Dimensions } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import { deleteOutlet } from '../services/outletServices';

const { height, width } = Dimensions.get('screen');

export const Device = ({ navigation }) => {
	const [outletData, setOutletData] = useState({});
	const [modalVisible, setModalVisible] = useState(false);
	const { activeUser, outletIDList, selectedOutletID } = useSelector(state => state.user);

	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, deviceInfoText, buttonView, buttonStyle, deleteButton } = deviceStyles;

	useEffect(() => {
		const unsubscribeOutlets = firestore()
			.collection('Outlets')
			.doc(selectedOutletID.toString())
			.onSnapshot(documentSnapshot => {
				setOutletData(documentSnapshot.data());
			});

		return () => {
			unsubscribeOutlets();
		};
	}, []);

	const renderConfirmDeleteModal = () => {
		return (
			<Modal
				animationType = 'slide'
				transparent = { true }
				visible = { modalVisible }
			>
				<View style = { modalStyles.modalContainer }>
					<View style = { modalStyles.modalView }>
						<Text style = { modalStyles.promptText }>
							Are you sure you want to delete this device?
						</Text>
						<View style = { modalStyles.buttonView }>
							<Button
								title = 'Cancel'
								containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
								buttonStyle = { fullWidthHeight }
								onPress = { () => setModalVisible(false) }
							/>
							<Button
								title = 'Delete'
								containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
								buttonStyle = { [fullWidthHeight, modalStyles.deleteButtonStyle] }
								onPress = { () => {
									deleteOutlet(activeUser, outletIDList, selectedOutletID);
									navigation.goBack();
								} }
							/>
						</View>
					</View>
				</View>
			</Modal>
		);
	};

	return (
		<View style = { container }>
			{ renderConfirmDeleteModal() }
			<Text style = { textStyle }> Device Page </Text>
			<Text style = { deviceInfoText }> Outlet ID: { selectedOutletID } </Text>
			<Text style = { deviceInfoText }> Outlet Name: { (outletData.name != undefined) ? outletData.name : 'Undefined' } </Text>
			<Text style = { deviceInfoText }> Outlet State: { (outletData.state != undefined) ? (outletData.state ? 'On' : 'Off') : 'Undefined' } </Text>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Delete'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { [fullWidthHeight, deleteButton] }
					onPress = { () => {
						setModalVisible(true);
					} }
				/>
			</View>
		</View>
	);
};

const deviceStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		paddingTop: '5%'
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

const modalStyles = {
	modalContainer: {
		height: height,
		width: width,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.4)'
	},
	modalView: {
		height: '35%',
		width: '90%',
		marginTop: '-30%',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		backgroundColor: colors.white,
		borderRadius: 10
	},
	promptText: {
		color: colors.dark,
		fontSize: 22,
		paddingTop: '5%',
		margin: '10%'
	},
	buttonView: {
		height: '30%',
		width: '90%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginBottom: '5%'
	},
	buttonStyle: {
		width: '40%',
		height: '65%'
	},
	deleteButtonStyle: {
		backgroundColor: colors.delete
	}
};