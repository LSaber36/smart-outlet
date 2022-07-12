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
import WifiManager from 'react-native-wifi-reborn';
import base64 from 'react-native-base64';
import uuid from 'react-native-uuid';
import { request, PERMISSIONS } from 'react-native-permissions';
import {
	getServId,
	getRxId,
	scanForOutlet,
	connectToOutlet,
	sendDataToCharacteristic,
	sendMultipleDataToCharacteristic
} from '../services/bluetoothServices';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const { height, width } = Dimensions.get('screen');

const PAGE = {
	MODAL_CLOSED: 0,
	LOADING: 1,
	DEVICE_FOUND: 2,
	SCAN_TIMEOUT: 3,
	ENTER_WIFI: 4,
	WIFI_PERMISSIONS_ERROR: 5,
	BLE_PERMISSIONS_ERROR: 6,
	ENTER_NAME: 7
};

const CODES = {
	ACCEPTED: '1',
	DENIED: '2',
	TEST_WIFI: '3',
	WIFI_CONNECTION_SUCCESSFUL: '4',
	WIFI_CONNECTION_FAILED: '5',
	NEW_UUID: '6',
	TEST_FIREBASE: '7',
	FIREBASE_CONNECTION_SUCCESSFUL: '8',
	FIREBASE_CONNECTION_FAILED: '9',

	BLUETOOTH_FINISHED: '64'
};

const nameSchema = yup.object({
	name: yup.string()
		.required('Please enter an outlet name')
});
const wifiSchema = yup.object({
	password: yup.string()
		.required('Please enter a password')
		.min(8, 'Password must be at least 8 characters')
		// Need to have a min requirement so we can verify the credentials properly
});

const BLEManager = new BleManager();

