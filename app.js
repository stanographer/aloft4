 'use strict';

// Dependencies
const async = require('async')
	, cookieParser = require('cookie-parser')
	, bodyParser   = require('body-parser')
	, express = require('express')
	, flash = require('connect-flash')
	, jwt = require('jsonwebtoken')
	, passport = require('passport')
	, methodOverride = require('method-override')
	, mongoose = require('mongoose')
	, nodemailer = require('nodemailer')
	, path = require('path')
	, session = require('express-session')
	, http = require('http')
	, morgan = require('morgan')
	, wcs = require('wildcard-subdomains');

// ShareDB
const otText = require('ot-text')
	, richText = require('rich-text')
	, ShareDB = require('sharedb')
	, sharedbmongo = require('sharedb-mongo')
	, shareRest = require('./controllers/share-rest')
	, types = require('sharedb/lib/types')
	, WebSocket = require('ws')
	, WebSocketJSONStream = require('websocket-json-stream');

// Modules
// const routes = require('./controllers/routes')
const config = require('./config/aloft-config');

startServer();

function startServer() {
 	// Create a web server to serve files and listen to WebSocket connections
 	const app = express();
	const port = config.port;
	const server = http.createServer(app);
	const db = sharedbmongo(config.mongo);
	const backend = new ShareDB({db: db});
	const connection = backend.connect();

	// Mongoose
 	mongoose.connect(config.users);
 	mongoose.Promise = global.Promise;
 	var udb = mongoose.connection;
 	udb.on('error', function () {
  		console.log('Database error.');
	});

	udb.once('open', function () {
 		server.listen(3030, function () {
    		console.log('Users server UP & running on port 3030.');
  		});
	});

 	// Passport
 	require('./config/passport')(passport);

 	// Extra routes
 	let editorController = require('./controllers/editor');
 	let conferencesController = require('./controllers/conferences');

 	// Logger
	// app.use(morgan('dev'));

	app.use(cookieParser());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.use(wcs({
		namespace: '_sub',
		whitelist: ['www', 'app']
	}));
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/views');
 	app.use(express.static(__dirname + '/static'));
 	app.use('/node', express.static(__dirname + '/node_modules'));

	app.use(session({
		resave: true,
		saveUninitialized: false,
		secret: config.session,
		cookie: {
			maxAge: 24*60*60*1000,
			secure: false
		}
	}));
	
	app.use(methodOverride('_method'));
 	app.use(passport.initialize());
 	app.use(passport.session());
 	app.use(flash());
 	app.use('/editor', editorController);
 	app.use('/conferences', conferencesController);
 	app.use(function (req, res, next) {
	  console.log("======== REQ START =========");
	  console.log("REQ DOT BODY\n", JSON.stringify(req.body));
	  console.log("REQ DOT PARAMS\n", JSON.stringify(req.params));
	  console.log("REQ DOT SESSION\n", JSON.stringify(req.session));
	  console.log("REQ DOT USER\n", JSON.stringify(req.user));
	  console.log("======== REQ END =========");
	  next();
	});

 	// Routes
 	require('./controllers/routes')(app, passport, db);
 	// require('./controllers/editor')(connection);

 	ShareDB.types.register(otText.type);

 	// REST endpoint for transcript data via /text route
 	shareRest(app, db);

 	// Connect any incoming WebSocket connection to ShareDB
 	var wss = new WebSocket.Server({server: server});
 	wss.on('connection', function (ws, req) {
		var stream = new WebSocketJSONStream(ws);
   		backend.listen(stream);
   		console.log('Someone connected!');

   		ws.on('message', function incoming (op) {
 			console.log('op', JSON.stringify(JSON.parse(op), null, 2));
 		});
  	});

 	wss.on('close', function() {
        console.log('disconnected');
    });

 	server.listen(port, function () {
		console.log('Aloft 4 is running on ' + port);
	});
}