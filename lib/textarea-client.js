var sharedb = require('sharedb/lib/client');
var StringBinding = require('sharedb-string-binding');

// Open WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);
var doc;

assignEventInfo(user, event);

function assignEventInfo(user, event) {
	doc = connection.get(user, event);
	createDoc(subscribe);
}

// Create local Doc instance mapped to 'examples' collection document with id 'textarea'
function createDoc(callback) {
	doc.fetch(function(err) {
	    if (err) throw err;
	    if (doc.type === null) {
	      	doc.create('', callback);
	      	return;
	    }
	    callback();
	});
}

function subscribe() {
	doc.subscribe(function(err) {
		if (err) throw err;
		var element = document.querySelector('textarea');
		var binding = new StringBinding(element, doc);
		binding.setup();
	});
	doc.on('op', function(data) {
		console.log('got data! ' + data);
	});
}