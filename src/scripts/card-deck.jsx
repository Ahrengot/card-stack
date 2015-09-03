﻿import React from 'react'import _ from 'underscore'import { TransitionSpring } from 'react-motion'import Card from './card';class CardDeck extends React.Component {	constructor(props) {		super(props);		this.state = {			mouse: [0, 0],			startMouse: [0, 0],			delta: [0, 0],			accepts: false,			rejects: false,			lastPressed: null		};	}	componentWillMount() {		_.bindAll( this, 'handleMouseDown', 'handleTouchStart', 'handleTouchMove', 'handleMouseMove', 'handleMouseUp', 'renderCard', 'willLeave' );		window.addEventListener('touchmove', this.handleTouchMove);		window.addEventListener('mousemove', this.handleMouseMove);		window.addEventListener('touchend', this.handleMouseUp);		window.addEventListener('mouseup', this.handleMouseUp);	}	componentWillUnMount() {		window.removeEventListener('touchmove', this.handleTouchMove);		window.removeEventListener('mousemove', this.handleMouseMove);		window.removeEventListener('touchend', this.handleMouseUp);		window.removeEventListener('mouseup', this.handleMouseUp);	}	handleTouchStart(key, {touches}) {		this.handleMouseDown(key, touches[0]);	}	handleMouseDown(id, e) {		this.setState({			startMouse: [e.pageX, e.pageY],			delta: [0, 0],			lastPressed: id,			isPressed: true		});	}	handleTouchMove({touches}) {		this.handleMouseMove(touches[0]);	}	handleMouseMove(e) {		if ( ! this.state.isPressed ) {			return;		}		let deltaX = e.pageX - this.state.startMouse[0];		let deltaY = e.pageY - this.state.startMouse[1];		this.setState({			delta: [deltaX, deltaY],			accepts: (deltaX >= this.props.threshold),			rejects: (deltaX <= this.props.threshold * -1)		});	}	handleMouseUp() {		let { lastPressed, accepts, rejects } = this.state;		this.setState( { isPressed: false, accepts: false, rejects: false }, function() {			if ( accepts || rejects ) {				this.props.onSwipe(lastPressed, accepts);			}		});	}	getTransform(x, y, r) {		return `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`;	}	renderCard(config, key) {		let { x, y, r, o, card } = config.val;		let cardProps = {			key: key,			text: card.text,			onMouseDown: this.handleMouseDown.bind(this, key),			onTouchStart: this.handleTouchStart.bind(this, key),		};		if ( this.state.lastPressed === key ) {			cardProps.accepts = this.state.accepts;			cardProps.rejects = this.state.rejects;		}		cardProps.style = {			opacity: o,			backgroundColor: card.color,			transform: this.getTransform(x, y, r),			WebkitTransform: this.getTransform(x, y, r),		};		return <Card { ...cardProps } />	}	getDefaultVal() {		let configs = {}		_.each(this.props.cards, function(card, key) {			configs[key] = {				val: {					card: card,					x: 0,					y: 0,					r: 0,					o: 1				},				config: this.props.springEnter			}		}, this);		return configs;	}	getEndVal() {		let configs = {}		_.each(this.props.cards, function(card, key) {			let val = { x: 0, y: 0, r: 0, o: 1 };			if (this.state.lastPressed === key && this.state.isPressed) {				val.x = this.state.delta[0];				val.y = this.state.delta[1];				val.r = this.state.delta[0] * 0.1;			}			val.card = card;			configs[key] = {				val: val,				config: this.props.springMove			};		}, this);		return configs;	}	willEnter(key) {		return {			val: {				card: this.props.cards[key],				x: 0,				y: 0,				r: 0,				o: 0,			},			config: this.props.springEnter		}	}	willLeave(key, value, endValue, currentValue, currentSpeed) {		let { x, y, r } = currentValue[key].val;		// If use user hasn't pressed a new card since this one started		// animating out, use the current state delta to determine end val		if ( this.state.lastPressed === key ) {			x = this.state.delta[0] > 0 ? window.innerWidth : window.innerWidth * -1;			y = this.state.delta[1];			r = Math.random() * 5 - 10;		}		return {			val: {				card: currentValue[key].val.card,				x: x,				y: y,				r: r			},			config: this.props.springLeave		};	}	render() {		return (			<TransitionSpring defaultValue={ this.getDefaultVal() } endValue={ this.getEndVal() } willEnter={ this.willEnter } willLeave={ this.willLeave } >				{ transitionProps =>					<div className="card-deck">						{ _.map(transitionProps, this.renderCard ) }					</div>				}			</TransitionSpring>		);	}}CardDeck.defaultProps = {	threshold: 120,	springMove: [350, 15],	springEnter: [90, 7],	springLeave: [90, 7],};export default CardDeck;