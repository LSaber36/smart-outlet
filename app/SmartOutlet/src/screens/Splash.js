import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { useDispatch } from 'react-redux';
import { styles, colors } from '../styles';
import { appLoading } from '../redux';

export const Splash = () => {
	const {	container } = styles;
	const { textStyle } = splashStyles;
	const [logo] = useState(new Animated.Value(0));
	const animationStyle = { translateY: logo.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) };
	const dispatch = useDispatch();

	useEffect(() => {
		let mounted = true;

		if (mounted) {
			Animated.spring(logo, {
				toValue: 1,
				duration: 2500,
				useNativeDriver: true
			}).start(() => { setTimeout(() => dispatch(appLoading()), 1500) });
		}
	});

	return (
		<View style = { container }>
			<Animated.View style = { animationStyle }>
				<Text style = { textStyle }> Splash Page </Text>
			</Animated.View>
		</View>
	);
};

const splashStyles = {
	textStyle: {
		color: colors.dark,
		fontSize: 40,
		marginTop: '65%'
	}
};