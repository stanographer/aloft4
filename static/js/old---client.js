var sharedb = require('sharedb/lib/client');

// Open WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);
var captionArea = document.getElementById('caption-area');
var position;

// Create local Doc instance mapped to 'examples' collection document with id 'textarea'
var doc = connection.get('stanley', 'srccon');

doc.subscribe(function(err) {
  if (err) throw err;
  captionArea.innerHTML = doc.data;
  findCurrentPosition(doc);
  console.log(doc.data);
  console.log('length ' + doc.data.length);
});

doc.on('op', function (op, source) {
	console.log(JSON.stringify(op[0]) + ' ' + source);
	var opId = JSON.stringify(op[0].p).split('[')[1].split(']')[0];
	trackPosition(opId - 1);

	if (op[0].si && !op[0].si.match('[^\\S ]')) {
		// is text
		// console.log(op[0].si.match('[^\\S ]'));
		createNewParticle(op[0].si, opId, appendParticle);

		if (op[0].si === '\\t') {
			console.log('new para!');
		}
	}
	if (op[0].sd) {
		removeParticles(opId, op[0].sd.length);
	}
});

function findCurrentPosition (doc) {
	if (doc.length) {
		position = doc.length;
	} else {
		position = 0;
	}
}

function trackPosition (op) {
	if (op >= position) {
		position++;
	}

	return position;
}

function createNewParticle (text, id, callback) {
	var charArray = text.split('');
	var particle;

	for (var key in charArray) {
		var content;
		if (charArray[key] === ' ') {
			charArray[key] = ' ';
		}
		content = document.createTextNode(charArray[key]);
		particle = document.createElement('t');
		console.log('single item ' + charArray[key])
		particle.appendChild(content);
		particle.id = id;
		callback(particle);
	}
}

function appendParticle (particle) {
	if (particle.id <= position) {
		var spot = captionArea.childNodes[particle.id];
		return captionArea.insertBefore(particle, spot);
	} else {
		return captionArea.appendChild(particle);
	}
}

function del (index) {
	var particle = captionArea.childNodes[index];
		if (captionArea.childNodes[index].textContent === ' ') {
			captionArea.childNodes[index].nodeValue = '';
		}
    	return particle.remove();
}

function removeParticles (index, length) {
	del(index);
	if (length > 1) {
		for (var i = index; i <= index + length; i++){
			del(i);
			console.log('delete more than one at ' + index + ' !');
		}
	} else {
		console.log('delete one!');
		del(index);
	}
}