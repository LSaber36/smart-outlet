import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const SplashScreen = () => {
	return (
		<View style = { styles.mainView }>
			<View style = { styles.textStyle }>
				<Text> Splash Page </Text>
			</View>
		</View>
	);
};

const styles = {
	mainView: {
		marginTop: 40,
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'blue'
	},
	textStyle: {
		color: 'red'
	}
};

export default SplashScreen;