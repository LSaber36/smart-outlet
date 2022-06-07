import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Dimensions } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import { deleteOutlet } from '../services/outletServices';
import { InfoBox } from '../components';

const { height, width } = Dimensions.get('screen');

export const Device = ({ navigation }) => {
	const [outletData, setOutletData] = useState({});
	const [modalVisible, setModalVisible] = useState(false);
	const { activeUser, outletRefList, selectedOutletID } = useSelector(state => state.user);

	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, deviceInfo, buttonView, buttonStyle, deleteButton } = deviceStyles;

	useEffect(() => {
		const outletUnsubscribe = firestore()
			.collection('Outlets')
			.doc(selectedOutletID.toString())
			.onSnapshot(documentSnapshot => {
				setOutletData(documentSnapshot.data());
			});

		return () => outletUnsubscribe();
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
									deleteOutlet(activeUser, outletRefList, selectedOutletID);
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
			<View style = { deviceInfo }>
				<InfoBox
					header = 'Outlet ID'
					value = { selectedOutletID }
				/>
				<InfoBox
					header = 'Outlet Name'
					value = { (outletData.name != undefined) ? outletData.name : 'Undefined' }
				/>
				<InfoBox
					header = 'Outlet State'
					value = { (outletData.state != undefined) ? (outletData.state ? 'On' : 'Off') : 'Undefined' }
				/>
			</View>
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
	deviceInfo: {
		width: '90%',
		alignItems: 'flex-start',
		marginTop: '8%'
	},
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '45%'
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