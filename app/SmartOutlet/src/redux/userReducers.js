// This is where you would inport the firebase functions

const createActionTypes = actionTypes => actionTypes
	.map(type => ({ [type]: `module/${type}`	}))
	.reduce((types, type) => ({ ...types, ...type }), {});

// Action Names
const ACTIONS = createActionTypes([
	'LOGIN_STATUS',
	'APP_LOADING',
	'LOAD_USER_DATA',
	'OUTLET_REF_LIST',
	'SELECTED_OUTLET_ID'
]);

// Initial State
const INITIAL_STATE = {
	isLoading: true,
	isLoggedIn: false,
	selectedOutletID: '',
	outletRefList: [],
	activeUserData: {}
};

// Actions
// Make a reducer that updated corresponding variables with the payload
const userReducers = (state = INITIAL_STATE, { payload, type }) => {
	switch (type) {
		case ACTIONS.LOGIN_STATUS:
			return { ...state, isLoggedIn: payload };
		case ACTIONS.APP_LOADING:
			return { ...state, isLoading: payload };
		case ACTIONS.LOAD_USER_DATA:
			return { ...state, activeUserData: payload };
		case ACTIONS.OUTLET_REF_LIST:
			return { ...state, outletRefList: payload };
		case ACTIONS.SELECTED_OUTLET_ID:
			return { ...state, selectedOutletID: payload };
		default:
			return state;
	}
};

// Function calls to be used in dispatch calls
export const loginStatus = (status) => dispatch => {
	dispatch({ type: ACTIONS.LOGIN_STATUS, payload: status });
};

export const appLoading = (state) => dispatch => {
	dispatch({ type: ACTIONS.APP_LOADING, payload: state });
};

export const loadUserData = (user) => dispatch => {
	dispatch({ type: ACTIONS.LOAD_USER_DATA, payload: user });
};

export const setOutletRefList = (newOutletRefList) => dispatch => {
	dispatch({ type: ACTIONS.OUTLET_REF_LIST, payload: newOutletRefList });
};

export const setActiveID = (newId) => dispatch => {
	dispatch({ type: ACTIONS.SELECTED_OUTLET_ID, payload: newId });
};

export default userReducers;