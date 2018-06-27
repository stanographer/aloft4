'use strict';

const express = require('express'),
	config = require('../config/aloft-config'),
	Conference = require('../models/conference'),
	User = require('../models/user'),
	Event = require('../models/event');

const router = express.Router();

router.get('/', (req, res) => {
	// console.log(req.query.name, req.query.session);
	Conference.findOne({
		'url': req.query.name
	}, (err, conf) => {
		if (err) throw err;
		if (conf) {
			console.log(conf.plannedEvents);
			let event = conf.events.find((element) => {
				return element.slug === req.query.session;
			});
			let plannedEvent = conf.plannedEvents.find((element) => {
				return element.slug === req.query.session;
			});
			if (event) {
				console.log(event);
			} else if (plannedEvent) {
				console.log(plannedEvent);
				res.render('hasnt-started', {
					conf_slug: req.query.name,
					title: plannedEvent.title,
					speaker: plannedEvent.speaker
				});
			}
		}
	});
});

router.get('/', (req, res) => {
	Conference.find({}, (err, conf) => {
		if (err) throw err;
		res.json(conf);
	});
});

router.post('/new', isLoggedIn, function (req, res) {
	let conf = new Conference(req.body.conf);

	conf.user = req.user.local.username;
	conf.url = conf.url.toLowerCase();

	checkUrl(conf.url, addConf);

	function addConf(valid, warnings) {
		if (valid) {
			checkForDuplicates(conf.url, proceed);
		} else {
			var messages = warnings.join('<br />');
			req.flash('error_message', '<strong>Conference could not be created.</strong> Please fix the following errors: <br /><br />' + messages);
			res.redirect('/dashboard');
		}
	}

	function proceed(isDup) {
		if (isDup) {
			res.redirect(conf.url + window.location.hostname + ':' + window.location.port);
		} else {
			conf.save(function (err, conf) {
				if (err) {
					throw err;
					req.flash('error_message', 'There was an error saving the event! Please check your database.');
					res.redirect('/dashboard');
				} else {
					// res.redirect('/editor?event=' + event.url);
					req.flash('success_message', 'Conference \"' + conf.title + '\" was successfully created! Use the picker to set it as your active conference.');
					res.redirect('/dashboard#conference');
				}
			});
		}
	}
});

router.post('/set', isLoggedIn, function (req, res) {
	User.findOne({
		'local.username': req.user.local.username
	}, function (err, user) {
		if (err) {
			throw err;
		} else {
			if (user) {

				let conf_url = req.body.current_conf.split(',')[0];
				let conf_title = req.body.current_conf.split(',')[1];

				Conference.findOne({
					url: conf_url
				}, function (err, conf) {
					if (err) {
						throw err;
					} else {
						if (conf) {
							user.update({
									$set: {
										'conference': conf
									}
								}, {
									upsert: true
								},
								function (err, updated) {
									req.flash('success_message', 'Active conference successfully set!');
									res.redirect('/dashboard#conference');
								});
						}
					}
				});
			}
		}
	});
});

router.post('/new-event', isLoggedIn, function (req, res) {
	let confEvent = req.body.conf;
	confEvent.user = req.user.local.username;

	function addEventRemovePlanned(conf, plannedEvent) {
		plannedEvent.user = req.user.local.username;

		conf.update({
			$push: {
				events: plannedEvent
			},
			$pull: {
				plannedEvents: plannedEvent
			}
		}, {
			upsert: true
		}, (err) => {
			if (err) throw err;
			let event = new Event({
				title: plannedEvent.title,
				speaker: plannedEvent.speaker,
				url: plannedEvent.slug,
				conf: confUrl
			});
			// Give it a title if none.
			if (!event.title) {
				event.title = event.url;
			}
			checkForDuplicateEvent(event);
		});
	}

	function checkForDuplicateEvent(event) {
		Event.findOne({user: req.user.local.username, url: event.url}, (err, event) => {
			if (err) throw err;
			if (!event) {
				res.send('yay no event')
			} else {
				var messages = warnings.join('<br />');
				req.flash('error_message', '<strong>Event could not be created.</strong> Please fix the following errors: <br /><br />' + messages);
				res.redirect('/dashboard');
			}
		});
	}

	Conference.findOne({
		'url': req.user.conference.url
	}, function (err, conf) {

		if (err) throw err;
		if (conf) {
			let plannedEvent = conf.plannedEvents.find((element) => {
				return element.slug === confEvent.slug;
			});

			let startedEvent = conf.events.find((element) => {
				return element.slug === confEvent.slug;
			});

			if (plannedEvent) {
				addEventRemovePlanned(conf, plannedEvent);
			} else if (startedElement) {
				res.send('that is started');
			} else {
				req.flash('error_message', '<strong>Event could not be found.</strong> Please check to make sure events were uploaded correctly.');
				res.redirect('/dashboard');
			}

			
			

			// if (plannedEvent) {
			// 	res.json(plannedEvent);
			// }

			// conf.update({
			// 		$push: {
			// 			events: conf_event
			// 		}
			// 	}, {
			// 		upsert: true
			// 	},
			// 	function (err, updated) {
			// 		if (err) {
			// 			throw err;
			// 		} else {
			// 			var event = new Event({
			// 				title: conf_event.title,
			// 				user: req.user.local.username,
			// 				speaker: conf_event.speaker
			// 			});

			// 			// If there is no title given by user, automatically assign the URL to be the title.
			// 			if (!event.title) {
			// 				event.title = event.url;
			// 			}

			// 			checkUrl(event.url, startEvent);

		

			// 			function proceed(isDup) {
			// 				if (isDup) {
			// 					res.redirect('/dashboard?event=' + event.url);
			// 				} else {
			// 					event.save(function (err, event) {
			// 						if (err) {
			// 							throw err;
			// 							req.flash('error_message', 'There was an error saving the event! Please check your database.');
			// 							res.redirect('/dashboard');
			// 						} else {
			// 							// res.redirect('/editor?event=' + event.url);
			// 							req.flash('success_message', 'Event \"' + event.title + '\" was successfully created! Click on the play icon below to begin writing.');
			// 							res.redirect('/dashboard#repo');
			// 						}
			// 					});
			// 				}
			// 			}
			// 		}
			// 	});
		}
	});
});

