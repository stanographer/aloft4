'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conferenceSchema = mongoose.Schema({
	url: String,
	name: String,
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
	users: []
});

var Event = mongoose.model('Conference', conferenceSchema);
module.exports  = Event;