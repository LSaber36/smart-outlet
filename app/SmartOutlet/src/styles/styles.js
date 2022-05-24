import { colors } from './colors';

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
		width: '65%',
		height: '7%',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 50,
		borderRadius: 6
	},
	center: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	input: {
		width: '100%',
		borderWidth: 1,
		borderColor: colors.lightGray,
		padding: 10,
		fontSize: 16,
		borderRadius: 6
	},
	errorText: {
		color: colors.delete,
		marginTop: '1%'
	}
};