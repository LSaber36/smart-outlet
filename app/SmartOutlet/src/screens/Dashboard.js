import React, { useEffect, useState } from 'react';
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
import { LogBox } from 'react-native';
import { TextBoxEntry } from '../components';
import { Formik } from 'formik';
import * as yup from 'yup';
import { BleManager } from 'react-native-ble-plx';
import {
	scanForOutlet,
	connectToOutlet,
	sendDataToCharacteristic,
	getDataFromCharacteristic,
	subscribeToCharacteristic
} from '../services/bluetoothServices';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const { height, width } = Dimensions.get('screen');
const newOutletSchema = yup.object({
	name: yup.string()
		.required('Please enter an outlet name')
});
const manager = new BleManager();

export const Dashboard = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center, disabledButton, modalContainer } = styles;
	const {
		textStyle,
		noOutletsMessage,
		mainButtonStyle,
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
	const [bluetoothReady, setBluetoothReady] = useState(false);
	const [bleIsLoading, setBleIsLoading] = useState(true);
	const [bleConfirmed, setBleConfirmed] = useState(false);
	const dispatch = useDispatch();

	// Keep track of adapter state
	useEffect(() => {
		const subscription = manager.onStateChange((state) => {
			if (state === 'PoweredOn') {
				setBluetoothReady(true);
				subscription.remove();
			}
			else {
				setBluetoothReady(false);
			}
		}, true);

		return () => subscription.remove();
	});

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
				size = { 115 }
				hidesWhenStopped = { true }
				animating = { true }
			/>) :
			(<Icon
				name = 'check-circle'
				color = { colors.primaryDark }
				size = { 80 }
			/>);
	};

	const renderModalBody = (props) => {
		// Set the header message based on bluetooth states
		const modalMessage = (
			(bleIsLoading) ?
				'We\'re searching for your device, hang tight.' :
				(bleConfirmed) ?
					'Please add the name of your new device.' :
					'We found a device and triggered its indicator led to flash. ' +
					'Please confirm that this is the correct device.'
		);

		return (
			<View style = { modalStyles.confirmBleContainer }>
				<View style = { modalStyles.confirmBleTextView }>
					<Text style = { modalStyles.confirmBleText }>
						{ modalMessage }
					</Text>
				</View>
				{ (bleIsLoading) ?
					(<View />
					) :
					(bleConfirmed) ?
						(<TextBoxEntry
							style = { modalStyles.textInput }
							header = 'New Device Name'
							placeholder = 'New outlet name'
							onChangeText = { props.handleChange('name') }
							value = { props.values.name }
							errorMessage = { props.touched.name && props.errors.name }
						/>
						) :
						(<View style = { modalStyles.confirmBleButtonView }>
							<Button
								title = 'Retry'
								containerStyle = { [buttonContainer, modalStyles.confirmButtonStyle] }
								buttonStyle = { fullWidthHeight }
								onPress = { () => {
									// This may need to have a different behavior, maybe retry?
									setBleIsLoading(true);
									setBleConfirmed(false);

									// TODO:
									// Setting addDevice states will be called from bluetooth instead
									setTimeout(() => {
										setBleIsLoading(false);
									}, 3000);
								} }
							/>
							<Button
								title = 'Confirm'
								containerStyle = { [buttonContainer, modalStyles.confirmButtonStyle] }
								buttonStyle = { fullWidthHeight }
								onPress = { () => setBleConfirmed(true) }
							/>
						</View>
						)
				}
			</View>
		);
	};

	const renderAddDeviceModal = () => {
		return (
			<Modal
				animationType = 'slide'
				transparent = { true }
				visible = { modalVisible }
			>
				<TouchableWithoutFeedback onPress = { Keyboard.dismiss }>
					<View style = { modalContainer }>
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
										<View style = { modalStyles.inputView }>
											{ renderModalBody(props) }
										</View>
										<View style = { modalStyles.modalButtonView }>
											<Button
												title = 'Cancel'
												containerStyle = { [buttonContainer, modalStyles.modalButtonStyle] }
												buttonStyle = { fullWidthHeight }
												onPress = { () => {
													// TODO:
													// This should properly handle cleaning up bluetooth depending on current states
													setModalVisible(false);
												} }
											/>
											<Button
												title = 'Add Device'
												containerStyle = { [buttonContainer, modalStyles.modalButtonStyle] }
												buttonStyle = { fullWidthHeight }
												disabled = { !bleConfirmed }
												disabledStyle = { disabledButton }
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
					containerStyle = { [buttonContainer, mainButtonStyle] }
					buttonStyle = { [fullWidthHeight] }
					onPress = { () => {
						setBleIsLoading(true);
						setBleConfirmed(false);
						// setModalVisible(true);

						if (bluetoothReady) {
							scanForOutlet(manager, 'New SmartOutlet Device')
								.then((scannedDevice) => {
									console.log('Found device: ' + scannedDevice.name);

									connectToOutlet(scannedDevice)
										.then((connectedDevice) => {
											setBleIsLoading(false);

											connectedDevice.onDisconnected(() => {
												if (bleIsLoading)
													console.log('Device disconnected');
											});

											sendDataToCharacteristic(connectedDevice, 'Connection Established from SmartOutlet')
												.then(() => {
													getDataFromCharacteristic(connectedDevice)
														.then((value) => {
															console.log('Sent: Connection Established from SmartOutlet');
															console.log('Received: ' + value);
															console.log('Data exchanged, closing connection');
															connectedDevice.cancelConnection();
														});
												});
										});
								})
								.catch((error) => {
									console.log(error);
								});
						}
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
		width: '40%',
		alignItems: 'center',
		justifyContent: 'space-around',
		marginTop: '20%'
	},
	mainButtonStyle: {
		height: height * 0.07
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
		height: '14%',
		width: '50%',
		marginTop: '5%',
		alignItems: 'center'
	},
	inputView: {
		height: '44%',
		width: '95%',
		alignItems: 'center',
		marginTop: '-6%'
	},
	confirmBleContainer: {
		height: '90%',
		width: '95%',
		alignItems: 'center',
		padding: '2%',
		marginTop: '2%',
		backgroundColor: colors.primaryLight,
		borderRadius: 10
	},
	confirmBleTextView: {
		marginTop: '2%'
	},
	confirmBleText: {
		color: colors.dark,
		fontSize: 16
	},
	confirmBleButtonView: {
		height: '45%',
		width: '90%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginTop: '5%'
	},
	confirmButtonStyle: {
		width: width * 0.25
	},
	formStyle: {
		width: '100%'
	},
	textInput: {
		width: width * 0.65
	},
	modalButtonView: {
		height: '18%',
		width: '90%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginTop: '25%'
	},
	modalButtonStyle: {
		width: width * 0.3
	},
	deleteButtonStyle: {
		backgroundColor: colors.delete
	}
};