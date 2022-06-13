import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Dimensions, ScrollView } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import database from '@react-native-firebase/database';
import { useSelector } from 'react-redux';
import { deleteOutlet, setOutletState } from '../services/outletServices';
import { InfoBox } from '../components';

const { height, width } = Dimensions.get('screen');

export const Device = ({ navigation }) => {
	const [currentOutletData, setCurrentOutletData] = useState({});
	const [modalVisible, setModalVisible] = useState(false);
	const { activeUserData, outletRefList, selectedOutletID } = useSelector(state => state.user);

	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const {
		textStyle, scrollViewContainer, scrollViewStyle,
		buttonView, buttonStyle, deleteButton
	} = deviceStyles;

	useEffect(() => {
		const outletReference = database()
			.ref('/' + selectedOutletID.toString())
			.on('value', snapshot => {
				setCurrentOutletData(snapshot.val());
			});

		return () => database().ref('/' + selectedOutletID.toString()).off('value', outletReference);
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
									deleteOutlet(activeUserData, outletRefList, selectedOutletID);
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
			<View style = { [center, scrollViewContainer] }>
				<ScrollView style = { scrollViewStyle }>
					<InfoBox
						header = 'Name'
						value = { (currentOutletData.name != undefined) ? currentOutletData.name : 'Undefined' }
					/>
					<InfoBox
						header = 'State'
						value = { (currentOutletData.state != undefined) ? (currentOutletData.state ? 'On' : 'Off') : 'Undefined' }
					/>
					<InfoBox
						header = 'Power'
						value = { (currentOutletData.data != undefined) ? currentOutletData.data : 'Undefined' }
					/>
					<InfoBox
						header = 'ID'
						value = { selectedOutletID }
					/>
				</ScrollView>
			</View>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Toggle State'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => {
						setOutletState(selectedOutletID, !currentOutletData.state);
					} }
				/>
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
	scrollViewContainer: {
		height: '55%',
		width: '90%',
		marginTop: '5%',
		borderRadius: 10,
		backgroundColor: colors.secondaryLight
	},
	scrollViewStyle: {
		width: '90%',
		marginTop: '4%',
		marginBottom: '4%',
		backgroundColor: colors.secondaryLight
	},
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '15%'
	},
	buttonStyle: {
		width: '50%',
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