var sharedb = require('sharedb/lib/client');

// Open WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);
var captionArea = document.getElementById('caption-area');

// Create local Doc instance mapped to 'examples' collection document with id 'textarea'
var doc = connection.get(user, event);

doc.subscribe(function(err) {
	if (err) throw err;
	update();
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
		return text.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
				.replace(/\r\n|\n|\r/g, '<br />')
				.replace(RegExp(invisibleChar(marker), 'g'), '')
			} else {
				return '';
	}
}