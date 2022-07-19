import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Keyboard, Modal, Dimensions, ScrollView } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import { useSelector } from 'react-redux';
import { deleteOutlet, setOutletState, setPowerThresh } from '../services/outletServices';
import { InfoBox, TextBoxEntry } from '../components';
import { Formik } from 'formik';
import * as yup from 'yup';
import { ProgressChart, LineChart } from 'react-native-chart-kit';

const { height, width } = Dimensions.get('screen');

const newThreshSchema = yup.object({
	thresh: yup.number()
		.required('Please enter a threshold value')
		.typeError('The value must be a number')
		.positive('The value must be greater than 0')
		.integer('The value must be an integer')
});

export const Device = ({ navigation }) => {
	const [currentOutletData, setCurrentOutletData] = useState({});
	const [modalVisible, setModalVisible] = useState(false);
	const [historicalData, setHistoricalData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	const [powerThreshold, setPowerThreshold] = useState(0);
	const [percentPowerUsed, setPercentPowerUsed] = useState(75);
	const [deleteOrThreshhold, setDeleteOrThreshhold] = useState(true);
	const { activeUserData, outletRefList, selectedOutletID } = useSelector(state => state.user);

	const {	container, fullWidthHeight, buttonContainer, center, modalContainer } = styles;
	const {
		textStyle, scrollViewContainer, scrollViewStyle, scrollViewContent, graphStyle,
		percentUsedView, progressChartView, centerProgressText, descProgressText, infoView, infoTextView,
		scrollViewButtonView, mainButtonView, scrollViewButtonStyle, mainButtonStyle, deleteButton
	} = deviceStyles;

	useEffect(() => {
		const outletReference = database()
			.ref('/' + selectedOutletID)
			.on('value', snapshot => {
				setCurrentOutletData(snapshot.val());
			});

		const outletHistoricalDataUnsubscribe = firestore()
			.collection('Outlets')
			.doc(selectedOutletID)
			.onSnapshot(documentSnapshot => {
				if (documentSnapshot != undefined) {
					let tempHistoricalData = documentSnapshot.get('historicalData');
					let tempPowerThreshold = documentSnapshot.get('powerThreshold');
					let tempPercentPowerUsed;

					console.log('Historical Data: ' + JSON.stringify(tempHistoricalData));
					console.log('Power Threshold: ' + tempPowerThreshold);

					setPowerThreshold(tempPowerThreshold);
					setHistoricalData(tempHistoricalData);
					// Calculate the data, filter out values above 100, and round up to nearest integer
					tempPercentPowerUsed = (tempPowerThreshold / Math.max(...tempHistoricalData)) * 100;
					tempPercentPowerUsed = Math.round(tempPercentPowerUsed);
					tempPercentPowerUsed = (tempPercentPowerUsed < 100) ? tempPercentPowerUsed : 100;

					console.log('Percent power used: ' + tempPercentPowerUsed);
					setPercentPowerUsed(tempPercentPowerUsed);
				}
			});

		return () => {
			database().ref('/' + selectedOutletID).off('value', outletReference);
			outletHistoricalDataUnsubscribe();
		};
	}, []);

	const renderModalBody = () => {
		return (
			<Modal
				animationType = 'slide'
				transparent = { true }
				visible = { modalVisible }
			>
				<TouchableWithoutFeedback onPress = { Keyboard.dismiss }>
					<View style = { modalContainer }>
						<Formik
							initialValues = {{ thresh: '' }}
							validationSchema = { newThreshSchema }
							onSubmit = { (values, actions) => {
								actions.resetForm();
								console.log('New Thresh: ' + values.thresh);
								setPowerThresh(selectedOutletID, parseInt(values.thresh));
								setModalVisible(false);
							} }
						>
							{ (props) => (
								<View style = { modalStyles.modalView }>
									<View style = { modalStyles.promptTextView }>
										<Text style = { modalStyles.promptText }>
											{ // Choose the text to display based on the modal type
												(deleteOrThreshhold) ?
													'Are you sure you want to delete this device?' :
													'Please enter a new power threshold.'
											}
										</Text>
									</View>
									{ // Decide if we want to display the text entry based on the modal type
										(deleteOrThreshhold) ?
											<View /> :
											<TextBoxEntry
												header = 'New Threshold'
												placeholder = 'ex. 24'
												onChangeText = { props.handleChange('thresh') }
												value = { props.values.thresh.toString() }
												style = { modalStyles.textBoxStyle }
												keyboardType = { 'number-pad' }
												errorMessage = { props.touched.thresh && props.errors.thresh }
											/>
									}
									<View style = { modalStyles.buttonView }>
										<Button
											title = 'Cancel'
											containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
											buttonStyle = { fullWidthHeight }
											onPress = { () => setModalVisible(false) }
										/>
										{ // Pick the button behavior based on the modal type
											(deleteOrThreshhold) ?
												<Button
													title = 'Delete'
													containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
													buttonStyle = { [fullWidthHeight, modalStyles.deleteButtonStyle] }
													onPress = { () => {
														deleteOutlet(activeUserData, outletRefList, selectedOutletID);
														navigation.goBack();
													} }
												/> :
												<Button
													title = 'Set Threshold'
													containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
													buttonStyle = { fullWidthHeight }
													onPress = { props.handleSubmit }
												/>
										}
									</View>
								</View>
							) }
						</Formik>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		);
	};

	return (
		<View style = { container }>
			{ renderModalBody() }
			<Text style = { textStyle }> Device Info </Text>
			<View style = { [center, scrollViewContainer] }>
				<ScrollView
					style = { scrollViewStyle }
					contentContainerStyle = { scrollViewContent }
				>
					<LineChart
						data = {{
							labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
							datasets: [
								{ data: historicalData }
							]
						}}
						width = { width * 0.8 }
						height = { 220 }
						yAxisSuffix = ' KWH'
						yAxisInterval = { 1 }
						verticalLabelRotation = { -55 }
						chartConfig = {{
							backgroundGradientFrom: colors.primaryDark,
							backgroundGradientFromOpacity: 1.0,
							backgroundGradientTo: colors.primaryDark,
							backgroundGradientToOpacity: 1.0,
							decimalPlaces: 0,
							color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
							labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
							propsForDots: {
								r: '4',
								strokeWidth: '1',
								stroke: colors.graphDotOutline
							}
						}}
						bezier
						style = { graphStyle }
					/>
					<View style = { percentUsedView }>
						<View style = { [progressChartView, center] }>
							<ProgressChart
								data = {{
									data: [percentPowerUsed / 100.0]
								}}
								width = { width * 0.36 }
								height = { 130 }
								strokeWidth = { 15 }
								radius = { 50 }
								chartConfig = {{
									backgroundGradientFromOpacity: 0.0,
									backgroundGradientToOpacity: 0.0,
									color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
									style: { graphStyle }
								}}
								hideLegend = { true }
								style = { graphStyle }
							/>
							<Text style = { centerProgressText }>
								{ percentPowerUsed }%
							</Text>
						</View>
						<View style = { infoTextView }>
							<Text style = { descProgressText }>
								On the right is the amount of power you have used in terms of the current threshhold.
							</Text>
						</View>
					</View>
					<View style = { infoView }>
						<InfoBox
							header = 'Name'
							value = { (currentOutletData.name != undefined) ? currentOutletData.name : 'Undefined' }
						/>
						<InfoBox
							header = 'State'
							value = { (currentOutletData.state != undefined) ? (currentOutletData.state ? 'On' : 'Off') : 'Undefined' }
						/>
						<InfoBox
							header = 'Power Threshold'
							value = { (currentOutletData.powerThreshold != undefined) ? currentOutletData.powerThreshold : 'Undefined' }
						/>
						<InfoBox
							header = 'ID'
							value = { selectedOutletID }
						/>
					</View>
					<View style = { [scrollViewButtonView, center] }>
						<Button
							title = 'Set Threshold'
							containerStyle = { [buttonContainer, scrollViewButtonStyle] }
							buttonStyle = { fullWidthHeight }
							onPress = { () => {
								setDeleteOrThreshhold(false);
								setModalVisible(true);
							} }
						/>
						<Button
							title = 'Delete'
							containerStyle = { [buttonContainer, scrollViewButtonStyle] }
							buttonStyle = { [fullWidthHeight, deleteButton] }
							onPress = { () => {
								setDeleteOrThreshhold(true);
								setModalVisible(true);
							} }
						/>
					</View>
				</ScrollView>
			</View>
			<View style = { [mainButtonView, center] }>
				<Button
					title = 'Toggle State'
					containerStyle = { [buttonContainer, mainButtonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => {
						setOutletState(selectedOutletID, !currentOutletData.state);
					} }
				/>
			</View>
		</View>
	);
};

const deviceStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		paddingTop: '5%'
	},
	scrollViewContainer: {
		height: '66%',
		width: '90%',
		marginTop: '5%',
		borderRadius: 10,
		backgroundColor: colors.secondaryLight
	},
	scrollViewStyle: {
		width: '90%',
		marginTop: '5%'
	},
	scrollViewContent: {
		alignItems: 'center'
	},
	graphStyle: {
		borderRadius: 10
	},
	percentUsedView: {
		width: width * 0.8,
		height: '18%',
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginTop: '6%',
		padding: '2%',
		backgroundColor: colors.primaryDark
	},
	progressChartView: {
		width: '50%',
		height: '65%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	centerProgressText: {
		position: 'absolute',
		color: colors.dark,
		fontSize: 25
	},
	infoView: {
		marginTop: '6%'
	},
	infoTextView: {
		width: '40%',
		alignItems: 'center'
	},
	descProgressText: {
		color: colors.offWhite,
		fontSize: 15
	},
	scrollViewButtonView: {
		height: '14%',
		width: '80%',
		marginBottom: '25%'
	},
	scrollViewButtonStyle: {
		marginTop: '5%'
	},
	mainButtonView: {
		height: '10%',
		width: '80%',
		marginTop: '5%'
	},
	mainButtonStyle: {
		height: height * 0.07,
		marginTop: '5%'
	},
	deleteButton: {
		backgroundColor: colors.delete
	}
};

const modalStyles = {
	modalView: {
		height: '35%',
		width: '90%',
		marginTop: '-30%',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		backgroundColor: colors.white,
		borderRadius: 10
	},
	promptTextView: {
		width: '90%',
		height: '20%',
		alignItems: 'center',
		justifyContent: 'flex-start',
		marginTop: '5%'
	},
	promptText: {
		color: colors.dark,
		fontSize: 20
	},
	textBoxStyle: {
		marginTop: '5%'
	},
	buttonView: {
		height: '30%',
		width: '90%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginBottom: '4%'
	},
	buttonStyle: {
		width: width * 0.34
	},
	deleteButtonStyle: {
		backgroundColor: colors.delete
	}
};