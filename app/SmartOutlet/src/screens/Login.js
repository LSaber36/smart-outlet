import React, { useState } from 'react';
import {
	View, Text, TouchableWithoutFeedback, Keyboard,
	Modal, KeyboardAvoidingView, Dimensions
} from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import { TextBox } from '../components';
import { Formik } from 'formik';
import * as yup from 'yup';
import auth from '@react-native-firebase/auth';

const { height, width } = Dimensions.get('screen');
const forgotPasswordSchema = yup.object({
	email: yup.string()
		.required('please enter your email')
		.email('please enter a valid email')
});
const loginSchema = yup.object({
	email: yup.string()
		.required('please enter your email')
		.email('please enter a valid email'),
	password: yup.string()
		.required('please enter your password')
});

export const Login = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const {
		buttonView, buttonStyle, registerTextView,
		loginFormStyle, forgotPasswordText, forgotPasswordView
	} = loginStyles;

	const [modalVisible, setModalVisible] = useState(false);
	const [loginError, setLoginError] = useState('');

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
									validationSchema = { forgotPasswordSchema }
									onSubmit = { (values, actions) => {
										console.log('Forgot Password Data: ' + JSON.stringify(values));
										actions.resetForm();
										setModalVisible(false);
									} }
								>
									{ (props) => (
										<View style = { [center, modalStyles.formStyle] }>
											<TextBox
												style = { modalStyles.textInput }
												header = ''
												placeholder = 'your.name@mail.com'
												onChangeText = { props.handleChange('email') }
												value = { props.values.email }
												errorMesage = { props.touched.email && props.errors.email }
											/>

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
		<TouchableWithoutFeedback onPress = { Keyboard.dismiss }>
			<View style = { container }>
				{ renderForgotPasswordModal() }
				<Formik
					initialValues = {{ email: '', password: '' }}
					validationSchema = { loginSchema }
					onSubmit = { (values, actions) => {
						auth()
							.signInWithEmailAndPassword(values.email, values.password)
							.then((userCredential) => {
								if (userCredential.user.emailVerified) {
									console.log('Signed in successfully');
									actions.resetForm();
									setLoginError('');
								}
								else {
									console.log('Not verified');
									auth().signOut();
									setLoginError('Please verify your account');
								}
							})
							.catch((error) => {
								console.log('Login Error: ' + error.code);

								if (error.code === 'auth/user-not-found')
									setLoginError('User not found');
								else if (error.code === 'auth/wrong-password')
									setLoginError('Incorrect Password');
							});
					} }
				>
					{ (props) => (
						<View style = { [center, loginFormStyle] }>
							<TextBox
								header = 'Email'
								placeholder = 'your.name@mail.com'
								onChangeText = { props.handleChange('email') }
								value = { props.values.email }
								errorMesage = { (loginError === '') ? (props.touched.email && props.errors.email) : loginError }
							/>
							<TextBox
								header = 'Password'
								placeholder = 'password'
								onChangeText = { props.handleChange('password') }
								value = { props.values.password }
								errorMesage = { props.touched.password && props.errors.password }
							/>
							<View style = { [forgotPasswordView, center] }>
								<Text
									style = { forgotPasswordText }
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
									onPress = { props.handleSubmit }
								/>
							</View>
							<View style = { [registerTextView, center] }>
								<Text>{ 'Don\'t have an account? ' }</Text>
								<Text
									style = {{ color: colors.secondaryDark }}
									onPress = { () => {
										navigation.navigate('Signup');
										setTimeout(() => {
											props.resetForm();
											setLoginError('');
										}, 250);
									} }
								>
									Register here
								</Text>
							</View>
						</View>
					) }
				</Formik>
			</View>
		</TouchableWithoutFeedback>
	);
};

const loginStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		paddingTop: '5%'
	},
	buttonView: {
		height: '14%',
		width: '80%',
		marginTop: '35%'
	},
	buttonStyle: {
		width: '80%',
		height: '80%'
	},
	forgotPasswordText: {
		color: colors.secondaryDark,
		marginLeft: '30%'
	},
	forgotPasswordView: {
		marginTop: '2%'
	},
	loginFormStyle: {
		width: '100%',
		marginTop: '25%'
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
		height: '38%',
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
		marginTop: '15%',
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
		height: '30%',
		width: '85%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginBottom: '10%',
		marginTop: '3%'
	},
	buttonStyle: {
		width: '40%',
		height: '80%'
	},
	formStyle: {
		width: '100%'
	},
	textInput: {
		width: '75%'
	}
};