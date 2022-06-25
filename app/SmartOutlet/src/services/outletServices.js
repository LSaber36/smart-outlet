import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import uuid from 'react-native-uuid';

export const addOutlet = (activeUserData, outletRefList, newOutletName) => {
	const newOutletId = uuid.v4();

	// Add a new outlet to the outlet RTDB
	database()
		.ref('/' + newOutletId.toString())
		.set({
			name: newOutletName,
			state: false,
			data: 0
		})
		.then(() => {
			console.log('Added outlet to RTDB           (ID: ' + newOutletId + ')');
		});

	// Add the outlet to the outlet document
	firestore()
		.collection('Outlets')
		.doc(newOutletId.toString())
		.set({
			name: newOutletName,
			historicalData: []
		})
		.then(() => {
			console.log('Added new outlet to firestore  (ID: ' + newOutletId + ')');
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
		});

	// Delete the outlet from the outlet collection
	firestore()
		.collection('Outlets')
		.doc(outletID.toString())
		.delete()
		.then(() => {
			console.log('Deleted outlet from firestore  (ID: ' + outletID + ')');
		});

	// Delete the outlet from the outlet RTDB
	database()
		.ref('/' + outletID.toString())
		.remove()
		.then(() => {
			console.log('Deleted outlet from database   (ID: ' + outletID + ')');
		});
};

export const setOutletState = (outletID, targetState) => {
	database()
		.ref('/' + outletID.toString())
		.update({
			state: targetState
		})
		.then(() => {
			console.log('Set outlet state (State: ' + targetState + '  ID: ' + outletID + ')');
		});
};