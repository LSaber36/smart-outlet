import React, { useState } from 'react';
import {
	View, Text, TouchableWithoutFeedback, Keyboard,
	Modal, KeyboardAvoidingView, Dimensions, ScrollView
} from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import { TextBoxEntry } from '../components';
import { Formik } from 'formik';
import * as yup from 'yup';
import auth from '@react-native-firebase/auth';
import { initNewUser } from '../services/userServices';
import { IconInCircle } from '../assets/images';

const { height, width } = Dimensions.get('screen');
const signupSchema = yup.object({
	name: yup.string()
		.required('Please enter your name'),
	email: yup.string()
		.required('Please enter your email')
		.email('Please enter a valid email'),
	password: yup.string()
		.required('Please enter your password')
		.min(8),
	verifyPassword: yup.string()
		.required('Please enter your password')
		.oneOf([yup.ref('password')], 'Passwords do not match')
});

export const Signup = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center, modalContainer } = styles;
	const {
		logoView, logoStyle, signupFormStyle, scrollViewContainerStyle, scrollViewStyle, scrollViewContent,
		mainButtonView, mainButtonStyle, loginPromptView, loginPromptText
	} = signupStyles;

	const [modalVisible, setModalVisible] = useState(false);
	const [signupError, setSignupError] = useState('');

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
					<View style = { modalContainer }>
						<View style = { modalStyles.modalView }>
							<Text style = { modalStyles.promptText }>
								Thank you for signing up!
							</Text>
							<Text style = { modalStyles.mainText }>
								An email has been sent to you to verify your account.
								Once you confirm your email, you can successfully login.
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
		<TouchableWithoutFeedback onPress = { Keyboard.dismiss }>
			<View style = { container }>
				{ renderSignupVerificationModal() }
				<View style = { logoView }>
					<IconInCircle style = { logoStyle } />
				</View>
				<Formik
					initialValues = {{ name: '', email: '', password: '', verifyPassword: '' }}
					validationSchema = { signupSchema }
					onSubmit = { (values, actions) => {
						auth()
							.createUserWithEmailAndPassword(values.email, values.password)
							.then((userCredential) => {
								actions.resetForm();

								initNewUser(userCredential.user);
								userCredential.user.sendEmailVerification();
								userCredential.user.updateProfile({
									displayName: values.name
								});
								setTimeout(() => {
									auth().signOut();
									setModalVisible(true);
								}, 500);
							})
							.catch((error) => {
								console.warn('Signup Error: ' + error.code);

								if (error.code === 'auth/email-already-in-use')
									setSignupError('Email not available');
							});
					} }
				>
					{ (props) => (
						<View style = { [center, signupFormStyle] }>
							<View style = { scrollViewContainerStyle }>
								<ScrollView
									style = { scrollViewStyle }
									contentContainerStyle = { scrollViewContent }
								>
									<TextBoxEntry
										header = 'Name'
										placeholder = 'your name'
										onChangeText = { props.handleChange('name') }
										value = { props.values.name }
										errorMessage = { props.touched.name && props.errors.name }
									/>
									<TextBoxEntry
										header = 'Email'
										placeholder = 'your.name@mail.com'
										onChangeText = { props.handleChange('email') }
										value = { props.values.email }
										errorMessage = { (signupError === '') ? (props.touched.email && props.errors.email) : signupError }
									/>
									<TextBoxEntry
										header = 'Password'
										placeholder = 'password'
										onChangeText = { props.handleChange('password') }
										value = { props.values.password }
										errorMessage = { props.touched.password && props.errors.password }
									/>
									<TextBoxEntry
										header = 'Verify Password'
										placeholder = 'password'
										onChangeText = { props.handleChange('verifyPassword') }
										value = { props.values.verifyPassword }
										errorMessage = { props.touched.verifyPassword && props.errors.verifyPassword }
									/>
								</ScrollView>
							</View>
							<View style = { [mainButtonView, center] }>
								<Button
									title = 'Sign Up'
									containerStyle = { [buttonContainer, mainButtonStyle] }
									buttonStyle = { fullWidthHeight }
									onPress = { props.handleSubmit }
								/>
							</View>
							<View style = { [loginPromptView, center] }>
								<Text style = { loginPromptText }>{ 'Already have an account? ' } </Text>
								<Text
									style = {{ color: colors.secondaryDark }}
									onPress = { () => navigation.navigate('Login') }
								>
										Log in
								</Text>
							</View>
						</View>
					) }
				</Formik>
			</View>
		</TouchableWithoutFeedback>
	);
};

const signupStyles = {
	logoView: {
		marginTop: '8%'
	},
	logoStyle: {
		height: width * 0.3,
		width: width * 0.3
	},
	signupFormStyle: {
		width: '100%'
	},
	scrollViewContainerStyle: {
		width: '85%',
		height: '55%',
		marginTop: '-4%',
		marginBottom: '4%',
		alignItems: 'center',
		borderRadius: 10,
		backgroundColor: colors.secondaryLight
	},
	scrollViewStyle: {
		width: '100%',
		height: '100%',
		marginBottom: '5%'
	},
	scrollViewContent: {
		alignItems: 'center'
	},
	mainButtonView: {
		height: '12%',
		width: '80%',
		marginTop: '10%'
	},
	mainButtonStyle: {
		width: width * 0.5,
		height: height * 0.07
	},
	loginPromptView: {
		marginTop: '1%'
	},
	loginPromptText: {
		color: colors.dark
	}
};

const modalStyles = {
	modalView: {
		height: '30%',
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
		width: width * 0.3,
		marginTop: '-5%'
	},
	mainText: {
		color: colors.dark,
		fontSize: 15,
		textAlign: 'center',
		padding: '6%',
		lineHeight: 20
	}
};