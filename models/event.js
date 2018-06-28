'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = mongoose.Schema({
	user: String,
	url: String,
	title: String,
	conf: String,
	speaker: String,
	collab: {
		type: Boolean,
		default: false
	},
	completed: {
		type: Boolean,
		default: false
	},
	created: {
		type: Date,
		default: Date.now
	},
	formattedDate: String,
	hidden: Boolean,
	snapshot: String,
	viewCount: String,
	version: String
});

var Event = mongoose.model('Event', eventSchema);
module.exports  = Event;