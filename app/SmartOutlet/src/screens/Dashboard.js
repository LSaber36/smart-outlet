import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles, colors } from '../styles';
import { Button, ListItem } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveID } from '../redux';
import { addOutlet } from '../services/outletServices';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']);

export const Dashboard = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const {
		textStyle,
		noOutletsMessage,
		buttonStyle,
		addDeviceButtonView,
		scrollViewContainer,
		scrollViewStyle,
		deviceItemContainer,
		deviceItemStyle,
		contentStyle,
		itemTextStyle
	} = dashboardStyles;

	const { activeUserData, outletRefList } = useSelector(state => state.user);
	const dispatch = useDispatch();

	const renderListOrMessage = (list) => {
		return (list != undefined && list.length > 0) ?
			outletRefList
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((outletRef) => (
					<ListItem
						key = { outletRef.id }
						style = { deviceItemStyle }
						containerStyle = { deviceItemContainer }
						onPress = { () => {
							dispatch(setActiveID(outletRef.id));
							navigation.navigate('Device');
						} }
					>
						<ListItem.Content style = { contentStyle }>
							<ListItem.Title style = { itemTextStyle }>
								{ outletRef.name }
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
			<Text style = { textStyle }> Devices </Text>
			<View style = { [center, scrollViewContainer] }>
				<ScrollView style = { scrollViewStyle }>
					{ renderListOrMessage(outletRefList) }
				</ScrollView>
			</View>
			<View style = { addDeviceButtonView }>
				<Button
					title = 'Add a device'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { [fullWidthHeight] }
					onPress = { () => {
						addOutlet(activeUserData, outletRefList, 'Living Room');
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
		height: '15%',
		width: '80%',
		alignItems: 'center',
		justifyContent: 'space-around',
		marginTop: '15%'
	},
	buttonStyle: {
		width: '50%',
		height: '60%'
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
		alignItems: 'flex-start',
		marginLeft: '6%'
	},
	itemTextStyle: {
		color: colors.offWhite
	}
};