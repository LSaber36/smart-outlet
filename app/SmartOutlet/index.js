import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
// Should launch App, which will then go to the splash page and contain the navigation stack
import App from './src/App';
import { name as appName } from './src/app.json';
import { createStore, applyMiddleware } from 'redux';
import reducers from './src/redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

export default class Main extends Component {
	render() {
		const store = createStore(reducers, {}, applyMiddleware(thunk));

		return (
			<Provider store = { store }>
				<App />
			</Provider>
		);
	}
}

AppRegistry.registerComponent(appName, () => Main);