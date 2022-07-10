import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Router from './router';
import { loadUserData, loginStatus, setOutletRefList } from './redux';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const App = () => {
	const dispatch = useDispatch();
	const { isLoggedIn, isLoading, activeUserData } = useSelector(state => state.user);
	let printUserAuthData = true;

	const onAuthStateChanged = (userData) => {
		dispatch(loadUserData(userData));
		setTimeout(() => {
			dispatch(loginStatus(userData != null && userData.emailVerified));
		}, 250);

		if (printUserAuthData) {
			printUserAuthData = false;
			console.log('User: ' + (userData != null ? JSON.stringify(userData.email) : 'None logged in'));

			if (userData != null)
				console.log('Email verified: ' + JSON.stringify(userData.emailVerified));
		}
	};

	useEffect(() => {
		const authUnsubscribe = auth().onAuthStateChanged(onAuthStateChanged);

		return () => authUnsubscribe();
	}, []);

	useEffect(() => {
		// activeUserData must be checked because it can be null when no user is logged in
		// It's important to dispatch an undefined user so an old user's data is not maintained
		const outletRefListUnsubscribe = firestore()
			.collection('Users')
			.doc((activeUserData != undefined) ? activeUserData.email : null)
			.onSnapshot(documentSnapshot => {
				if (documentSnapshot != undefined) {
					let tempOutletRefs = documentSnapshot.get('outletRefs');

					if (tempOutletRefs != undefined) {
						dispatch(setOutletRefList(tempOutletRefs));
						console.log();
						console.log('Device Names:');
						console.log('====================');

						if (tempOutletRefs.length > 0) {
							tempOutletRefs
								.map((device) => {
									console.log(device.name);
								});
						}
						else { console.log('No outlets added') }

						console.log();
					}
				}

				console.log('Dispatched Ref List');
			});

		return () => outletRefListUnsubscribe();
	}, [activeUserData]);

	return (
		<Router isLoggedIn = { isLoggedIn } isLoading = { isLoading } />
	);
};

export default App;