import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Router from './router';
import { loadUser, loginStatus, setOutletRefList } from './redux';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const App = () => {
	const dispatch = useDispatch();
	const { isLoggedIn, isLoading, activeUser } = useSelector(state => state.user);

	const onAuthStateChanged = (user) => {
		dispatch(loadUser(user));
		setTimeout(() => {
			dispatch(loginStatus(user != null && user.emailVerified));
		}, 250);

		if (user != null)
			console.log('Email verified: ' + JSON.stringify(user.emailVerified));

		console.log('User: ' + (user != null ? JSON.stringify(user.email) : 'None logged-in'));
	};

	useEffect(() => {
		const authUnsubscribe = auth().onAuthStateChanged(onAuthStateChanged);

		return () => authUnsubscribe();
	}, []);

	useEffect(() => {
		const outletRefListUnsubscribe = firestore()
			.collection('Users')
			.doc(activeUser.email)
			.onSnapshot(documentSnapshot => {
				if (documentSnapshot != undefined)
					dispatch(setOutletRefList(documentSnapshot.get('outletRefs')));

				console.log('Dispatched ID List: ' + documentSnapshot.get('outletRefs'));
			});

		return () => outletRefListUnsubscribe();
	}, [activeUser]);

	return (
		<Router isLoggedIn = { isLoggedIn } isLoading = { isLoading } />
	);
};

export default App;