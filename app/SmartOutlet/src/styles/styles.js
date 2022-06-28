import { Dimensions } from 'react-native';
import { colors } from './colors';

const { height, width } = Dimensions.get('screen');

export const styles = {
	container: {
		height: '100%',
		width: '100%',
		backgroundColor: colors.primaryLight,
		alignItems: 'center'
	},
	fullWidthHeight: {
		width: '100%',
		height: '100%'
	},
	buttonContainer: {
		width: width * 0.35,
		height: height * 0.06,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 50,
		borderRadius: 6
	},
	center: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	errorText: {
		color: colors.delete,
		marginTop: '1%'
	},
	disabledButton: {
		backgroundColor: colors.lightGray
	}
};