// This is where you would inport the firebase functions

const createActionTypes = actionTypes => actionTypes
	.map(type => ({ [type]: `module/${type}`	}))
	.reduce((types, type) => ({ ...types, ...type }), {});

// Action Names
const ACTIONS = createActionTypes([
	'LOGIN_STATUS',
	'APP_LOADING',
	'LOAD_USER',
	'OUTLET_ID'
]);

// Initial State
const INITIAL_STATE = {
	isLoggedIn: false,
	isLoading: true,
	activeUser: {},
	outletID: 0
};

// Actions
// Make a reducer that updated corresponding variables with the payload
const userReducers = (state = INITIAL_STATE, { payload, type }) => {
	switch (type) {
		case ACTIONS.LOGIN_STATUS:
			return { ...state, isLoggedIn: payload };
		case ACTIONS.APP_LOADING:
			return { ...state, isLoading: payload };
		case ACTIONS.LOAD_USER:
			return { ...state, activeUser: payload };
		case ACTIONS.OUTLET_ID:
			return { ...state, outletID: payload };
		default:
			return state;
	}
};

// Function calls to be used in dispatch calls
export const loginStatus = (status) => dispatch => {
	// getUserStatus().then(status =>
	dispatch({ type: ACTIONS.LOGIN_STATUS, payload: status });
};

export const appLoading = () => dispatch => {
	dispatch({ type: ACTIONS.APP_LOADING, payload: false });
};

export const loadUser = (user) => dispatch => {
	// loadUserData().then(payload => dispatch({ type: ACTIONS.LOAD_USER, payload }));
	dispatch({ type: ACTIONS.LOAD_USER, payload: user });
};

export const setID = (newId) => dispatch => {
	dispatch({ type: ACTIONS.OUTLET_ID, payload: newId });
};

export default userReducers;