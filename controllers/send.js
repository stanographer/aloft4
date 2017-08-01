'use strict';

const nodemailer = require('nodemailer')
	, smtpTransport = require('nodemailer-smtp-transport')
	, mailerConfig = require('../config/mailer.js');

let status = false;

module.exports = function (recipient, user, title, url, subject, message) {
	let transport = nodemailer.createTransport(smtpTransport(mailerConfig));
	console.log(user)

	let mailOptions = {
		to: recipient,
		from: 'Aloft Support',
		subject: subject,
		text: message,
		attachments: [
			{
				filename: url + '.txt',
				path: location.origin + '/text/' + user.local.username + '/' + url
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