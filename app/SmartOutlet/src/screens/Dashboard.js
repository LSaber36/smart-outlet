import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles, colors } from '../styles';
import { Button, ListItem } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import { setID } from '../redux';

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

	const [items, setItems] = useState([
		{ key: 1 },
		{ key: 2 }
	]);

	function addOutlet(name) {
		const newId = items.length + 1;
		const newItem = { key: newId };

		setItems(oldArray => [...oldArray, newItem]);
		console.log('Adding Outlet: ' + name + ' (ID : ' + newId + ')');
	}

	const dispatch = useDispatch();

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
									console.log('Device ' + item.key + ' pressed');
									dispatch(setID(item.key));
									navigation.navigate('Device');
								} }
							>
								<ListItem.Content style = { contentStyle }>
									<ListItem.Title style = { itemTextStyle }>
										Device { item.key }
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
						addOutlet('Living Room');
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
		marginVertical: '3%',
		backgroundColor: colors.primaryLight,
		borderBottomRightRadius: 30,
		borderTopRightRadius: 10,
		borderBottomLeftRadius: 10,
		borderTopLeftRadius: 10,
		elevation: 6
	},
	deviceItemContainer: {
		width: '100%',
		height: 48,
		backgroundColor: colors.primaryDark,
		padding: '0%',
		borderBottomRightRadius: 30,
		borderTopRightRadius: 10,
		borderBottomLeftRadius: 10,
		borderTopLeftRadius: 10,
		elevation: 3
	},
	contentStyle: {
		alignItems: 'center'
	},
	itemTextStyle: {
		color: colors.offWhite
	}
};