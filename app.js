'use strict';

// Dependencies
const express = require('express')
	, path = require('path')
	, http = require('http');

// ShareDB
const ShareDB = require('sharedb');
const sharedbmongo = require('sharedb-mongo');
const richText = require('rich-text');
const WebSocket = require('ws');
const WebSocketJSONStream = require('websocket-json-stream');
const types = require('sharedb/lib/types');

// Modules

var routes = require('./controllers/routes');

startServer();

function startServer() {
 	// Create a web server to serve files and listen to WebSocket connections
 	const app = express();
	const port = 4000;
	const server = http.createServer(app);
	const backend = new ShareDB({db: sharedbmongo('mongodb://localhost:27017/aloft')});
	const connection = backend.connect();

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
 	app.use(express.static(__dirname + '/static'));
 	app.use('/node', express.static(__dirname + '/node_modules'));
 	app.use('/', routes);

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