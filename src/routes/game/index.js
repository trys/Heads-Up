import { h, Component } from 'preact';
import { getShuffledQuestions } from './questions';

const GAMETIME = 60;
const COUNTDOWN = 3;
const DEGREES = 15;
const USE_ACCELEROMETER = true;

export default class Profile extends Component {
	state = {
		timer: null,
		time: null,
		gameState: 'pending',
		questionIndex: 0,
		questions: [],
		nexting: false
	};

	startGame = () => {
		if (this.state.gameState === 'running') {
			this.stopGame('restarting');
		}

		this.setState(
			{
				gameState: 'starting',
				time: GAMETIME + COUNTDOWN,
				timer: window.setTimeout(this.tick, 1000),
				questions: getShuffledQuestions(),
				questionIndex: 0
			},
			this.requestAccelerometer
		);
	};

	stopGame = (gameState = 'ended') => {
		if (this.state.timer) {
			window.clearTimeout(this.state.timer);
		}

		this.setState(
			{
				gameState,
				time: null,
				timer: null
			},
			() => {
				this.tada();
				this.stopAccelerometer();
			}
		);
	};

	tick = () => {
		if (this.state.time) {
			const readyToStart = this.state.time - GAMETIME === 1;
			if (readyToStart) {
				this.setState({ gameState: 'running' });
			}

			this.setState({
				time: this.state.time - 1,
				timer: window.setTimeout(this.tick, 1000)
			});
		} else {
			this.stopGame();
		}
	};

	next = () => {
		this.setState(
			({ questionIndex }) => ({
				questionIndex: questionIndex + 1
			}),
			this.ding
		);
	};

	move = event => {
		const angle = Math.abs(event.gamma);
		const angleMatches = angle < DEGREES;
		const { nexting, gameState } = this.state;

		if (angleMatches && !nexting && gameState === 'running') {
			this.setState({ nexting: true }, this.next);
		} else if (!angleMatches && nexting) {
			this.setState({ nexting: false });
		}
	};

	requestAccelerometer = () => {
		if (!USE_ACCELEROMETER) {
			return;
		}

		if (
			typeof DeviceOrientationEvent !== 'undefined' &&
			typeof DeviceOrientationEvent.requestPermission === 'function'
		) {
			DeviceOrientationEvent.requestPermission()
				.then(response => {
					if (response === 'granted') {
						this.startAccelerometer();
					}
				})
				.catch(console.error);
		} else {
			this.startAccelerometer();
		}
	};

	startAccelerometer = () => {
		window.addEventListener('deviceorientation', this.move, true);
	};

	stopAccelerometer = () => {
		window.removeEventListener('deviceorientation', this.move, true);
	};

	ding = () => {
		this.playSound(document.getElementById('ding'));
	};

	tada = () => {
		this.playSound(document.getElementById('tada'));
	};

	playSound = audio => {
		if (!audio) return;
		audio.pause();
		audio.currentTime = 0;
		audio.play();
	};

	componentWillUnmount() {
		this.stopAccelerometer();
	}

	renderEndState = () => {
		return (
			<div class="game game--ended">
				<h2>Time's up!</h2>
				<button type="button" class="button" onClick={() => this.startGame()}>
					Play again
				</button>
			</div>
		);
	};

	renderPendingState = () => {
		return (
			<div class="game game--pending">
				<h2>Ready to begin?</h2>
				<button type="button" class="button" onClick={() => this.startGame()}>
					Start
				</button>
			</div>
		);
	};

	renderRunningState = () => {
		const { time, questions, questionIndex } = this.state;
		const question = questions[questionIndex];

		return (
			<div class="game game--running">
				<h2 class="question">{question || <span>&nbsp;</span>}</h2>
				<time>{time}</time>
				<div>
					<button
						type="button"
						class="button button--small"
						onClick={() => this.next()}
					>
						Next
					</button>
					<button
						type="button"
						class="button button--small"
						onClick={() => this.stopGame()}
					>
						Stop
					</button>
				</div>
			</div>
		);
	};

	renderStartingState = () => {
		const time = this.state.time - GAMETIME;

		return (
			<div class="game game--starting">
				<h2>Starting in: {time}</h2>
			</div>
		);
	};

	render(props, { gameState, time, questions, questionIndex }) {
		switch (gameState) {
			case 'ended':
				return this.renderEndState();
			case 'pending':
				return this.renderPendingState();
			case 'starting':
				return this.renderStartingState();
			case 'running':
				return this.renderRunningState();
		}

		return null;
	}
}
