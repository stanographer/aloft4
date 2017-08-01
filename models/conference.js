'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conferenceSchema = mongoose.Schema({
	url: String,
	title: String,
	user: String,
	created: {
		type: Date,
		default: Date.now
	},
	public: {
		type: Boolean,
		default: true
	},
	plannedEvents: [],
	events: [],
	users: [],
	tracks: []
});

var Conference = mongoose.model('Conference', conferenceSchema);
module.exports  = Conference;