export const Dashboard = ({ navigation }) => {
	const {	container, fullWidthHeight, buttonContainer, center, disabledButton, modalContainer } = styles;
	const {
		textStyle, noOutletsMessage, mainButtonStyle, addDeviceButtonView,
		scrollViewContainer, scrollViewStyle, deviceItemContainer,
		deviceItemStyle, contentStyle, itemTextStyle
	} = dashboardStyles;

	const { activeUserData, outletRefList } = useSelector(state => state.user);
	const [modalVisible, setModalVisible] = useState(false);
	const [bluetoothReady, setBluetoothReady] = useState(false);
	const [connectedBleDevice, setConnectedBleDevice] = useState(null);
	const [networkName, setNetworkName] = useState('');
	const [newOutletId, setNewOutletId] = useState('');
	const [wifiPageError, setWifiPageError] = useState('');
	const [modalPage, setModalPage] = useState(PAGE.MODAL_CLOSED);
	const dispatch = useDispatch();

	// Keep track of adapter state
	useEffect(() => {
		const subscription = BLEManager.onStateChange((state) => {
			if (state === 'PoweredOn') {
				setBluetoothReady(true);
				subscription.remove();
			}
			else {
				setBluetoothReady(false);
			}
		}, true);

		return () => subscription.remove();
	}, []);

	useEffect(() => {
		let serviceID = getServId();
		let rxId = getRxId();

		// Only call this AFTER the modalPage changes to the loading page
		if (modalPage === PAGE.LOADING) {
			scanForOutlet(BLEManager, 'New SmartOutlet Device')
				.then((scannedDevice) => {
					console.log('Found device: ' + scannedDevice.name);

					connectToOutlet(scannedDevice)
						.then((connectedDevice) => {
							setModalPage(PAGE.DEVICE_FOUND);
							setConnectedBleDevice(connectedDevice);

							connectedDevice.onDisconnected(() => {
								setConnectedBleDevice(null);
								if (modalPage === PAGE.LOADING)
									console.log('Device disconnected');
							});

							connectedDevice
								.monitorCharacteristicForService(
									serviceID, rxId,
									(error, characteristic) => {
										if (error)
											console.log('Subscribe error: ' + error);

										if (characteristic?.value != null) {
											let receivedValue = base64.decode(characteristic.value);

											console.log('');
											console.log('Received data: ' + receivedValue);

											if (receivedValue === CODES.WIFI_CONNECTION_SUCCESSFUL) {
												console.log('Wifi connection successful');
												let newId = uuid.v4();

												setNewOutletId(newId);
												console.log('New outlet ID: ' + newId);
												// Send new UUID over bluetooth with connection request

												sendMultipleDataToCharacteristic(
													connectedDevice,
													[
														CODES.NEW_UUID,
														newId,
														CODES.TEST_FIREBASE
													]
												)
													.then(() => {
														console.log('New UUID write successful');
													})
													.catch((error) => {
														console.log(error);
													});
											}
											else if (receivedValue === CODES.WIFI_CONNECTION_FAILED) {
												console.log('Wifi connection failed');
												setWifiPageError('Outlet wifi connection failed, please re-enter your wifi password');
											}
											else if (receivedValue === CODES.FIREBASE_CONNECTION_SUCCESSFUL) {
												console.log('Firebase connection successful');

												// Tell ESP32 to cancel bluetooth connection
												sendDataToCharacteristic(
													connectedDevice,
													CODES.BLUETOOTH_FINISHED
												)
													.then(() => {
														console.log('Sent close connection message');
														connectedDevice.cancelConnection();
													})
													.catch((error) => {
														console.log(error);
													});

												setModalPage(PAGE.ENTER_NAME);
											}
											else if (receivedValue === CODES.FIREBASE_CONNECTION_FAILED) {
												console.log('Firebase connection failed');
												setWifiPageError('Outlet firebase connection failed, please re-enter your wifi password');
											}

											// Prevent any commands from being run twice
											receivedValue = '';
										}
									}
								);
						})
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					console.log(error);
					if (error === 'Scan timed out') {
						setModalPage(PAGE.SCAN_TIMEOUT);
					}
					else if (error === 'Permissions denied') {
						setModalVisible(false);
						setModalPage(PAGE.MODAL_CLOSED);
					}
					else if (error === 'Permissions blocked') {
						setModalPage(PAGE.BLE_PERMISSIONS_ERROR);
					}
				});
		}
		else if (modalPage === PAGE.ENTER_WIFI) {
			setWifiPageError('');
			console.log('Getting Wi-Fi network...');

			request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
				.then((status) => {
					console.log('Fine Loaction Status: ' + status);

					if (status === 'granted') {
						WifiManager.getCurrentWifiSSID()
							.then((networkName) => {
								console.log('Network name: ' + networkName);
								setNetworkName(networkName);
							})
							.catch((error) => {
								console.log('Get wifi error: ' + error);
							});
					}
					else if (status === 'denied') {
						setModalVisible(false);
						setModalPage(PAGE.MODAL_CLOSED);
					}
					else if (status === 'blocked') {
						setModalPage(PAGE.WIFI_PERMISSIONS_ERROR);
					}
				})
				.catch((error) => {
					console.log('Wifi Permissions Error: ' + error);
				});
		}
	}, [modalPage]);

	const validateWifiCreds = (password) => new Promise((resolve, reject) => {
		// This can is only ever called after the credentials have been verified
		// when the page initially loads, so we don't need to check them here
		console.log('Validating Wi-Fi creds...');
		WifiManager.connectToProtectedSSID(networkName, password, false)
			.then((result) => {
				console.log('Connect to wifi result: ' + result);
				setWifiPageError('');
				console.log('Disconnecting from temp network...');
				WifiManager.disconnect();
				resolve();
			})
			.catch((error) => {
				console.log('Connect to wifi error: ' + error.code);
				if (error.code === 'userDenied') {
					console.log('Connection canceled, please check your password');
					setWifiPageError('Connection canceled, please check your password');
				}
				reject('Wifi validation error: ' + error);
			});
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

	const renderIndicator = (page) => {
		if (page === PAGE.LOADING) {
			return (<PacmanIndicator
				color = { colors.primaryDark }
				hidesWhenStopped = { true }
				animating = { true }
				size = { 100 }
			/>);
		}
		else if (page === PAGE.DEVICE_FOUND) {
			return (<Icon
				name = 'check-circle'
				color = { colors.primaryDark }
				size = { 70 }
			/>);
		}
		else if (page === PAGE.SCAN_TIMEOUT ||
							page === PAGE.WIFI_PERMISSIONS_ERROR ||
							page === PAGE.BLE_PERMISSIONS_ERROR) {
			return (<Icon
				name = 'times-circle'
				color = { colors.primaryDark }
				size = { 70 }
			/>);
		}
		else if (page === PAGE.ENTER_NAME) {
			return (<Icon
				name = 'edit'
				color = { colors.primaryDark }
				size = { 70 }
			/>);
		}
		else if (page === PAGE.ENTER_WIFI || page === PAGE.WIFI_PERMISSIONS_ERROR) {
			return (<Icon
				name = 'wifi'
				color = { colors.primaryDark }
				size = { 70 }
			/>);
		}
		else {
			return (<View />);
		}
	};

	const renderInput = (props, page) => {
		if (page === PAGE.LOADING) {
			return (
				<View />
			);
		}
		else if (page === PAGE.SCAN_TIMEOUT) {
			return (
				<View style = { modalStyles.confirmBleButtonView }>
					<Button
						title = 'Retry'
						containerStyle = { [buttonContainer, modalStyles.confirmButtonStyle] }
						buttonStyle = { fullWidthHeight }
						onPress = { () => {
							setModalPage(PAGE.LOADING);
						} }
					/>
				</View>
			);
		}
		else if (page === PAGE.DEVICE_FOUND) {
			return (
				<View style = { modalStyles.confirmBleButtonView }>
					<Button
						title = 'Retry'
						containerStyle = { [buttonContainer, modalStyles.confirmButtonStyle] }
						buttonStyle = { fullWidthHeight }
						onPress = { () => {
							setModalPage(PAGE.LOADING);
						} }
					/>
					<Button
						title = 'Confirm'
						containerStyle = { [buttonContainer, modalStyles.confirmButtonStyle] }
						buttonStyle = { fullWidthHeight }
						onPress = { () => {
							setModalPage(PAGE.ENTER_WIFI);
						} }
					/>
				</View>
			);
		}
		else if (page === PAGE.ENTER_WIFI) {
			return (
				<TextBoxEntry
					style = { modalStyles.textInput }
					header = 'Wifi Password'
					placeholder = 'myWifiPassword'
					onChangeText = { props.handleChange('password') }
					value = { props.values.password }
					errorMessage = { (wifiPageError === '' || props.errors.password) ? (props.touched.password && props.errors.password) : wifiPageError }
				/>
			);
		}
		else if (page === PAGE.ENTER_NAME) {
			return (
				<TextBoxEntry
					style = { modalStyles.textInput }
					header = 'New Device Name'
					placeholder = 'new outlet name'
					onChangeText = { props.handleChange('name') }
					value = { props.values.name }
					errorMessage = { props.touched.name && props.errors.name }
				/>
			);
		}
	};

	const renderModalBody = (props) => {
		// Set the header message based on bluetooth states
		let modalMessage = '';

		if (modalPage === PAGE.LOADING) {
			modalMessage =
			'We\'re searching for your device, hang tight.\n\n' +
			'Make sure you\'ve put your device in pairing mode by pressing the faceplate button until the blue LED blinks.';
		}
		else if (modalPage === PAGE.SCAN_TIMEOUT) {
			modalMessage =
			'The device was not found.\n\nPlease retry the scan and make sure the device is in pairing mode.';
		}
		else if (modalPage === PAGE.DEVICE_FOUND) {
			modalMessage =
			'We found a device and triggered its indicator led to flash. ' +
			'Please confirm that this is the correct device.';
		}
		else if (modalPage === PAGE.ENTER_NAME) {
			modalMessage =
			'Your Wi-Fi credentials have been verified. Please add the name of your new device.';
		}
		else if (modalPage === PAGE.ENTER_WIFI) {
			modalMessage =
			'Please enter the wifi password to your current network:';
		}
		else if (modalPage === PAGE.WIFI_PERMISSIONS_ERROR) {
			modalMessage =
			'Please grant wifi permissions to this application.';
		}
		else if (modalPage === PAGE.BLE_PERMISSIONS_ERROR) {
			modalMessage =
			'Please grant both bluetooth and location permissions to this application.';
		}

		return (
			<View style = { modalStyles.inputContainer }>
				<View style = { modalStyles.inputHeaderView }>
					<Text style = { modalStyles.inputHeader }>
						{ modalMessage }
					</Text>
					{
						(modalPage === PAGE.ENTER_WIFI) ?
							(<Text style = { [modalStyles.inputHeader, modalStyles.inputHeaderWifiNetwork] }>
								{ networkName }
							</Text>
							) :
							(<View />)
					}
				</View>
				{ renderInput(props, modalPage) }
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
								{ renderIndicator(modalPage) }
							</View>
							<Formik
								initialValues = {{ name: '', password: '' }}
								validationSchema = { (modalPage === PAGE.ENTER_WIFI) ? wifiSchema : nameSchema }
								onSubmit = { (values, actions) => {
									if (modalPage === PAGE.ENTER_WIFI) {
										console.log('Entered password: ' + values.password);
										validateWifiCreds(values.password)
											.then(() => {
												// Network password was validated
												if (connectedBleDevice !== null && networkName != '' && values.password != '') {
													sendMultipleDataToCharacteristic(
														connectedBleDevice,
														[
															CODES.ACCEPTED,
															networkName,
															values.password,
															CODES.TEST_WIFI
														]
													)
														.then(() => {
															console.log('New wifi creds write successful');
														})
														.catch((error) => {
															console.log(error);
														});
												}
											})
											.catch((error) => {
												console.log(error);
											});
									}
									else if (modalPage === PAGE.ENTER_NAME) {
										actions.resetForm();
										addOutlet(activeUserData, outletRefList, values.name, newOutletId);
										setModalVisible(false);
										setModalPage(PAGE.MODAL_CLOSED);
									}
								} }
							>
								{ (props) => (
									<View style = { [center, modalStyles.formStyle] }>
										<View style = { modalStyles.mainInputView }>
											{ renderModalBody(props) }
										</View>
										<View style = { modalStyles.modalButtonView }>
											<Button
												title = 'Cancel'
												containerStyle = { [buttonContainer, modalStyles.modalButtonStyle] }
												buttonStyle = { fullWidthHeight }
												onPress = { () => {
													if (connectedBleDevice !== null) {
														// Tell ESP32 to cancel bluetooth connection
														sendDataToCharacteristic(
															connectedBleDevice,
															CODES.BLUETOOTH_FINISHED
														)
															.then(() => {
																console.log('Sent close connection message');
																connectedBleDevice.cancelConnection();
																setConnectedBleDevice(null);
															})
															.catch((error) => {
																console.log(error);
															});
													}

													setModalVisible(false);
													setModalPage(PAGE.MODAL_CLOSED);
												} }
											/>
											<Button
												title = { (modalPage === PAGE.ENTER_NAME) ? 'Add Device' : 'Check Wifi' }
												containerStyle = { [buttonContainer, modalStyles.modalButtonStyle] }
												buttonStyle = { fullWidthHeight }
												disabled = { !(modalPage === PAGE.ENTER_WIFI ||
																				modalPage === PAGE.ENTER_NAME) }
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
						if (bluetoothReady) {
							setModalPage(PAGE.LOADING);
							setModalVisible(true);
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
		marginTop: '7%'
	},
	indicatorView: {
		height: '14%',
		width: '50%',
		marginTop: '1%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	mainInputView: {
		height: '44%',
		width: '95%',
		alignItems: 'center',
		marginTop: '-6%'
	},
	inputContainer: {
		height: '100%',
		width: '95%',
		alignItems: 'center',
		padding: '2%',
		marginTop: '-8%',
		backgroundColor: colors.primaryLight,
		borderRadius: 10
	},
	inputHeaderView: {
		marginTop: '1%',
		width: '94%'
	},
	inputHeader: {
		color: colors.dark,
		fontSize: 16
	},
	inputHeaderWifiNetwork: {
		marginTop: '1%',
		color: colors.primaryDark
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
		width: width * 0.65,
		marginTop: '2%'
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