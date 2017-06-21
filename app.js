'use strict';

// Dependencies
const cookieParser = require('cookie-parser')
	, bodyParser   = require('body-parser')
	, express = require('express')
	, flash = require('connect-flash')
	, passport = require('passport')
	, mongoose = require('mongoose')
	, path = require('path')
	, session = require('express-session')
	, http = require('http')
	, morgan = require('morgan');

// ShareDB
const richText = require('rich-text')
	, ShareDB = require('sharedb')
	, sharedbmongo = require('sharedb-mongo')
	, types = require('sharedb/lib/types')
	, WebSocket = require('ws')
	, WebSocketJSONStream = require('websocket-json-stream');

// Modules
// const routes = require('./controllers/routes')
const secrets = require('./config/aloftsecrets');

startServer();

function startServer() {
 	// Create a web server to serve files and listen to WebSocket connections
 	const app = express();
	const port = process.env.PORT || 4000;
	const server = http.createServer(app);
	const backend = new ShareDB({db: sharedbmongo(secrets.mongo)});
	const connection = backend.connect();

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	// app.use(morgan('dev'));
	app.use(session({
		name: 'aloft-session',
		proxy: true,
		resave: true,
		saveUninitialized: true,
		secret: secrets.session
	}));
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
 	app.use(express.static(__dirname + '/static'));
 	app.use('/node', express.static(__dirname + '/node_modules'));
 	app.use(passport.initialize());
 	app.use(passport.session());
 	app.use(flash());

 	// Passport
 	require('./controllers/routes')(app, passport);

 	// Connect any incoming WebSocket connection to ShareDB
 	var wss = new WebSocket.Server({server: server});
 	wss.on('connection', function(ws, req) {
		var stream = new WebSocketJSONStream(ws);
   		backend.listen(stream);
   		console.log('Someone connected!');
 	});

 	wss.on('disconnect', function() {
        console.log('disconnected');
    });

 	// wss.disconnect = function (err) {
 	// 	console.log('there was an error.')
 	// }

 	server.listen(port, function () {
		console.log('Aloft 4 is running on ' + port);
	});
}