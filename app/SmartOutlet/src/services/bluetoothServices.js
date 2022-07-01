import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import base64 from 'react-native-base64';

const SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const CHARACTERISTIC_UUID_TX = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const CHARACTERISTIC_UUID_RX = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

export const scanForOutlet = (manager, outletName) => new Promise((resolve, reject) => {
	console.log(' ');
	console.log('Getting Permissions...');

	requestMultiple([
		PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
		PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
		PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
	])
		.then((statuses) => {
			console.log('Scan Status:           ' + statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN]);
			console.log('Connect Status:        ' + statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]);
			console.log('Fine Loaction Status:  ' + statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
			console.log(' ');

			console.log('Searching for device...');
			manager.startDeviceScan(null, null, (error, scannedDevice) => {
				if (error)
					reject('Scan for outlet error: ' + JSON.stringify(error));

				if (scannedDevice && scannedDevice.name === outletName) {
					// Prevent future scanning
					manager.stopDeviceScan();
					resolve(scannedDevice);
				}
			});

			// Stop scanning after 5 seconds
			// Doesn't get executed if device is found and promise is resolved
			setTimeout(() => {
				manager.stopDeviceScan();
				reject('Scan for outlet error: Scan timed out');
			}, 5000);
		})
		.catch((error) => {
			reject('Scan for outlet error: ' + error);
		});
});

export const connectToOutlet = (device) => new Promise((resolve, reject) => {
	device
		.connect()
		.then((connectedDevice) => {
			console.log('Connected to device');

			connectedDevice
				.discoverAllServicesAndCharacteristics()
				.then((discoveredDevice) => {
					resolve(discoveredDevice);
				})
				.catch((error) => {
					reject('Discovery error: ' + JSON.stringify(error));
				});
		})
		.catch((error) => {
			reject('Connection to outlet error: ' + error);
		});
});

export const sendDataToCharacteristic = (device, value) => new Promise((resolve, reject) => {
	device
		.writeCharacteristicWithResponseForService(
			SERVICE_UUID,
			CHARACTERISTIC_UUID_TX,
			base64.encode(value)
		)
		.then(() => {
			resolve(value);
		})
		.catch((error) => {
			reject('Write Characteristic Error: ' + error);
		});
});

export const getDataFromCharacteristic = (device) => new Promise((resolve, reject) => {
	device
		.readCharacteristicForService(
			SERVICE_UUID,
			CHARACTERISTIC_UUID_RX
		)
		.then((characteristic) => {
			if (characteristic?.value != null)
				resolve(base64.decode(characteristic?.value));
		})
		.catch((error) => {
			reject('Get characteristic error:' + error);
		});
});

export const subscribeToCharacteristic = (device, servUUID, charUUID) => new Promise((resolve, reject) => {
	device
		.monitorCharacteristicForService(
			servUUID,
			charUUID,
			(error, characteristic) => {
				if (error)
					reject('Subscribe error:' + error);

				if (characteristic?.value != null)
					resolve(base64.decode(characteristic.value));
			}
		);
});