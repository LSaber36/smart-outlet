import React, { useEffect, useState } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { styles } from '../styles';
import { appLoading } from '../redux';
import { IconWithText } from '../assets/images';

const { width } = Dimensions.get('screen');

export const Splash = () => {
	const {	container, center } = styles;
	const { logoStyle } = splashStyles;
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
			}).start(() => { setTimeout(() => dispatch(appLoading(false)), 1500) });
		}
	});

	return (
		<View style = { [center, container] }>
			<Animated.View style = { animationStyle }>
				<IconWithText style = { logoStyle } />
			</Animated.View>
		</View>
	);
};

const splashStyles = {
	logoStyle: {
		height: width * 0.75,
		width: width * 0.75
	}
};