const logger = require('./lib/logger');

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
            logger.warn(`Module already used: ${name}. Skipping`);
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
                    try {
                        const result = await this.modules[module](this.args[module]);
                        return res.json(result);
                    } catch (e) {
                        await logger.error(module, e.message);
                        res.status(500).send(
                            `An error occurred while running the module ${module}. Please check your server logs or contact your administrator.`
                        );
                    }
                });
        }

        // Pull requests from all modules and send them
        app.get('/api/v1/all', async (req, res) => {
            let result = {};

            for (let module in this.modules) {
                if (Object.prototype.hasOwnProperty.call(this.modules, module)) {
                    try {
                        result[module] = await this.modules[module](this.args[module]);
                    } catch (e) {
                        await logger.error(module, e.message);
                        res.status(500).send(
                            `An error occurred while running the module ${module}. Please check your server logs or contact your administrator.`
                        );
                    }
                }
            }

            return res.json(result);
        });
    }
};
