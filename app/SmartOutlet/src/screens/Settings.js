import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import { useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';

export const Settings = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer } = styles;
	const { textStyle, buttonView, buttonStyle } = dashboardStyles;

	const { activeUser } = useSelector(state => state.user);

	useEffect(() => {
		console.log('(Settings)  Active user email: ' + activeUser.email);
	}, []);

	return (
		<View style = { container }>
			<Text style = { textStyle }> Settings Page </Text>
			<View style = { buttonView }>
				<Button
					title = 'Back'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => navigation.goBack() }
				/>

				<Button
					title = 'Log Out'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => {
						auth()
							.signOut()
							.then(() => {
								console.log('User signed out!');
								navigation.navigate('Login');
							});
					} }
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
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '100%',
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