// Logic ----------------------------------------------------------

function startEvent(valid, warnings) {
	if (valid) {
		checkForDuplicateEvent(event.url, event.user, proceed);
	} else {
		var messages = warnings.join('<br />');
		req.flash('error_message', '<strong>Event could not be created.</strong> Please fix the following errors: <br /><br />' + messages);
		res.redirect('/dashboard');
	}
}

function checkUrl (conf, callback) {
	let warnings = [];
	let errors = {
		notLongEnough: 'A conference URL must be at least one character long.',
		containsSpaces: 'Conference URL may not contain spaces.',
		alphaNumOnly: 'Conference URLs may only contain alphanumeric characters, hyphens, or underscores.',
		isDuplicate: 'A conference with this URL already exists.'
	}

	try {
		if (!isMinLength(conf)) {
			throw errors.notLongEnough;
		}
	} catch (error) {
		warnings.push(error);
	}
	try {
		if (!alphaNumericOnly(conf)) {
			throw errors.alphaNumOnly;
		}
	} catch (error) {
		warnings.push(error);
	}
	try {
		if (hasWhiteSpace(conf)) {
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

function alphaNumericOnly(string) {
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

function isMinLength(string) {
	if (string.length > 0) {
		return true;
	} else {
		return false;
	}
}

function checkForDuplicates(url, callback) {
	let searchForDupes = new Promise(
		function (resolve, reject) {
			Conference.findOne({
				'url': url
			}, function (err, conf) {
				if (err) {
					throw err;
				} else {
					if (!conf) {
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

function checkForDuplicateEvent(url, user, callback) {
	let searchForDupes = new Promise(
		function (resolve, reject) {
			Event.findOne({
				'url': url,
				'user': user
			}, function (err, event) {
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

function deleteShareDbDoc(user, title) {
	let backend = ShareDB({
		db: db
	});
	let connection = backend.connect();
	let doc = connection.get(user, title);

	doc.fetch(function (err) {
		if (err) throw err;
		doc.del(function (err) {
			if (err) throw err;
			// When done with the doc, remove the client's reference to the doc object so that it does not stay in memory:
			doc.destroy();
		});
	});
}

router.post('/plan-events', function (req, res) {
	function proceed(eventsObject) {
		Conference.findOne({
			url: req.user.conference.url
		}, function (err, conf) {
			if (err) {
				throw err;
			} else {
				if (conf) {
					conf.update({
							$push: {
								plannedEvents: {
									$each: eventsObject
								}
							}
						}, {
							upsert: true
						},
						function (err, updated) {
							if (err) {
								throw err;
							} else {
								req.flash('success_message', 'Planned events added successfully to ' + conf.title + '!');
								res.redirect('/dashboard#conference');
							}
						});
				}
			}
		});
	}
	proceed(processPlannedEvents(req.body.event_list));
});

function processPlannedEvents(originalList) {
	let talks = [];

	if (originalList && originalList.length > 0) {
		let list = originalList.trim()
			.replace(/\r\n/g, '\n')
			.replace(/^\s*[\r\n]/gm, '')
			.split('\n');

		for (let i = 0; i < list.length; i++) {
			let split = list[i].split('::');
			let talk = {
				slug: '',
				title: '',
				speaker: ''
			};
			talk.slug = (!split[0]) ? '' : split[0].toString();
			talk.title = (!split[1]) ? '' : split[1].toString();
			talk.speaker = (!split[2]) ? '' : split[2].toString();

			talks.push(talk);
		}
	}
	return talks;
}

module.exports = router;