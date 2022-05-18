import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles, colors } from '../styles';
import { Button, ListItem } from 'react-native-elements';

export const Dashboard = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const {
		textStyle,
		navButtonView,
		buttonStyle,
		addDeviceButtonView,
		scrollViewContainer,
		scrollViewStyle,
		deviceItemContainer,
		deviceItemStyle,
		contentStyle,
		itemTextStyle
	} = dashboardStyles;

	// Use a static list for now, but use a dynamic one later
	const items = [
		{ value: 'Device', key: 1 },
		{ value: 'Device', key: 2 },
		{ value: 'Device', key: 3 },
		{ value: 'Device', key: 4 },
		{ value: 'Device', key: 5 },
		{ value: 'Device', key: 6 },
		{ value: 'Device', key: 7 },
		{ value: 'Device', key: 8 },
		{ value: 'Device', key: 9 },
		{ value: 'Device', key: 10 },
		{ value: 'Device', key: 11 },
		{ value: 'Device', key: 12 }
	];

	return (
		<View style = { container }>
			<View style = { navButtonView }>
				<Button
					title = '?'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
				/>
				<Button
					title = 'Settings'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => { navigation.navigate('Settings') } }
				/>
			</View>
			<Text style = { textStyle }> Dashboard Page </Text>
			<View style = { [center, scrollViewContainer] }>
				<ScrollView style = { scrollViewStyle }>
					{
						items.map((item, i) => (
							<ListItem
								key = { i }
								style = { deviceItemStyle }
								containerStyle = { deviceItemContainer }
								onPress = { () => {
									console.log(item.value + ' ' + item.key + ' pressed');
									navigation.navigate('Device', { value: item.value, key: item.key });
								} }
							>
								<ListItem.Content style = { contentStyle }>
									<ListItem.Title style = { itemTextStyle }>
										{ item.value } { item.key }
									</ListItem.Title>
								</ListItem.Content>
							</ListItem>
						))
					}
				</ScrollView>
			</View>
			<View style = { addDeviceButtonView }>
				<Button
					title = 'Add a device'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { [fullWidthHeight] }
					onPress = { () => {

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
	addDeviceButtonView: {
		height: '10%',
		width: '80%',
		marginTop: '5%',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	navButtonView: {
		height: '10%',
		width: '80%',
		marginTop: '5%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	buttonStyle: {
		width: '40%',
		height: '80%'
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
	deviceItemStyle: {
		width: '85%',
		height: 48,
		alignSelf: 'center',
		marginVertical: '2%',
		backgroundColor: colors.primaryLight,
		borderBottomRightRadius: 30,
		borderTopRightRadius: 5,
		borderBottomLeftRadius: 5,
		borderTopLeftRadius: 5,

		shadowColor: 'black',
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowOpacity: 1,
		shadowRadius: 5,

		elevation: 6
	},
	deviceItemContainer: {
		width: '100%',
		height: 48,
		backgroundColor: colors.primaryDark,
		padding: '0%',
		borderBottomRightRadius: 30,
		borderTopRightRadius: 5,
		borderBottomLeftRadius: 5,
		borderTopLeftRadius: 5,

		shadowColor: 'black',
		shadowOffset: {
			width: 15,
			height: 8
		},
		shadowOpacity: 1,
		shadowRadius: 2,

		elevation: 3
	},
	contentStyle: {
		alignItems: 'center'
	},
	itemTextStyle: {
		color: colors.offWhite
	}
};