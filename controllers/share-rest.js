// Creates a REST endpoint to send raw doc contents via the /text route.

module.exports = function (app, db) {

	let send200 = function (res, message) {
		if (message == null) message = "OK\n";
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
			res.end(message);
	};

	app.get('/text/:user/:event', function (req, res) {
		db.getSnapshot(req.params.user, req.params.event, null, null, function (err, snapshot) {
			if (err) {
				throw err;
			} else {
				send200(res, snapshot.data);
			}
		});
	});
}