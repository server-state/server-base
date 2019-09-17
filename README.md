# server-base
[![Build Status](https://travis-ci.com/server-state/server-base.svg?branch=master)](https://travis-ci.com/server-state/server-base)
![GitHub](https://img.shields.io/github/license/server-state/server-base)
[![npm version](https://badge.fury.io/js/%40server-state%2Fserver-base.svg)](https://badge.fury.io/js/%40server-state%2Fserver-base)

Server-side (NodeJS based) implementation of the server-base architecture (no modules included).

It manages server modules and can get attached to an express app, where it creates routes under `/api/v1/`, as specified in https://github.com/server-state/specs/blob/master/api/routes.md.

### Example
```js
let app; // An express app

const ServerState = require('@server-state/server-base');

const server = new ServerState({
	logToConsole: true, // Log error messages to console, ...
	logToFile: false // ... but not to a file
});

// Add module under name 'raw'. Will add it to /api/v1/all and create /api/v1/raw
server.addModule('raw', require('@server-state/raw-module'), [
	'ls',
	'whoami'
]);

server.init(app); // Attach the server-state server to the express app

app.listen(8080); // "Start" the express app
```