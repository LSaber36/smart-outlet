import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Router from './router';
import { loadUser, loginStatus } from './redux';
import auth from '@react-native-firebase/auth';

const App = () => {
	const dispatch = useDispatch();
	const { isLoggedIn, isLoading } = useSelector(state => state.user);

	const onAuthStateChanged = (user) => {
		dispatch(loadUser(user));
		setTimeout(() => {
			dispatch(loginStatus(user != null));
		}, 250);
		console.log('User: ' + (user != null ? JSON.stringify(user.email) : 'None logged-in'));
	};

	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

		return subscriber;
	}, []);

	return (
		<Router isLoggedIn = { isLoggedIn } isLoading = { isLoading } />
	);
};

export default App;