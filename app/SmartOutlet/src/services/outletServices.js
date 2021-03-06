import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

export const addOutlet = (activeUserData, outletRefList, newOutletName, newOutletId) => {
	// Add a new outlet to the outlet RTDB
	database()
		.ref('/' + newOutletId.toString())
		.set({
			name: newOutletName,
			state: false,
			powerThreshold: 0
		})
		.then(() => {
			console.log('Added outlet to RTDB           (ID: ' + newOutletId + ')');
		})
		.catch((error) => {
			console.log(error);
		});

	// Add the outlet to the outlet document
	firestore()
		.collection('Outlets')
		.doc(newOutletId.toString())
		.set({
			name: newOutletName,
			historicalData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		})
		.then(() => {
			console.log('Added new outlet to firestore  (ID: ' + newOutletId + ')');
		})
		.catch((error) => {
			console.log(error);
		});

	// Add the outlet to the user's outlet list
	firestore()
		.collection('Users')
		.doc(activeUserData.email)
		.set({
			outletRefs: [...outletRefList, { id: newOutletId, name: newOutletName }]
		})
		.then(() => {
			console.log('Added new outlet to account    (ID: ' + newOutletId + ')');
		})
		.catch((error) => {
			console.log(error);
		});
};

export const deleteOutlet = (activeUserData, outletRefList, outletID) => {
	// Remove the outlet from the user's outlet list
	firestore()
		.collection('Users')
		.doc(activeUserData.email)
		.set({
			outletRefs: outletRefList.filter(outletRef => outletRef.id != outletID)
		})
		.then(() => {
			console.log('Removed outlet from account    (ID: ' + outletID + ')');
		})
		.catch((error) => {
			console.log(error);
		});

	// Delete the outlet from the outlet collection
	firestore()
		.collection('Outlets')
		.doc(outletID.toString())
		.delete()
		.then(() => {
			console.log('Deleted outlet from firestore  (ID: ' + outletID + ')');
		})
		.catch((error) => {
			console.log(error);
		});

	// Delete the outlet from the outlet RTDB
	database()
		.ref('/' + outletID.toString())
		.remove()
		.then(() => {
			console.log('Deleted outlet from database   (ID: ' + outletID + ')');
		})
		.catch((error) => {
			console.log(error);
		});
};

export const setOutletState = (outletID, targetState) => {
	database()
		.ref('/' + outletID.toString() + '/state')
		.set(targetState)
		.then(() => {
			console.log('Set outlet state (State: ' + targetState + '   ID: ' + outletID + ')');
		})
		.catch((error) => {
			console.log(error);
		});
};

export const setPowerThresh = (outletID, newThresh) => {
	database()
		.ref('/' + outletID.toString() + '/powerThreshold')
		.set(newThresh)
		.then(() => {
			console.log('Set power threshold to ' + newThresh + ' KWH');
		})
		.catch((error) => {
			console.log(error);
		});
};