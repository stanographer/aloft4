var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function (passport) {

	// Required methods for Passport.
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

	passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

passport.use('signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        firstnameField: 'firstname',
        lastnameField: 'lastname',
        emailField: 'email',
        passReqToCallback : true
    },

    function (req, username, password, done) {
    	var email = req.body.email.trim().toLowerCase()
			, firstname = req.body.firstname
			, lastname = req.body.lastname;

		process.nextTick(function () {
			User.findOne({'local.email':  email}, function (err, user) {
				if (err)
					return done(err);
				if (user) {
					return done(null, false, req.flash('signupMessage', 'Sorry. That email is already taken.'));
				} else {
					User.findOne({'local.username': username.trim().toLowerCase()}, function (err, user) {
						if (err)
							return done(err);
						if (user) {
							return done(null, false, req.flash('signupMessage', 'Sorry. That username is already taken.'));
						} else {
							var newUser = new User();
							newUser.local.username = username.trim().toLowerCase();
							newUser.local.password = newUser.generateHash(password);
							newUser.local.firstname = firstname.trim();
							newUser.local.lastname = lastname.trim();
							newUser.local.email = email.trim().toLowerCase();

							newUser.save(function(err) {
								if (err)
									throw err;
								return done(null, newUser);
							});
						}
					});
				}
			});    
		});
	}));

	passport.use('login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
	},

    function(req, username, password, done) {
        User.findOne({'local.username':  username}, function (err, user) {
			if (err)
				return done(err);

			if (!user)
				return done(null, false, req.flash('loginMessage', 'No user found.')); 

			if (!user.validPassword(password))
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

			return done(null, user);
		});
	}));
}