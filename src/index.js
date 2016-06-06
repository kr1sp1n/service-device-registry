const http = require('http');
const config = require('./config')();
const app = require('./app');

http.createServer(app(config)).listen(config.port);
