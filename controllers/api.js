const express = require('express')
	, config = require('../config/aloft-config')
	, Conference = require('../models/conference')
	, User = require('../models/user')
	, Event = require('../models/event');

const router = express.Router();

function schedule(conf, plannedEvent) {
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
			url: req.body.session,
			conf: req.body.name
		});
		// Give it a title if none.
		if (!event.title) {
			event.title = event.url;
		}
		checkForDuplicateEvent(event);
	});
}

router.get('/conf', (req, res) => {
	Conference.findOne({'url': req.body.name}, (err, conf) => {
		if (err) throw err;
		if (conf) {
			res.json(conf);
		} else {
			res.json('');
		}
	});
});

router.get('/conf/plannedEvents', (req, res) => {
	Conference.findOne({'url': req.body.name}, (err, conf) => {
		if (err) throw err;
		if (conf) {
			res.json(conf.plannedEvents);
		} else {
			res.json('');
		}
	});
});

router.get('/conf/events', (req, res) => {
	Conference.findOne({'url': req.body.name}, (err, conf) => {
		if (err) throw err;
		if (conf) {
			res.json(conf.events);
		} else {
			res.json('');
		}
	});
});

router.post('/conf/schedule', (req, res, next) => {
	function checkIfDuplicate(username, event) {
		let isDupe = false;
		Event.findOne({'user': username, 'url': event.url}, (err, event) => {
			if (err) return next(err);
			if (event) isDupe = true;
		});
		return proceed(isDupe, event);
	}

	function proceed (isDup, event) {
		if (isDup) {
			return res.json({
				success: false,
				message: 'IS DUPLICATE'
			});
		} else {
			let newEvent = new Event(event);
			newEvent.save(function (err, event) {
				if (err) {
					return res.json({
						success: false,
						message: 'ERROR SAVING TO DATABASE'
					});
				} else {
					return res.json({
						success: false,
						message: 'IS DUPLICATE',
						ob: event
					});
				}
			});
		}
	}

	Conference.findOne({
		'url': req.body.name
	}, function (err, conf) {
		if (err) throw err;
		if (conf) {
			let plannedEvent = conf.plannedEvents.find((element) => {
				return element.url === req.body.session;
			});
			let startedEvent = conf.events.find((element) => {
				return element.url === req.body.session;
			});
			 console.log(plannedEvent);
			 console.log(startedEvent);
			if (plannedEvent && !startedEvent) {
				let newEvent = {
					url: plannedEvent.url,
					title: plannedEvent.title,
					speaker: plannedEvent.speaker,
					user: req.query.user,
					conf: req.body.session
				}

				conf.update({
					$pull: {
						plannedEvents: plannedEvent
					},
					$push: {
						events: newEvent
					}
				}, {
					upsert: true
				}, (err) => {
					if (err) return next(err);
				});

				checkIfDuplicate(req.query.user, newEvent);
			}
		}
	});
});

router.post('/conf/unschedule', (req, res) => {
	Conference.findOne({'url': req.body.name}, (err, conf) => {
		if (err) throw err;
		let plannedEvent = conf.plannedEvents.find((element) => {
			return element.slug === req.body.session;
		});

		let startedEvent = conf.events.find((element) => {
			return element.slug === req.body.session;
		});

		if (!plannedEvent && startedEvent) {
			res.json(startedEvent);
		} else {
			res.json('ACTIVE');
		}
	});
});

module.exports = router;