import React, { useState } from 'react';
import {
	View, Text, TextInput, TouchableWithoutFeedback, Keyboard,
	Modal, KeyboardAvoidingView, Dimensions
} from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import { Formik } from 'formik';
import * as yup from 'yup';

const { height, width } = Dimensions.get('screen');
const inputSchema = yup.object({
	email: yup.string()
		.required()
		.email()
});

export const Login = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center, input, errorText } = styles;
	const { textStyle, buttonView, buttonStyle, registerTextView } = loginStyles;

	const [modalVisible, setModalVisible] = useState(false);

	const renderForgotPasswordModal = () => {
		return (
			<Modal
				animationType = 'slide'
				transparent = { true }
				visible = { modalVisible }
			>
				<TouchableWithoutFeedback onPress = { Keyboard.dismiss }>
					<KeyboardAvoidingView
						behavior = 'height'
						enabled
					>
						<View style = { modalStyles.modalContainer }>
							<View style = { modalStyles.modalView }>
								<Text style = { modalStyles.promptText }>
									Reset Password
								</Text>
								<Text style = { modalStyles.mainText }>
									Please enter your email so we can send you a password reset link
								</Text>
								<Formik
									initialValues = {{ email: '' }}
									validationSchema = { inputSchema }
									onSubmit = { (values, actions) => {
										console.log('Submitted Data: ' + JSON.stringify(values));
										actions.resetForm();
										setModalVisible(false);
									} }
								>
									{ (props) => (
										<View style = { [center, modalStyles.formStyle] }>
											<TextInput
												style = { [input, modalStyles.textInput] }
												placeholder = 'your.name@mail.com'
												onChangeText = { props.handleChange('email') }
												value = { props.values.email }
											/>
											<Text style = { errorText }>
												{ props.touched.email && props.errors.email }
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
													onPress = { props.handleSubmit }
												/>
											</View>
										</View>
									) }
								</Formik>
							</View>
						</View>
					</KeyboardAvoidingView>
				</TouchableWithoutFeedback>
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
			<View style = { [center, buttonView] }>
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
		paddingTop: '5%'
	},
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '90%'
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
		marginTop: '-45%',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		backgroundColor: colors.white,
		borderRadius: 10
	},
	promptText: {
		color: colors.dark,
		fontSize: 22,
		marginTop: '10%',
		paddingBottom: '3%',
		borderBottomWidth: 1,
		borderBottomColor: colors.dark
	},
	mainText: {
		color: colors.dark,
		fontSize: 15,
		textAlign: 'center',
		padding: '6%',
		marginTop: '6%',
		marginBottom: '-2%',
		lineHeight: 20
	},
	buttonView: {
		height: '35%',
		width: '85%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginBottom: '5%',
		marginTop: '3%'
	},
	buttonStyle: {
		width: '40%',
		height: '80%'
	},
	formStyle: {
		width: '100%',
		marginTop: '2%'
	},
	textInput: {
		width: '75%'
	}
};