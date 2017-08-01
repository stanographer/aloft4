const express = require('express')
	, Event = require('../models/event')
	, config = require('../config/aloft-config')
	, db = require('sharedb-mongo')(config.mongo)
	, ShareDB = require('sharedb');

const router = express.Router();

let doc;

router.get('/', isLoggedIn, function (req, res) {
	var query = req.query.event;
	if (query) {
		Event.findOne({url: query, user: req.user.local.username}, function (err, found) {
			if (err) {
				throw err;
			} else {
				if (found) {
					req.flash('success_message', 'Event')
					res.redirect('/dashboard');
				} else {
					req.flash('error_message', 'Cannot run editor because event "' + query + '" does not exist.<br />Please create the event first.');
					res.redirect('/dashboard');
				}
			}
		});
	} else {
		req.flash('error_message', 'Event must have a title!');
		res.redirect('/dashboard');
	}
});

router.post('/', isLoggedIn, function (req, res) {
	var event = new Event(req.body.event);

	event.user = req.user.local.username;
	event.url = req.body.event.url.trim().toLowerCase();

	// If there is no title given by user, automatically assign the URL to be the title.
	if (!event.title) {
		event.title = event.url;
	}

	checkUrl(event.url, event.user, startEvent);

	function startEvent (valid, warnings) {
		if (valid) {
			checkForDuplicates(event.url, event.user, proceed);
		} else {
			var messages = warnings.join('<br />');
			req.flash('error_message', '<strong>Event could not be created.</strong> Please fix the following errors: <br /><br />' + messages);
			res.redirect('/dashboard');
		}
	}
	function proceed (isDup) {
		if (isDup) {
			res.redirect('/dashboard?event=' + event.url);
		} else {
			event.save(function (err, event) {
					if (err) {
						throw err;
						req.flash('error_message', 'There was an error saving the event! Please check your database.');
						res.redirect('/dashboard');
					} else {
						// res.redirect('/editor?event=' + event.url);
						req.flash('success_message', 'Event \"' + event.title + '\" was successfully created! Click on the play icon below to begin writing.');
						res.redirect('/dashboard#repo');
					}
			});
		}
	}
});

router.delete('/:id', isLoggedIn, function (req, res) {
	Event.findById(req.params.id, function (err, event) {
		if (err) {
			throw err;
		} else {
			deleteShareDbDoc(event.user, event.url);
			Event.remove({_id: req.params.id}, function (err) {
				if (err) {
					throw err;
				} else {
					req.flash('success_message', 'Event "' + event.title + ' (' + event.url + ') " was successfully deleted!');
					res.redirect('/dashboard#repo');
				}
			});
		}
	});
});

// Logic ------------------------------------

var checkUrl = function (event, user, callback) {
	let warnings = [];
	let isValid = true;
	let errors = {
		notLongEnough: 'An event URL must be at least one character long.',
		containsSpaces: 'Event URL may not contain spaces.',
		alphaNumOnly: 'Event titles may only contain alphanumeric characters, hyphens, or underscores.',
		isDuplicate: 'An event with this URL already exists.'
	}

	try {
		if (!isMinLength(event)) {
			throw errors.notLongEnough;
		}
	} catch (error) {
		warnings.push(error);
	} try {
		if (!alphaNumericOnly(event)) {
			throw errors.alphaNumOnly;
		}
	} catch (error) {
		warnings.push(error);
	} try {
		if (hasWhiteSpace(event)) {
			throw errors.containsSpaces;
		}
	} catch (error) {
		warnings.push(error);
	} finally {
		if (warnings && warnings.length === 0) {
			callback(true, 'Success!');
		} else {
			callback(false, warnings);
		}
	}
}

function alphaNumericOnly (string) {
	var regexp = /^[a-z\d\-_\s]+$/i;
	if (string.match(regexp)) {
		return true;
	} else {
		return false;
	}
}

function hasWhiteSpace(string) {
	if (string.indexOf(' ') >= 0) {
		return true;
	} else {
		return false;
	}
}

function isMinLength (string) {
	if (string.length > 0) {
		return true;
	} else {
		return false;
	}
}

function checkForDuplicates (url, user, callback) {
	let searchForDupes = new Promise(
		function (resolve, reject) {
			Event.findOne({'url': url, 'user': user}, function (err, event) {
				if (err) {
					throw err;
				} else {
					if (!event) {
						console.log('NO EVNT FOUND')
						reject('No event found; is a unique url.');
					} else {
						console.log('EVNT FOUND')
						resolve('Found an event; not a unique url.')
					}
				}
			});
		}
	);

	let findMatch = function () {
		searchForDupes
			.then(function (fulfilled) {
				callback(true);

			})
			.catch(function (error) {
				callback(false);

			});
	}

	findMatch();
}
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('loginMessage', 'You must be logged in to do that!');
		return res.redirect(307, '/login');
}

function deleteShareDbDoc (user, title) {
	let backend = ShareDB({db: db});
	let connection = backend.connect();
	let doc = connection.get(user, title);

	doc.fetch(function(err) {
		if (err) throw err;
		doc.del(function(err) {
			if (err) throw err;
    		// When done with the doc, remove the client's reference to the doc object so that it does not stay in memory:
			doc.destroy();
		});
	});
}

module.exports = router;