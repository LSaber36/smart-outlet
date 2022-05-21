// This is where you would inport the firebase functions

const createActionTypes = actionTypes => actionTypes
	.map(type => ({ [type]: `module/${type}`	}))
	.reduce((types, type) => ({ ...types, ...type }), {});

// Action Names
const ACTIONS = createActionTypes([
	'USER_STATUS',
	'APP_LOADING',
	'LOAD_USER',
	'DEVICE_ID'
]);

// Initial State
const INITIAL_STATE = {
	isLoggedIn: false,
	isLoading: true,
	activeUser: {},
	deviceID: 0
};

// Actions
// Make a reducer that updated corresponding variables with the payload
const userReducers = (state = INITIAL_STATE, { payload, type }) => {
	switch (type) {
		case ACTIONS.USER_STATUS:
			return { ...state, isLoggedIn: payload };
		case ACTIONS.APP_LOADING:
			return { ...state, isLoading: payload };
		case ACTIONS.LOAD_USER:
			return { ...state, activeUser: payload };
		case ACTIONS.DEVICE_ID:
			return { ...state, deviceID: payload };
		default:
			return state;
	}
};

// Function calls to be used in dispatch calls
// export const userStatus = () => dispatch => {
// 	getUserStatus().then(status =>
// 		dispatch({ type: ACTIONS.USER_STATUS, payload: status }));
// };

// export const appLoading = () => dispatch => {
// 	dispatch({ type: ACTIONS.APP_LOADING, payload: false });
// };

// export const loadUser = () => dispatch => {
// 	loadUserData().then(payload => dispatch({ type: ACTIONS.LOAD_USER, payload }));
// };

export const setID = (newId) => dispatch => {
	dispatch({ type: ACTIONS.DEVICE_ID, payload: newId });
};

export default userReducers;