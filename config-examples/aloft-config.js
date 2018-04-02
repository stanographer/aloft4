module.exports = {
	// Enter a random string here to create a session key.
	'session': '',

	// Leave this other stuff alone below.
	'mongo': 'mongodb://127.0.0.1:27017/aloft',
	'users': 'mongodb://127.0.0.1:27017/users',
	'port': process.env.PORT || 4000
}