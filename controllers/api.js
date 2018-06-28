const express = require('express')
	, config = require('../config/aloft-config')
	, Conference = require('../models/conference')
	, User = require('../models/user')
	, Event = require('../models/event');

const router = express.Router();

// function schedule(conf, plannedEvent) {
// 	plannedEvent.user = req.user.local.username;

// 	conf.update({
// 		$push: {
// 			events: plannedEvent
// 		},
// 		$pull: {
// 			plannedEvents: plannedEvent
// 		}
// 	}, {
// 		upsert: true
// 	}, (err) => {
// 		if (err) throw err;
// 		let event = new Event({
// 			title: plannedEvent.title,
// 			speaker: plannedEvent.speaker,
// 			url: plannedEvent.slug,
// 			conf: confUrl
// 		});
// 		// Give it a title if none.
// 		if (!event.title) {
// 			event.title = event.url;
// 		}
// 		checkForDuplicateEvent(event);
// 	});
// }

router.get('/conf', (req, res) => {
	Conference.findOne({'url': req.query.name}, (err, conf) => {
		if (err) throw err;
		if (conf) {
			res.json(conf);
		} else {
			res.json('');
		}
	});
});

router.get('/conf/plannedEvents', (req, res, next) => {
	Conference.findOne({url: req.query.name}, (err, conf) => {
		if (err) return next(err);
		console.log(conf);
		if (conf && conf.plannedEvents) return res.json(conf.plannedEvents);
		return next();
	});
});

router.get('/conf/events', (req, res) => {
	Conference.findOne({'url': req.query.name}, (err, conf) => {
		if (err) throw err;
		if (conf) {
			res.json(conf.events);
		} else {
			res.json('');
		}
	});
});

router.post('/conf/schedule', (req, res) => {
	Conference.findOne({'url': req.query.name}, (err, conf) => {
		if (err) throw err;
		let plannedEvent = conf.plannedEvents.find((element) => {
			return element.slug === req.query.session;
		});

		let startedEvent = conf.events.find((element) => {
			return element.slug ===  req.query.session;
		});

		if (plannedEvent && !startedEvent) {
			res.json(plannedEvent);
		} else {
			res.json('');
		}
	});
});

router.post('/conf/unschedule', (req, res) => {
	Conference.findOne({'url': req.query.name}, (err, conf) => {
		if (err) throw err;
		let plannedEvent = conf.plannedEvents.find((element) => {
			return element.slug === req.query.session;
		});

		let startedEvent = conf.events.find((element) => {
			return element.slug ===  req.query.session;
		});

		if (!plannedEvent && startedEvent) {
			res.json(plannedEvent);
		} else {
			res.json('');
		}
	});
});

module.exports = router;