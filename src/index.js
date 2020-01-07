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
     * @param {Object<{isAuthorized?: function}>} [config]
     */
    constructor(config) {
        this.modules = {};
        this.args = {};
        this.authorizedGroups = {};
        this.config = config || {isAuthorized: null};
        logger._configure(config);
    }

    /**
     * Add module to server for json output.
     * @param {string} name Module name (without prefixes)
     * @param {function} fn
     * @param {string[]} [authorizedGroups=[]]
     * @param {*} [options=undefined]
     */
    addModule(name, fn, authorizedGroups, options) {
        if (this.modules[name])
            logger.warn(`Module already used: ${name}. Skipping`);
        else {
            this.modules[name] = fn;
            this.authorizedGroups[name] = authorizedGroups;
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
            if (Object.prototype.hasOwnProperty.call(this.modules, module)) {
                app.get(`/api/v1/${module}/permissions`, async (req, res) => {
                    if (this.config.isAuthorized && typeof this.config.isAuthorized === 'function') {
                        if (!this.config.isAuthorized(req, this.authorizedGroups[module])) {
                            return res.status(403).send();
                        }
                    }
                    const result = await this.authorizedGroups[module];
                    return res.json(result);
                });
                app.get('/api/v1/' + module, async (req, res) => {
                    try {
                        if (this.config.isAuthorized && typeof this.config.isAuthorized === 'function') {
                            if (!this.config.isAuthorized(req, this.authorizedGroups[module])) {
                                return res.status(403).send();
                            }
                        }
                        const result = await this.modules[module](this.args[module]);
                        return res.json(result);
                    } catch (e) {
                        logger.error(module, e.message);
                        return res.status(500).send(
                            `An error occurred while running the module ${module}. Please check your server logs or contact your administrator.`
                        );
                    }
                });
            }
        }

        // Pull requests from all modules and send them
        app.get('/api/v1/all', async (req, res) => {
            let result = {};

            for (let module in this.modules) {
                if (Object.prototype.hasOwnProperty.call(this.modules, module)) {
                    try {
                        if (this.config.isAuthorized && typeof this.config.isAuthorized === 'function') {
                            if (this.config.isAuthorized(req, this.authorizedGroups[module])) {
                                result[module] = await this.modules[module](this.args[module]);
                            }
                        } else {

                            result[module] = await this.modules[module](this.args[module]);
                        }
                    } catch (e) {
                        logger.error(module, e.message);
                        res.status(500).send(
                            `An error occurred while running the module ${module}. Please check your server logs or `
                            + 'contact your administrator.'
                        );
                    }
                }
            }

            return res.json(result);
        });
    }
};
