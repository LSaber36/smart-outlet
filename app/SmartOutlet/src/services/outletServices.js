import firestore from '@react-native-firebase/firestore';

export const addOutlet = (activeUser, outletIDList, newOutletName) => {
	const newOutletId = outletIDList.length + 1;

	console.log('Current List: ' + outletIDList);
	console.log('New List: ' + [outletIDList, newOutletId]);

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
			outletIds: [...outletIDList, newOutletId]
		})
		.then(() => {
			console.log('Added new outlet to account (ID: ' + newOutletId + ')');
		});
};

export const deleteOutlet = (activeUser, outletIDList, selectedOutletID) => {
	console.log('Deleting outlet with ID: ' + selectedOutletID);
	console.log('Filtered List: ' + outletIDList.filter(element => element != selectedOutletID));

	// Remove the outlet from the user's outlet list
	firestore()
		.collection('Users')
		.doc(activeUser.email)
		.set({
			outletIds: outletIDList.filter(element => element != selectedOutletID)
		})
		.then(() => {
			console.log('Removed outlet from account (ID: ' + selectedOutletID + ')');
		});

	// Delete the outlet from the outlet collection
	firestore()
		.collection('Outlets')
		.doc(selectedOutletID.toString())
		.delete()
		.then(() => {
			console.log('Deleted outlet (ID: ' + selectedOutletID + ')');
		});
};