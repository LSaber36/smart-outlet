import firestore from '@react-native-firebase/firestore';

export const addOutlet = (activeUser, outletRefList, newOutletName) => {
	const newOutletId = outletRefList.length + 1;

	console.log('Current List: ' + outletRefList);
	console.log('New List: ' + [outletRefList, newOutletId]);

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
			outletRefs: [...outletRefList, { id: newOutletId, name: newOutletName }]
		})
		.then(() => {
			console.log('Added new outlet to account (ID: ' + newOutletId + ')');
		});
};

export const deleteOutlet = (activeUser, outletRefList, outletID) => {
	console.log('Deleting outlet with ID: ' + outletID);
	console.log('Filtered List: ' + outletRefList.filter(outletRef => outletRef != outletID));

	// Remove the outlet from the user's outlet list
	firestore()
		.collection('Users')
		.doc(activeUser.email)
		.set({
			outletRefs: outletRefList.filter(outletRef => outletRef.id != outletID)
		})
		.then(() => {
			console.log('Removed outlet from account (ID: ' + outletID + ')');
		});

	// Delete the outlet from the outlet collection
	firestore()
		.collection('Outlets')
		.doc(outletID.toString())
		.delete()
		.then(() => {
			console.log('Deleted outlet (ID: ' + outletID + ')');
		});
};