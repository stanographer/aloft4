const async = require('async')
	, crypto = require('crypto')
	, dateformat = require('dateformat')
	, nodemailer = require('nodemailer')
	, mailerConfig = require('../config/mailer.js')
	, multer = require('multer')
	, send = require('../controllers/send')
	, ShareRest = require('../controllers/share-rest')
	, User = require('../models/user')
	, upload = multer({
		dest: 'uploads'
	})
	, Event = require('../models/event')
	, Conference = require('../models/conference');

const storage = multer.diskStorage({
	destination: '../static/uploads',
	filename: function (req, file, callback) {
		crypto.pseudoRandomBytes(16, function(err, raw) {
			if (err) return callback(err);
			callback(null, raw.toString('hex') + path.extname(file.originalname));
		})
	}
});

module.exports = function(app, passport, db) {

	const Rest = new ShareRest(app, db);

	// Related to the main routes in Aloft.

	app.get('/', function (req, res) {
		if (req.user) {
			res.redirect('/dashboard');
		} else {
			res.render('login');
		}
	});

	app.get('/admin-only', isLoggedIn, function (req, res) {
		res.render('admin-only', {
			user: req.user.local
		});
	});

	app.get('/login', function (req, res) {
		res.render('login', {
			message: req.flash('loginMessage')
		});
	});

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('login');
	});

	app.get('/signup', function (req, res) {
		res.render('signup', {
			token: req.query.token,
			message: req.flash('signupMessage')
		});
	});

	app.get('/dashboard', isLoggedIn, function (req, res) {
		let perPage = 9
			, page = req.query.page > 0 ? req.query.page : 0
		let maxBreadcrumbs = 6;

		res.locals.createPagination = function (pages, page) {
						var url = require('url')
							, qs = require('querystring')
							, params = qs.parse(url.parse(req.url).query)
							, str = ''

						params.page = 0
						var clas = page == 0 ? "active" : "no"
						console.log('str one: ' + str);
						str += '<div class="btn-group" role="group" aria-label="...">'
						str += '<a class="btn btn-default ' + clas + '" href="?'+qs.stringify(params)+'#repo">First</a>'
						console.log('str 1.5: ' + str);
						for (var p = 1; p < pages; p++) {
							params.page = p
							clas = page == p ? "active" : "no"
							str += '<a class="btn btn-default ' + clas + '" href="?'+qs.stringify(params)+'#repo">'+ p +'</a>'
							console.log('str two: ' + str);
						}
						params.page = --p
						clas = page == params.page ? "active" : "no"
						str += '<a class="btn btn-default ' + clas + '" href="?'+qs.stringify(params)+'#repo">Last</a></div>'
						console.log('str three: ' + str);

						return str
					}
		async.waterfall([function (done) {
			Event.find({user: req.user.local.username})
				.select(['url', 'user', 'title', 'created', '_id'])
				.limit(perPage)
				.skip(perPage * page)
				.sort({created: -1})
				.exec(function (err, events) {
					Event.count().exec(function (err, count) {
						let data = {
							events: events,
							page: page,
							count: count,
							perPage: perPage,
							users: ''
						}
						done(err, data);
					});
				});
		},
		function (data, done) {
			User.find({}, function (err, users) {
				if (err) {
					throw err;
				} else {
					done(err, data, users);
				}
			})
		},
		function (data, users, done) {
			Conference.find({}, function (err, conferences) {
				if (err) {
					throw err;
				} else {
					if (conferences && conferences.length > 0) {
						let matched_conferences = [];
						for (var c in conferences) {
							// Matches conferences the user created themselves.
							if (conferences[c].user == req.user.local.username) {
								matched_conferences.push(conferences[c]);
							}
							// Matches conferences where user is authorized.
							if (conferences[c].users.indexOf(req.user.local.username)) {
								matched_conferences.push(conferences[c]);
							}
						}
						done(err, data, users, matched_conferences);
					} else {
						done(err, data, users, null);
					}
				}
			})
		},
		function (data, users, conferences, done) {
			res.render('dashboard', {
				user: req.user.local,
				conference: req.user.conference,
				error_message: req.flash('error_message'),
				success_message: req.flash('success_message'),
				events: data.events,
				conferences: conferences,
				page: data.page,
				pages: data.count / data.perPage,
				users: users
			});
		}],
		function (err, result) {
			if (err) {
				throw err;
			} else {
				console.log(result);
			}
		});
	});

	// Related to user and job states.

	app.get('/toggleComplete/:id', function(req, res) {
		var query = req.query.var;

		Event.findById(req.params.id, function(err, event) {
			if (err) {
				res.send(err);
			} else {
				if (query && query.length != 0) {
					res.send(event + ' ' + query);
				} else {
					res.send(event);
				}
			}
		});
	});

	app.post('/toggleComplete/:id', function(req, res) {
		Event.findById(req.params.id, function (err, event) {
			if (err) {
				throw err;
			} else {
				if (event.completed === false) {
					event.update({$set: {'completed': true}}, {upsert: true},
						function(err, updated) {
							if (err) {
								return err;
							} else {
								req.flash('success_message', 'Successfully changed event status to completed.');
								res.send('is false ' + event);
							}
		 	  		});
		 	  	} else {
		 	  		event.update({$set: {'completed': false}}, {upsert: true},
						function(err, updated) {
							if (err) {
								return err;
							} else {
								req.flash('success_message', 'Successfully changed event status to completed.');
								res.send('is true ' + event);
							}
		 	  		});
		 	  	}
		 	}
		 });
	});

	app.get('/first-user', function (req, res) {
		res.render('first-user');
	});

	app.get('/invite-member', function (req, res) {
		if (req.user.local.role === 'admin') {
			res.render('invite-user');
		} else {
			res.redirect('admin-only');
		}
	});

	app.get('/soundbar/:user/:event', function(req, res) {
		 Event.findOne({'user': req.params.user, 'event': req.params.event}, function(err, event) {
		 	if(err) {
		 		throw err
		 	} else {
		 		res.render('watch-soundbar', {
		 			user: req.params.user,
					event: req.params.event,
					marker: '≈'
		 		});
		 	}
		 });
	});

	app.get('/spectrogram/:user/:event', function(req, res) {
		 Event.findOne({'user': req.params.user, 'event': req.params.event}, function(err, event) {
		 	if(err) {
		 		throw err
		 	} else {
		 		res.render('watch-spectrogram', {
		 			user: req.params.user,
					event: req.params.event,
					marker: '≈'
		 		});
		 	}
		 });
	});

	app.get('/getJobs/:user', isLoggedIn, function (req, res) {
		let perPage = parseInt(req.query.perPage);
		let page = req.query.page > 0 ? req.query.page - 1 : 0
		let maxBreadcrumbs = 6;

		Event.find({user: req.params.user})
				.select(['url', 'user', 'title', 'created', '_id', 'hidden', 'completed', 'speaker', 'viewCount'])
				.limit(perPage)
				.skip(perPage * page)
				.sort({created: -1})
				.exec(function (err, events) {
					let i = 0;
					async.parallel([function (callback) {
						async.forEachLimit(events, 3, function (e, next) {
							e.position = i;

							let date = new Date(e.created);

							db.getSnapshot(e.user, e.url, null, null, function (err, snapshot) {
								let snap = snapshot.data;

								if (!err) {

									if (snap && snap.length >= 200) {
										snap = snapshot.data.substring(0, 200);
										snap += '...';
									}
									if (!snap || snap.length < 1) {
										snap = 'Preview for this event not available.'
									}

									e.snapshot = snap;
									e.formattedDate = dateformat(date, 'yyyy-m-d (H:MM)').toString();

									i++;
									next();

								} else {
									snap = 'Preview for this event not available.';
									i++;
									next();
								}
							});

						}, function (err) {
							if (!err) {
								callback();
							} else {
								throw err;
							}
						});
					}], function () {
						Event.count().exec(function (err, count) {
							let data = {
								events: events,
								page: page,
								perPage: perPage,
								total: count
							}
							res.json(data);
						});
					})
					
				});
	});

	app.get('/:user/:event', function (req, res, next) {
		Event.findOne({'user': req.params.user, 'url': req.params.event}, function (err, event) {
			if (err) {
				throw err;
			} else {
				if (event) {
					let prefs = {
						fontSize: '35',
						fontFace: 'Inconsolata',
						lineHeight: '130'
				}
				if (event.completed) res.redirect('/text/' + req.params.user + '/' + req.params.event);
					res.render('watch', {
						user: req.params.user,
						event: req.params.event,
						prefs: prefs,
						marker: '≈'
					});
				}
			}
		});
	});

	app.post('/invite-member', function (req, res) {
		async.waterfall([function (done) {
			crypto.randomBytes(10, function (err, buf) {
				let token = buf.toString('hex');
				done(err, token);
			});
		},
		function (token, done) {
			let cleanEmail = req.body.newmemberemail.trim().toLowerCase();
			console.log(`entered function, got email! ${cleanEmail}`)
			User.findOne({'local.email': cleanEmail}, function (err, user) {
				if (err) {
					throw err;
				} else {
					if (user) {
						req.flash('adminMessage', 'That email is already registered.');
						res.redirect('/dashboard#login');
					} else {
						let newUser = new User;
						newUser.inviteToken = token;
						newUser.trialPeriod = req.body.trialPeriod;
						newUser.local.email = req.body.cleanEmail;
						console.log(`we have a new user! ${newUser}`)
						newUser.save(function (err) {
							if (err) throw err;
							done(err, token, user);
						});
					}
				}
			});
		},
		function (token, user, done) {
			var transport = nodemailer.createTransport(mailerConfig);
			var mailOptions = {
				to: req.body.newmemberemail,
				from: 'Aloft Support',
				subject: 'Your Aloft Invite Token',
				text: 'Hi there! \n\n' +
				'You\'ve been invited to sign up for Aloft, the super awesome text delivery/captioning system for realtime stenographers! Below you will find the sign-up token use to create your account. Click the link provided to start the registration process. If the link is not clickable, paste the address into your browser or go to aloft.nu/signup and paste the code into the field labeled "token."\n\n' +
				'Your sign-up token: ' + token + '\n' +
				'Your registration link: aloft.nu/signup?token=' + token + '.\n\n' +
				'Please note that your code is only valid for 72 hours (three days). If you do not create your account within that time, you will have to request another token.\n' +
				'Thank you and enjoy using Aloft!\n\n\n' +
				'-Aloft Support'
			};
			transport.sendMail(mailOptions, function (err, info) {
				if (err) {
					req.flash('error_message', 'There was an error sending the email!');
					done(err, 'done');
				} else {
					req.flash('info', 'A sign-up token has been sent to ' + req.body.newmemberemail + '!');
					done(err, 'done');
				}
			});
		}], function (err) {
			if (err) {
				req.flash('error_message', 'The email could not be sent. Please try again.');
				res.redirect('/');
			} else {
				req.flash('success_message', 'An email with the link to this event has been sent successfully to ' + req.body.newmemberemail + '.');
				res.redirect('/dashboard');
			}
		});
	});

	app.post('/login', passport.authenticate('login', {
		successReturnToOrRedirect: '/dashboard',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.post('/signup', passport.authenticate('signup', {
		successRedirect: '/dashboard',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.post('/send', isLoggedIn, function (req, res) {
		let mailer = send(req.body.transcript_recipient, req.user, req.body.active_event_title, req.body.active_event_url, req.body.transcript_send_subject, req.body.transcript_send_message, req.protocol + '://' + req.get('Host'));
		if (mailer.send === true) {
			req.flash('success_message', 'Email was sent successfully!');
			res.redirect('/dashboard#repo');
		} else {
			// req.flash('error_message', 'Email failed to send!');
			// res.redirect('/dashboard#repo-tab');
			req.flash('success_message', 'Email was sent successfully!');
			res.redirect('/dashboard#repo');
		}
	});

	app.post('/', isLoggedIn, upload.single('avatar-picture'), (req, res) => {

	});

	app.patch('/:user', function (req, res) {
		let parameters = req.query;
		let username = req.params.user;

		User.findOne({'local.username': username}, function (err, user) {
			 if (err) {
			 	throw err;
			 } else {
			 	user.update(parameters, function (err, updatedUser) {
			 		if (err) {
			 			console.log('There was an error updating.');
			 		} else {
			 			
			 		}
			 	});
			 }
		});
	});

	app.get('/:user', function (req, res) {
		User.findOne({'local.username': req.params.user}, function (err, user) {
			if (err) {
				throw err;
			} else {
				if (user) {
					Event.find({user: req.params.user}, function (err, events) {
						if (err) {
							throw err;
						} else {
							res.render('listing', {
								user: user.local.username,
								firstname: user.local.firstname,
								lastname: user.local.lastname,
								events: events
							});
						}
					});
				}
			}
		})
	});

	// 404 and misc.

	app.use(function (req, res, next) {
		req.flash('404', 'Sorry. We couldn\'t find what you were looking for.');
		res.render('error', { message: req.flash('404')});
		res.end();
	});

	function isLoggedIn(req, res, next) {
			if(req.isAuthenticated()) {
				return next();
	  		}
	  		req.flash('loginMessage', 'You must be logged in to do that!');
	  		return res.redirect(307, '/login');
		}
}