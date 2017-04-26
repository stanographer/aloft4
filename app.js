// dependencies
var express = require('express')
	, path = require('path')
	, ShareDB = require('sharedb');

// variables
var app = express();
var port = 4000;

// server settings
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/static'));

// routes
app.get('/', function (req, res) {
	res.render('login');
});

// let's get it up!
app.listen(port, function () {
	console.log('Aloft 4 is running on ' + port);
});