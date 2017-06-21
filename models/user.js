'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
	local: {
		username: String,
		password: String,
		email: String,
		firstname: String,
		lastname: String,
		prefs: {},
		admin: {
			type: Boolean,
			default: false
		},
		isNew: {
			type: Boolean,
			default: false
		}
	},
	resetPasswordToken: String,
	resetPasswordExpiration: Date
});

module.exports = mongoose.model('User', userSchema);