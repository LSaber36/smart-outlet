import React, { useState } from 'react';
import { View, Text, Modal, KeyboardAvoidingView, Dimensions } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';

const { height, width } = Dimensions.get('screen');

export const Signup = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const { textStyle, buttonView, buttonStyle, loginTextView } = loginStyles;

	const [modalVisible, setModalVisible] = useState(false);

	const renderSignupVerificationModal = () => {
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
								Thank you for signing up!
							</Text>
							<Text style = { modalStyles.mainText }>
								An email has been sent to you to verify your account.
								Once you confirm your email. you can successfully login.
							</Text>
							<View style = { modalStyles.buttonView }>
								<Button
									title = 'Got It!'
									containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
									buttonStyle = { fullWidthHeight }
									onPress = { () => navigation.navigate('Login') }
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
			{ renderSignupVerificationModal() }
			<Text style = { textStyle }> Signup Page </Text>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Sign Up'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => setModalVisible(true) }
				/>
			</View>
			<View style = { [loginTextView, center] }>
				<Text>{ 'Already have an account? ' } </Text>
				<Text
					style = {{ color: colors.secondaryDark }}
					onPress = { () => navigation.navigate('Login') }
				>
					Log in
				</Text>
			</View>
		</View>
	);
};

const loginStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		marginTop: '65%'
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
	loginTextView: {
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
		height: '30%',
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
		height: '60%',
		marginTop: '-5%'
	},
	mainText: {
		color: colors.dark,
		fontSize: 15,
		textAlign: 'center',
		padding: '6%'
	}
};