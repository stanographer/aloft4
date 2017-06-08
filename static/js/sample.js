  sharedb_doc.subscribe(function(err) {
        if (err) {
            console.log(err); // handle the error
        }
        
        if (!sharedb_doc.data) { // does not exist so we create the document and replace the code editor content by the document content
            sharedb_doc.create(code_editor.getValue());
        } else { // it exist, we set the code editor content to the latest document snapshot
            code_editor.setValue(sharedb_doc.data);
        }

        // we listen to the "op" event which will fire when a change in content (an operation) is applied to the document, "source" argument determinate the origin which can be local or remote (false)
        sharedb_doc.on('op', function(op, source) {
            var i = 0, j = 0,
                from,
                to,
                operation,
                o;
            
            if (source === false) { // we integrate the operation if it come from the server
                for (i = 0; i < op.length; i += 1) {
                    operation = op[i];
                    
                    for (j = 0; j < operation.o.length; j += 1) {
                        o = operation.o[j];
                        
                        if (o["d"]) { // delete operation
                            from = code_editor.posFromIndex(o.p);
                            to = code_editor.posFromIndex(o.p + o.d.length);
                            code_editor.replaceRange("", from, to, "remote");
                        } else if (o["i"]) { // insert operation
                            from = code_editor.posFromIndex(o.p);
                            code_editor.replaceRange(o.i, from, from, "remote");
                        } else {
                            console.log("Unknown type of operation.")
                        }
                    }
                }
            }
        });
        
        sharedb_doc_ready = true; // this is mandatory but we will use this to determine if the document is ready in the "change" event of CodeMirror
    });


  ------------------


    CodeMirror.on(code_editor, 'changes', function (instance, changes) {
        var op,
            change,
            start_pos,
            chars,

            i = 0, j = 0;

        if (!sharedb_doc_ready) { // if the document is not ready, we just ignore all changes, a much better way to handle this would be to call the function again with the same changes at regular intervals until the document is ready (or just cancel everything if the document will never be ready due to errors or something else)
            return;
        }

        op = {
            p: [],
            t: "text0",
            o: []
        };

        for (i = 0; i < changes.length; i += 1) {
            change = changes[i];
            start_pos = 0;
            j = 0;

            if (change.origin === "remote") { // do not submit back things pushed by remotes... ignore all "remote" origins
                continue;
            }

            while (j < change.from.line) {
                start_pos += code_editor.lineInfo(j).text.length + 1;
                j += 1;
            }

            start_pos += change.from.ch;

            if (change.to.line != change.from.line || change.to.ch != change.from.ch) {
                chars = "";

                for (j = 0; j < change.removed.length; j += 1) { chars += change.removed[j]; if (j !== (change.removed.length - 1)) { chars += "\n"; } } op.o.push({ p: start_pos, d: chars }); } if (change.text) { op.o.push({ p: start_pos, i: change.text.join('\n') }); } } if (op.o.length > 0) {
            sharedb_doc.submitOp(op);
        }
    });


  ------------------



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
	trackPosition(opId);

	if (op[0].si && !op[0].si.match('[^\\S ]')) {
		// is text
		console.log(op[0].si.match('[^\\S ]'));
		appendParticle(op[0].si);

		if (op[0].si === '\\t') {
			console.log('new para!');
		}
	} else if (op[0].sd) {
		// delete command
		if (op[0].sd.length > 1) {
			var delLoop = opId;
			for (i = 0; i < op[0].sd.length; i++) {
				console.log('delloop ' + delLoop);
				console.log('length ' + op[0].sd.length)
				removeParticle(delLoop);
				delLoop++;
			}
		} else {
			console.log('outhere!')
			removeParticle(opId);

		}
	}
});

function findCurrentPosition (doc) {
	if (doc.length) {
		position = doc.length;
	} else {
		position = 0;
	}
}

function trackPosition (opId) {
	console.log('opid ' + opId);
	if (opId > position) {
		position = opId;
	}
	console.log('position: ' + position);
}

// function createNewParticle (text, id, callback) {
// 	if (text === ' ') {
// 		text = ' ';
// 	}
// 	var content = document.createTextNode(text);
// 	var particle = document.createElement('t');
// 	particle.appendChild(content);
// 	particle.id = id;
// 	return callback(particle);
// }

function appendParticle (particle) {
	console.log('FOSITION ' + position);
	if (captionArea.text().length() <= position) {
		var spot = document.getElementById(particle.id);
		captionArea.insertBefore(particle, spot);
		console.log(particle.id < position)
	} else {
		captionArea.appendChild(particle);
		console.log(particle.id < position)
	}
}

function removeParticle (id) {
	var dummy = document.createElement('t');
	dummy.id = id;
    var elem = document.getElementById(id);
    return elem.parentNode.replaceChild(dummy, elem);
}