const express = require('express')
	, config = require('../config/aloft-config')
	, Conference = require('../models/conference')
	, User = require('../models/user')
	, Event = require('../models/event');

const router = express.Router();

router.get('/conf', (req, res) => {
	Conference.findOne({'url': req.query.name}, (err, conf) => {
		if (err) throw err;
		if (conf) res.json(conf);
	});
});

router.get('/conf/plannedEvents', (req, res) => {
	Conference.findOne({'url': req.query.name}, (err, conf) => {
		if (err) throw err;
		if (conf) res.json(conf.plannedEvents);
	});
});

router.get('/conf/events', (req, res) => {
	Conference.findOne({'url': req.query.name}, (err, conf) => {
		if (err) throw err;
		if (conf) res.json(conf.events);
	});
});

module.exports = router;