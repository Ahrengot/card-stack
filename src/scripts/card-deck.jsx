import React from 'react'
import _ from 'underscore'
import { TransitionSpring } from 'react-motion'

import Card from './card';

class CardDeck extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			startMouse: [0, 0],
			delta: [0, 0],
			accepts: false,
			rejects: false,
			isPressed: false,
			lastPressed: null
		};
	}

	componentWillMount() {
		_.bindAll( this, 'handleMouseDown', 'handleTouchStart', 'handleTouchMove', 'handleMouseMove', 'handleMouseUp', 'renderCard', 'willLeave', 'willEnter' );

		window.addEventListener('touchmove', this.handleTouchMove);
		window.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('touchend', this.handleMouseUp);
		window.addEventListener('mouseup', this.handleMouseUp);
	}

	componentWillUnmount() {
		window.removeEventListener('touchmove', this.handleTouchMove);
		window.removeEventListener('mousemove', this.handleMouseMove);
		window.removeEventListener('touchend', this.handleMouseUp);
		window.removeEventListener('mouseup', this.handleMouseUp);
	}

	handleTouchStart(key, {touches}) {
		this.handleMouseDown(key, touches[0]);
	}

	handleMouseDown(id, e) {
		this.setState({
			startMouse: [e.pageX, e.pageY],
			delta: [0, 0],
			lastPressed: id,
			isPressed: true
		});
	}

	handleTouchMove({touches}) {
		this.handleMouseMove(touches[0]);
	}

	handleMouseMove(e) {
		if ( ! this.state.isPressed ) {
			return;
		}

		let dx = e.pageX - this.state.startMouse[0];
		let dy = e.pageY - this.state.startMouse[1];

		this.setState({
			delta: [dx, dy],
			accepts: (dx >= this.props.threshold),
			rejects: (dx <= this.props.threshold * -1)
		});
	}

	handleMouseUp() {
		let { lastPressed, accepts, rejects } = this.state;
		this.setState( { isPressed: false, accepts: false, rejects: false }, function() {
			if ( accepts || rejects ) {
				this.props.onSwipe(lastPressed, accepts);
			}
		});
	}

	getTransform(x, y, r) {
		return `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`;
	}

	renderCard(config, key) {
		let { x, y, r, card } = config.val;

		let cardProps = {
			key: key,
			text: card.text,
			onMouseDown: this.handleMouseDown.bind(this, key),
			onTouchStart: this.handleTouchStart.bind(this, key),
		};

		if ( this.state.lastPressed === key ) {
			cardProps.accepts = this.state.accepts;
			cardProps.rejects = this.state.rejects;
		}

		cardProps.style = {
			backgroundColor: card.color,
			transform: this.getTransform(x, y, r),
			WebkitTransform: this.getTransform(x, y, r),
		};

		return <Card { ...cardProps } />
	}

	getDefaultVal() {
		let configs = {}
		_.each(_.last(_.keys(this.props.cards), 2), function(key) {
			configs[key] = {
				val: {
					card: this.props.cards[key],
					x: 0,
					y: 0,
					r: 0,
				},
				config: this.props.springDefault
			}
		}, this);
		return configs;
	}

	getEndVal() {
		let configs = {}

		_.each(_.last(_.keys(this.props.cards), 2), function(key) {
			let val = { x: 0, y: 0, r: 0 };
			let config = this.props.springDefault;

			if (this.state.lastPressed === key && this.state.isPressed) {
				val.x = this.state.delta[0];
				val.y = this.state.delta[1];
				val.r = this.state.delta[0] * 0.07;
				config = this.props.springDrag;
			}

			val.card = this.props.cards[key];

			configs[key] = {
				val: val,
				config: config
			};
		}, this);

		return configs;
	}

	willEnter(key) {
		return {
			val: {
				card: this.props.cards[key],
				x: 0,
				y: 0,
				r: 0,
			},
			config: this.props.springEnter
		}
	}

	willLeave(key, value, endValue, currentValue, currentSpeed) {
		let { x, y, r } = currentValue[key].val;

		// If use user hasn't pressed a new card since this one started
		// animating out, use the current state delta to determine end val
		if ( this.state.lastPressed === key ) {
			x = this.state.delta[0] > 0 ? window.innerWidth * 1.1 : window.innerWidth * -0.8;
			y = this.state.delta[1];
		}

		return {
			val: {
				card: currentValue[key].val.card,
				x: x,
				y: y,
				r: r
			},
			config: this.props.springLeave
		};
	}

	render() {
		return (
			<TransitionSpring defaultValue={ this.getDefaultVal() } endValue={ this.getEndVal() } willEnter={ this.willEnter } willLeave={ this.willLeave } >
				{ transitionProps =>
					<div className="card-deck">
						{ _.map(transitionProps, this.renderCard ) }
					</div>
				}
			</TransitionSpring>
		);
	}
}

CardDeck.defaultProps = {
	threshold: 120,
	// See this for spring configs:
	// https://cdn.rawgit.com/chenglou/react-motion/e8f42dcd9678a8cea8648a3cf4f994583a99e7f7/demos/demo5/index.html
	springDrag: [0, 20],
	springDefault: [250, 15],
	springLeave: [120, 15],
};

export default CardDeck;
