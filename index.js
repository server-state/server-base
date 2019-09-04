const express = require('express');
const nodeModuleName = require('./src/module-name');
const defaultPort = 8080;

/**
 * @module '@server-state/server-base'
 */

/** 
 * @class ServerStateBase
* An instance of a HTTP/S server listening on a specified port with an API endopoint
*/
module.exports = class ServerStateBase {
	/**
	 * Create a new instance of `ServerStateBase` that will, upon calling `listen()`, listen on the specified `port` (default `8080`)
	 * 
	 * @param {number} [port=8080] The port on which the server will listen
	 */
	constructor(port = defaultPort) {
		this.port = port;
		this.modules = [];
		this.app = express();
	}

	/**
	 * Add module to server for json output.
	 * @param {string} name Module name (without prefixes)
	 */
	addModule(name) {
		try {
			require.resolve(nodeModuleName(name));
			this.modules.push(name);
		} catch (e) {
			console.warn(`Module not found: ${name}, Skipping...`);
		}
	}

	/**
	 * Begin listening on port specified in constructor
	 */
	start() {
		// Apply modules
		for (let module of this.modules) {
			this.app.get('/api/v1/' + module, (req, res) => {
				res.json(require(nodeModuleName(module))());
			});
		}

		// Pull requests from all modules and send them
		this.app.get('/api/v1/all', (req, res) => {
			let result = {};

			for (let module of this.modules) {
				result[module] = (require(nodeModuleName(module)))();
			}

			res.json(result);
		});

		// start web server
		this.app.listen(this.port);
	}
};
