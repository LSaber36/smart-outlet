import React, { useState } from 'react';
import { View, Text, Modal, Dimensions } from 'react-native';
import { styles, colors } from '../styles';
import { Button, Avatar } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import { loadUserData, setOutletRefList } from '../redux';
import { InfoBox } from '../components';

const { height, width } = Dimensions.get('screen');

export const Settings = () => {
	const {	container, fullWidthHeight, buttonContainer, modalContainer } = styles;
	const {
		avatarView, avatarStyle, userDataView, userDataHeader,
		userData, buttonView, mainButtonStyle
	} = dashboardStyles;

	const { activeUserData } = useSelector(state => state.user);
	const [modalVisible, setModalVisible] = useState(false);
	const dispatch = useDispatch();

	const handleImagePicker = async () => {
		ImagePicker
			.openPicker({
				width: 400,
				height: 400,
				cropping: true,
				freeStyleCropEnabled: true,
				cropperCircleOverlay: true
			})
			.then(image => {
				let imageRef = storage().ref(activeUserData.email + '/profileImage.png');

				imageRef
					.putFile(image.path, { contentType: 'image/jpg' })
					.then(() => {
						console.log('Image uploaded to firebase storage');

						imageRef.getDownloadURL().then((url) => {
							auth()
								.currentUser
								.updateProfile({
									photoURL: url
								})
								.then(() => {
									auth().currentUser.reload();
									dispatch(loadUserData(auth().currentUser));
								})
								.catch((error) => {
									console.log(error);
								});
						});
					})
					.catch((error) => {
						console.log(error);
					});
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED')
					console.log(error);
			});
	};

	const renderConfirmLogoutModal = () => {
		return (
			<Modal
				animationType = 'slide'
				transparent = { true }
				visible = { modalVisible }
			>
				<View style = { modalContainer }>
					<View style = { modalStyles.modalView }>
						<Text style = { modalStyles.promptText }>
							Are you sure you want to logout?
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
										.then(() => {
											console.log('User signed out!');
											console.log('Clearing local ref list');
											dispatch(setOutletRefList([]));
										})
										.catch((error) => {
											console.log(error);
										});
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
			<View style = { avatarView }>
				<Avatar
					size = { 200 }
					rounded = { true }
					containerStyle = { avatarStyle }
					source = { (activeUserData && activeUserData.photoURL) ? { uri: activeUserData.photoURL } : require('../assets/default_profile_icon.png') }
				>
					<Avatar.Accessory
						size = { 45 }
						underlayColor = { colors.offWhite }
						onPress = { () => handleImagePicker() }
					/>
				</Avatar>
			</View>
			<View style = { userDataView }>
				<InfoBox
					header = 'Display Name'
					value = { activeUserData?.displayName }
				/>
				<InfoBox
					header = 'Email'
					value = { activeUserData?.email }
				/>
			</View>
			<View style = { buttonView }>
				<Button
					title = 'Log Out'
					containerStyle = { [buttonContainer, mainButtonStyle] }
					buttonStyle = { [fullWidthHeight, modalStyles.deleteButtonStyle] }
					onPress = { () => setModalVisible(true) }
				/>
			</View>
		</View>
	);
};

const dashboardStyles = {
	avatarView: {
		marginTop: '5%'
	},
	avatarStyle: {
		elevation: 3
	},
	userDataView: {
		width: '90%',
		marginTop: '12%',
		alignItems: 'center',
		paddingTop: '5%',
		borderRadius: 10,
		backgroundColor: colors.secondaryLight
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
		marginTop: '25%',
		alignItems: 'center'
	},
	mainButtonStyle: {
		height: height * 0.07,
		marginBottom: '5%'
	}
};

const modalStyles = {
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
		width: width * 0.3
	},
	deleteButtonStyle: {
		backgroundColor: colors.delete
	}
};