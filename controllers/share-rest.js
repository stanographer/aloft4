// Creates a REST endpoint to send raw doc contents via the /text route.

module.exports = ShareRest;

function ShareRest (app, db) {

	this.getPreview = function (user, url) {
		console.log(retrievePreview(user, url, function (err, text) {
					if (text.data.length >= 200) {
						prev = text.data.substring(0, 200);
					}
					console.log('PREEEEEV: ' + prev)
					return prev;
				}));

		// console.log('RETREV: ' + retrievePreview(user, url, handlePreview))
	}

	app.get('/text/:user/:event', function (req, res) {
		db.getSnapshot(req.params.user, req.params.event, null, null, function (err, snapshot) {
			if (err) {
				throw err;
			} else {
				send200(res, snapshot.data);
			}
		});
	});

	function retrievePreview (user, url, callback) {
		db.getSnapshot(user, url, null, null, function (err, text) {
			if (err) {
				throw err;
			} else {
				return callback(null, text);
			}
		});
	}

	// function handlePreview (err, text) {
	// 	var prev = text.data;

	// 	if (text.data.length >= 200) {
	// 		prev = text.data.substring(0, 200);
	// 	}
	// 	console.log('PREEEEEV: ' + prev)
	// 	return prev;
	// }

	// function retrievePreview (url, user, callback) {
	// 	let retrieve = new Promise(
	// 		function (resolve, reject) {
	// 			db.getSnapshot(user, url, null, null, function (err, text) {
	// 				if (err) {
	// 					throw err;
	// 				} else {
	// 					if (!text) {
	// 						reject('Error contacting ShareDB database.');
	// 					} else {
	// 						resolve('Success!');
	// 					}
	// 				}
	// 			});
	// 		}
	// 	);

	// 	let handlePreview = function () {
	// 		retrieve
	// 			.then(function (fulfilled) {
	// 				callback(true);

	// 			})
	// 			.catch(function (error) {
	// 				callback(false);

	// 			});
	// 	}

	// 	handlePreview();
	// }

	let send200 = function (res, message) {
		if (message == null) message = "Nothing here yet.\n";
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			res.end(message);
	};
}