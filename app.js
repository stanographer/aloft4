const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const server = require('./server');

if (cluster.isMaster) {
	masterProcess();
} else {
	childProcess();
}

function masterProcess() {
	console.log(`Master ${process.pid} is running with ${numCPUs} cpus.`);

	for (let i = 0; i < numCPUs; i++) {
		console.log(`Forking process number ${i}...`);
		cluster.fork();
	}
}

function childProcess() {
	server.run();
	console.log(`Worker ${process.pid} started and finished`);
}