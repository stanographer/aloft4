'use strict';

// Dependencies
var express = require('express')
	, path = require('path')
	, http = require('http');

// ShareDB
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');
var types = require("sharedb/lib/types");

var backend = new ShareDB();

startServer();

function startServer() {
 	// Create a web server to serve files and listen to WebSocket connections
 	var app = express();
	var port = 4000;
	var server = http.createServer(app);
	var connection = backend.connect();

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
 	app.use(express.static(__dirname + '/static'));
 	app.use('/node', express.static(__dirname + '/node_modules'));

 	// Connect any incoming WebSocket connection to ShareDB
 	var wss = new WebSocket.Server({server: server});
 	wss.on('connection', function(ws, req) {
		var stream = new WebSocketJSONStream(ws);
   		backend.listen(stream);
 	});

 	server.listen(port, function () {
		console.log('Aloft 4 is running on ' + port);
	});

	// routes
	app.get('/', function (req, res) {
		res.render('login');
	});

	app.get('/editor', function (req, res) {
		var user = req.query.user;
		var event = req.query.event;
		res.render('editor', {
			user: user,
			event: event
		});
	});

	app.get('/:user/:event', function (req, res) {
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
}