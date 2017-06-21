const express = require('express');
const passport = require('passport');
const router = express.Router();
const LocalStrategy = require('passport-local').Strategy;

// routes
router.get('/', function (req, res) {
	res.render('login');
});

router.get('/editor', function (req, res) {
	var user = req.query.user;
	var event = req.query.event;
	res.render('editor', {
		user: user,
		event: event
	});
});

router.get('/login', function (req, res) {
	res.render('login');
})

router.get('/:user/:event', function (req, res) {
	var prefs = {
		fontSize: '35',
		fontFace: 'Inconsolata',
		lineHeight: '130'
	}
	res.render('watch', {
		user: req.params.user,
		event: req.params.event,
		prefs: prefs,
		marker: '≈'
	});
});

module.exports = router;