import { combineReducers } from 'redux';
import userReducers from './userReducers';

export * from './userReducers';

// Combine the reducers into one set of reducers
const reducers = combineReducers({
	user: userReducers
});

export default reducers;