'use strict';

var sharedb = require('sharedb/lib/client');
var ReconnectingWebSocket = require('reconnecting-websocket/dist/index');

startShareDb();

function startShareDb () {
	var socket = new ReconnectingWebSocket('ws://' + window.location.host, null, {
		timeoutInterval: 2000,
		reconnectInterval: 900,
		automaticOpen: true,
		connectionTimeout: 4000,
		maxRetries: Infinity
	});
	var connection = new sharedb.Connection(socket);
	var doc = connection.get(user, event);
	var captionArea = document.getElementById('caption-area');

	socket.onopen = function () {
		console.log('connected!')
		StatusBar.connected();
		doc.subscribe(function(err) {
			if (err) throw err;
			update();
		});
	}

	socket.onclose = function () {
		console.log('disconnected!')
		StatusBar.disconnected();
	}

	socket.onerror = function () {
		console.log('error!')
		StatusBar.disconnected();
	}

	doc.subscribe(function(err) {
		if (err) throw err;
		update();
	});

	doc.on('error', function (data) {
		StatusBar.disconnected();
	});

	doc.on('op', function (op, source) {
		update();
	});

	// Returns a mark character if there is one.
	var invisibleChar = function (c) {
		if (c) {
			return c;
		} else {
			return '';
		}
	}

	// Converts the next text to html formatting and appends to the dom.
	var update = function () {
		var text = textToHtml(doc.data);
			captionArea.innerHTML = text;
	}

	// Filters the text for formatting.
	var textToHtml = function (text) {
		if (text) {
			return text
					// Add intentation
					.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
					// Add line breaks
					.replace(/\r\n|\n|\r/g, '<br />')
					// Remove the invisible marker
					.replace(RegExp(invisibleChar(marker), 'g'), '')
				} else {
					return '';
		}
	}

	// Connection status bar turns green when connected, red when disconnected.
	var StatusBar = (function () {
			var bar = $('.status-bar');
			return {
				connected: function () {
					bar.addClass('connected');
					bar.removeClass('disconnected');
				},
				disconnected: function () {
					bar.addClass('disconnected');
					bar.removeClass('connected');
				}
			}
		})();
}