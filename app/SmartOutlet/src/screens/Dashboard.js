import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles, colors } from '../styles';
import { Button, ListItem } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { setID } from '../redux';

export const Dashboard = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const {
		textStyle,
		noOutletsMessage,
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

	const [outletIDList, setOutletIDList] = useState([]);
	const { activeUser } = useSelector(state => state.user);
	const dispatch = useDispatch();

	useEffect(() => {
		console.log('(Dashboard) Active user email: ' + activeUser.email);

		const unsubscribe = firestore()
			.collection('Users')
			.doc(activeUser.email)
			.onSnapshot(documentSnapshot => {
				const currentOutlets = [];

				if (documentSnapshot != undefined) {
					documentSnapshot.get('outletIds').map((id) => {
						currentOutlets.push(id);
					});
				}

				setOutletIDList(currentOutlets);
			});

		return () => unsubscribe();
	}, []);

	const addOutlet = (newOutletName) => {
		const newOutletId = outletIDList.length + 1;

		console.log('Current List: ' + outletIDList);
		console.log('New List: ' + [outletIDList, newOutletId]);

		// Add a new outlet to the outlet collection
		firestore()
			.collection('Outlets')
			.doc(newOutletId.toString())
			.set({
				name: newOutletName,
				state: false
			})
			.then(() => {
				console.log('Added outlet: ' + newOutletName + ' (ID: ' + newOutletId + ')');
			});

		// Add the outlet to the user's outlet list
		firestore()
			.collection('Users')
			.doc(activeUser.email)
			.set({
				outletIds: [...outletIDList, newOutletId]
			})
			.then(() => {
				console.log('Added new outlet to account (ID: ' + newOutletId + ')');
			});
	};

	const renderListOrMessage = (list) => {
		return (list.length > 0) ?
			outletIDList.map((outletID) => (
				<ListItem
					key = { outletID }
					style = { deviceItemStyle }
					containerStyle = { deviceItemContainer }
					onPress = { () => {
						console.log('Device ' + outletID + ' pressed');
						dispatch(setID(outletID));
						navigation.navigate('Device');
					} }
				>
					<ListItem.Content style = { contentStyle }>
						<ListItem.Title style = { itemTextStyle }>
						Device { outletID }
						</ListItem.Title>
					</ListItem.Content>
				</ListItem>
			)) :
			(
				<View style = { center }>
					<Text style = { noOutletsMessage }> No outlets added </Text>
				</View>
			);
	};

	return (
		<View style = { container }>
			<Text style = { textStyle }> Dashboard Page </Text>
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
					onPress = { () => navigation.navigate('Settings') }
				/>
			</View>
			<View style = { [center, scrollViewContainer] }>
				<ScrollView style = { scrollViewStyle }>
					{ renderListOrMessage(outletIDList) }
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
	noOutletsMessage: {
		color: colors.dark,
		fontSize: 25,
		marginTop: '25%'
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