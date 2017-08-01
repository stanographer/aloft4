'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = mongoose.Schema({
	user: String,
	url: String,
	title: String,
	speaker: String,
	alias: String,
	collab: Boolean,
	completed: {
		type: Boolean,
		default: false
	},
	created: {
		type: Date,
		default: Date.now
	},
	hidden: Boolean,
	subdomain: String,
	viewCount: String,
	version: String
});

var Event = mongoose.model('Event', eventSchema);
module.exports  = Event;