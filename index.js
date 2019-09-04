const express = require('express');
const nodeModuleName = require('./src/module-name');
const defaultPort = 8080;

module.exports = class ServerStateBase {
	constructor(port = defaultPort) {
		this.port = port;
		this.modules = [];
		this.app = express();
	}

	addModule(name) {
		try {
			require.resolve(nodeModuleName(name));
			this.modules.push(name);
		} catch (e) {
			console.warn(`Module not found: ${name}, Skipping...`);
		}
	}

	start() {
		// Apply modules
		for (let module of this.modules) {
			this.app.get('/api/v1/' + module, (req, res) => {
				res.json(require(nodeModuleName(module))());
			});
		}

		this.app.get('/api/v1/all', (req, res) => {
			let result = {};

			for (let module of this.modules) {
				result[module] = (require(nodeModuleName(module)))();
			}

			res.json(result);
		});
		this.app.listen(this.port);
	}
};
