/**
 * @module '@server-state/server-base'
 */

/**
 * @class ServerStateBase
 * A helper to add a server state API to an existing Express server
 */
module.exports = class ServerStateBase {
	/**
     * Create a new instance of `ServerStateBase` that will, upon calling `init(app)`, add the relevant API endpoints to the express app
     */
	constructor() {
		this.modules = {};
		this.args = {};
	}

	/**
     * Add module to server for json output.
     * @param {string} name Module name (without prefixes)
     * @param {function} fn
     * @param {*} [options=undefined]
     */
	addModule(name, fn, options) {
		if (this.modules[name])
			console.error(`Module already used: ${name}. Skipping`);
		else {
			this.modules[name] = fn;
			this.args[name] = options;
		}
	}

	/**
     * Append to Express app on /api/
     * @param {Express} app
     */
	init(app) {
		// Apply modules
		for (let module in this.modules) {
			if (Object.prototype.hasOwnProperty.call(this.modules, module))
				app.get('/api/v1/' + module, async (req, res) => {
					return res.json(await this.modules[module](this.args[module]));
				});
		}

		// Pull requests from all modules and send them
		app.get('/api/v1/all', async (req, res) => {
			let result = {};

			for (let module in this.modules) {
				if (Object.prototype.hasOwnProperty.call(this.modules, module))
					result[module] = await this.modules[module](this.args[module]);
			}

			return res.json(result);
		});
	}
};
