import firestore from '@react-native-firebase/firestore';

export const initNewUser = (user) => {
	firestore()
		.collection('Users')
		.doc(user.email)
		.set({
			outletIds: []
		})
		.then(() => {
			console.log('Added new user to Users collection: ' + user.email);
		});
};