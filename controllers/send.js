'use strict';

const nodemailer = require('nodemailer')
	, mailerConfig = require('../config/mailer.js');

let status = false;

module.exports = function (recipient, user, title, url, subject, message) {
	let transport = nodemailer.createTransport(mailerConfig);
	console.log(user)

	let mailOptions = {
		to: recipient,
		// from: user.firstname + ' ' + user.lastname + ' ' + '<' + user.email + '>'
		from: 'Aloft Support',
		subject: subject,
		text: message,
		attachments: [
			{
				filename: url + '.txt',
				path: 'http://localhost:4000/text/' + user.local.username + '/' + url
			}
		]
	}

	transport.sendMail(mailOptions, function (err) {
		if (err) {
			throw err;
			status = false;
		} else {
			console.log('Message sent!');
			status = true;
		}
	});
	return status;
}