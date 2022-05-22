import React, { useState } from 'react';
import { View, Text, Modal, KeyboardAvoidingView, Dimensions } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';

const { height, width } = Dimensions.get('screen');

export const Login = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, buttonView, buttonStyle, registerTextView } = loginStyles;

	const [modalVisible, setModalVisible] = useState(false);

	const renderForgotPasswordModal = () => {
		return (
			<Modal
				animationType = 'slide'
				transparent = { true }
				visible = { modalVisible }
			>
				<KeyboardAvoidingView
					behavior = 'height'
					enabled
				>
					<View style = { modalStyles.modalContainer }>
						<View style = { modalStyles.modalView }>
							<Text style = { modalStyles.promptText }>
								Reset Password
							</Text>
							<View style = { modalStyles.buttonView }>
								<Button
									title = 'Cancel'
									containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
									buttonStyle = { fullWidthHeight }
									onPress = { () => setModalVisible(false) }
								/>
								<Button
									title = 'Send Email'
									containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
									buttonStyle = { fullWidthHeight }
									onPress = { () => { } }
								/>
							</View>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		);
	};

	return (
		<View style = { container }>
			{ renderForgotPasswordModal() }
			<Text style = { textStyle }> Login Page </Text>
			<View style = { [registerTextView, center] }>
				<Text
					style = {{ color: colors.secondaryDark }}
					onPress = { () => setModalVisible(true) }
				>
					{ 'Forgot your password? ' }
				</Text>
			</View>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Login'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => navigation.navigate('Dashboard') }
				/>
			</View>
			<View style = { [registerTextView, center] }>
				<Text>{ 'Don\'t have an account? ' }</Text>
				<Text
					style = {{ color: colors.secondaryDark }}
					onPress = { () => navigation.navigate('Signup') }
				>
					Register here
				</Text>
			</View>
		</View>
	);
};

const loginStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		paddingTop: '45%'
	},
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '40%'
	},
	buttonStyle: {
		width: '80%',
		height: '80%'
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
		backgroundColor: colors.offWhite,
		borderRadius: 10
	},
	promptText: {
		color: colors.dark,
		fontSize: 22,
		paddingTop: '5%',
		margin: '10%',
		paddingBottom: '3%',
		borderBottomWidth: 1,
		borderBottomColor: colors.dark
	},
	buttonView: {
		height: '30%',
		width: '90%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	buttonStyle: {
		width: '40%',
		height: '55%'
	}
};