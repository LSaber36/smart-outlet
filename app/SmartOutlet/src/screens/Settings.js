import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Dimensions } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import { useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';

const { height, width } = Dimensions.get('screen');

export const Settings = () => {
	const {	container, fullWidthHeight, buttonContainer } = styles;
	const { textStyle, userDataView, userDataHeader, userData, buttonView, buttonStyle } = dashboardStyles;

	const { activeUser } = useSelector(state => state.user);
	const [modalVisible, setModalVisible] = useState(false);

	useEffect(() => {
		console.log('(Settings)  Active user email: ' + activeUser.email);
	}, []);

	const renderConfirmLogoutModal = () => {
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
								title = 'Log Out'
								containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
								buttonStyle = { [fullWidthHeight, modalStyles.deleteButtonStyle] }
								onPress = { () => {
									auth()
										.signOut()
										.then(() => { console.log('User signed out!') });
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
			{ renderConfirmLogoutModal() }
			<Text style = { textStyle }> Settings Page </Text>
			<View style = { userDataView }>
				<Text style = { userDataHeader }> Display Name: </Text>
				<Text style = { userData }> { activeUser?.displayName } </Text>
				<Text style = { userDataHeader }> Email: </Text>
				<Text style = { userData }> { activeUser?.email } </Text>
			</View>
			<View style = { buttonView }>
				<Button
					title = 'Log Out'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { [fullWidthHeight, modalStyles.deleteButtonStyle] }
					onPress = { () => setModalVisible(true) }
				/>
			</View>
		</View>
	);
};

const dashboardStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		marginTop: '5%'
	},
	userDataView: {
		width: '65%',
		marginTop: '5%'
	},
	userDataHeader: {
		color: colors.dark,
		fontSize: 20,
		marginTop: '10%',
		alignItems: 'flex-start'
	},
	userData: {
		color: colors.dark,
		fontSize: 15,
		marginTop: '2%',
		alignItems: 'flex-start',
		marginLeft: '1%'
	},
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '70%',
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