import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Dimensions, ScrollView } from 'react-native';
import { styles, colors } from '../styles';
import { Button } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import { useSelector } from 'react-redux';
import { deleteOutlet, setOutletState, setPowerThresh } from '../services/outletServices';
import { InfoBox } from '../components';
import { ProgressChart, LineChart } from 'react-native-chart-kit';

const { height, width } = Dimensions.get('screen');

export const Device = ({ navigation }) => {
	const [currentOutletData, setCurrentOutletData] = useState({});
	const [modalVisible, setModalVisible] = useState(false);
	const [historicalData, setHistoricalData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	const [percentPowerUsed, setPercentPowerUsed] = useState(75);
	const { activeUserData, outletRefList, selectedOutletID } = useSelector(state => state.user);

	const {	container, fullWidthHeight, buttonContainer, center } = styles;
	const {
		textStyle, scrollViewContainer, scrollViewStyle, scrollViewContent, graphStyle,
		percentUsedView, progressChartView, centerProgressText, descProgressText, infoView, infoTextView,
		buttonView, buttonStyle, deleteButton
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
					console.log('Historical Data: ' + JSON.stringify(documentSnapshot.get('historicalData')));
					console.log('Power Threshold: ' + JSON.stringify(documentSnapshot.get('powerThreshold')));
					setHistoricalData(documentSnapshot.get('historicalData'));
					// TODO:
					// Set percent power used dynamically based on the max of the sum of historical data
					// and the threshold. Must update when historical data updates
				}
			});

		return () => {
			database().ref('/' + selectedOutletID).off('value', outletReference);
			outletHistoricalDataUnsubscribe();
		};
	}, []);

	const renderConfirmDeleteModal = () => {
		return (
			<Modal
				animationType = 'slide'
				transparent = { true }
				visible = { modalVisible }
			>
				<View style = { modalStyles.modalContainer }>
					<View style = { modalStyles.modalView }>
						<Text style = { modalStyles.promptText }>
							Are you sure you want to delete this device?
						</Text>
						<View style = { modalStyles.buttonView }>
							<Button
								title = 'Cancel'
								containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
								buttonStyle = { fullWidthHeight }
								onPress = { () => setModalVisible(false) }
							/>
							<Button
								title = 'Delete'
								containerStyle = { [buttonContainer, modalStyles.buttonStyle] }
								buttonStyle = { [fullWidthHeight, modalStyles.deleteButtonStyle] }
								onPress = { () => {
									deleteOutlet(activeUserData, outletRefList, selectedOutletID);
									navigation.goBack();
								} }
							/>
						</View>
					</View>
				</View>
			</Modal>
		);
	};

	return (
		<View style = { container }>
			{ renderConfirmDeleteModal() }
			<Text style = { textStyle }> Device Page </Text>
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
							header = 'Power'
							value = { (currentOutletData.data != undefined) ? currentOutletData.data : 'Undefined' }
						/>
						<InfoBox
							header = 'ID'
							value = { selectedOutletID }
						/>
					</View>
				</ScrollView>
			</View>
			<View style = { [buttonView, center] }>
				<Button
					title = 'Toggle State'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { fullWidthHeight }
					onPress = { () => {
						setOutletState(selectedOutletID, !currentOutletData.state);
					} }
				/>
				<Button
					title = 'Delete'
					containerStyle = { [buttonContainer, buttonStyle] }
					buttonStyle = { [fullWidthHeight, deleteButton] }
					onPress = { () => {
						setModalVisible(true);
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
		height: '55%',
		width: '90%',
		marginTop: '5%',
		borderRadius: 10,
		backgroundColor: colors.secondaryLight
	},
	scrollViewStyle: {
		width: '90%',
		marginTop: '4%'
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
		marginTop: '5%',
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
		marginBottom: '30%',
		marginTop: '10%'
	},
	infoTextView: {
		width: '40%',
		alignItems: 'center'
	},
	descProgressText: {
		color: colors.dark,
		fontSize: 15
	},
	buttonView: {
		height: '10%',
		width: '80%',
		marginTop: '15%'
	},
	buttonStyle: {
		width: '50%',
		height: '80%',
		marginTop: '5%'
	},
	deleteButton: {
		backgroundColor: colors.delete
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
		height: '35%',
		width: '90%',
		marginTop: '-30%',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		backgroundColor: colors.white,
		borderRadius: 10
	},
	promptText: {
		color: colors.dark,
		fontSize: 22,
		paddingTop: '5%',
		margin: '10%'
	},
	buttonView: {
		height: '30%',
		width: '90%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginBottom: '5%'
	},
	buttonStyle: {
		width: '40%',
		height: '65%'
	},
	deleteButtonStyle: {
		backgroundColor: colors.delete
	}
};