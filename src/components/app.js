import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Game from '../routes/game';

export default class App extends Component {
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render() {
		return (
			<div id="app">
				<Router onChange={this.handleRoute}>
					<Game path="/" />
				</Router>
				<audio src="/assets/ding.mp3" id="ding" preload="auto" />
				<audio src="/assets/tada.mp3" id="tada" preload="auto" />
			</div>
		);
	}
}
