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

		console.log('User: ' + (user != null ? JSON.stringify(user.email) : 'None logged in'));

		if (user != null)
			console.log('Email verified: ' + JSON.stringify(user.emailVerified));
	};

	useEffect(() => {
		const authUnsubscribe = auth().onAuthStateChanged(onAuthStateChanged);

		return () => authUnsubscribe();
	}, []);

	useEffect(() => {
		// activeUser must be checked because it can be null when no user is logged in
		// It's important to dispatch an undefined user so an old user's data is not maintained
		const outletRefListUnsubscribe = firestore()
			.collection('Users')
			.doc((activeUser != undefined) ? activeUser.email : null)
			.onSnapshot(documentSnapshot => {
				if (documentSnapshot != undefined)
					dispatch(setOutletRefList(documentSnapshot.get('outletRefs')));

				console.log('Dispatched Ref List');
			});

		return () => outletRefListUnsubscribe();
	}, [activeUser]);

	return (
		<Router isLoggedIn = { isLoggedIn } isLoading = { isLoading } />
	);
};

export default App;