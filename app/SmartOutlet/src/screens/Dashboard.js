import React, { useState } from 'react';
import {
	View, Text, TouchableWithoutFeedback, Keyboard,
	Modal, Dimensions, ScrollView
} from 'react-native';
import { styles, colors } from '../styles';
import { Button, ListItem } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveID } from '../redux';
import { addOutlet } from '../services/outletServices';
import { PacmanIndicator } from 'react-native-indicators';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TextBoxEntry } from '../components';
import { Formik } from 'formik';
import * as yup from 'yup';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const { height, width } = Dimensions.get('screen');
const newOutletSchema = yup.object({
	name: yup.string()
		.required(' Please enter an outlet name')
});

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
	const [modalVisible, setModalVisible] = useState(false);
	const [bleIsLoading, setBleIsLoading] = useState(true);
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

	const renderCheckOrLoadingIndicator = (isLoadingBle) => {
		return (isLoadingBle) ?
			(<PacmanIndicator
				color = { colors.primaryDark }
				size = { 100 }
				hidesWhenStopped = { true }
				animating = { true }
			/>) :
			(<Icon
				name = 'check-circle'
				color = { colors.primaryDark }
				size = { 70 }
			/>);
	};

	const renderAddDeviceModal = () => {
		return (
			<Modal
				animationType = 'slide'
				transparent = { true }
				visible = { modalVisible }
			>
				<TouchableWithoutFeedback onPress = { Keyboard.dismiss }>
					<View style = { modalStyles.modalContainer }>
						<View style = { modalStyles.modalView }>
							<Text style = { modalStyles.headerText }>
							Add Device
							</Text>
							<View style = { modalStyles.indicatorView }>
								{ renderCheckOrLoadingIndicator(bleIsLoading) }
							</View>
							<Formik
								initialValues = {{ name: '' }}
								validationSchema = { newOutletSchema }
								onSubmit = { (values, actions) => {
									actions.resetForm();
									addOutlet(activeUserData, outletRefList, values.name);
									setModalVisible(false);
								} }
							>
								{ (props) => (
									<View style = { [center, modalStyles.formStyle] }>
										<TextBoxEntry
											style = { modalStyles.textInput }
											header = 'New Device Name'
											placeholder = 'New outlet name'
											onChangeText = { props.handleChange('name') }
											value = { props.values.name }
											errorMesage = { props.touched.name && props.errors.name }
										/>
										<View style = { modalStyles.buttonView }>
											<Button
												title = 'Cancel'
												containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
												buttonStyle = { fullWidthHeight }
												onPress = { () => {
													setModalVisible(false);
												} }
											/>
											<Button
												title = 'Add Device'
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
				</TouchableWithoutFeedback>
			</Modal>
		);
	};

	return (
		<View style = { container }>
			{ renderAddDeviceModal() }
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
						setBleIsLoading(true);
						setModalVisible(true);
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

const modalStyles = {
	modalContainer: {
		height: height,
		width: width,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.4)'
	},
	modalView: {
		height: '75%',
		width: '90%',
		marginTop: '-10%',
		alignItems: 'center',
		backgroundColor: colors.white,
		borderRadius: 10
	},
	headerText: {
		color: colors.dark,
		fontSize: 28,
		marginTop: '10%'
	},
	indicatorView: {
		height: '12%',
		width: '40%',
		marginTop: '5%',
		alignItems: 'center'
	},
	formStyle: {
		width: '100%'
	},
	textInput: {
		width: '75%'
	},
	buttonView: {
		height: '18%',
		width: '90%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginTop: '60%'
	},
	buttonStyle: {
		width: '40%',
		height: '65%'
	},
	deleteButtonStyle: {
		backgroundColor: colors.delete
	}
};