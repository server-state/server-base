export = ServerBase;

/**
 * A module for creating a server-state server. This handles modules and responses and has to get attached to an Express app.
 * @copyright 2019 by server-state
 * @licence MIT
 */
declare class ServerBase {
    /**
     * Creates a ServerBase instance that can then get attached to an Express application
     * @param config Configuration for the server-base module, including options regarding logging
     */
    constructor(config?: {
        /**
         * If true, messages will get logged via stdout and stderr
         * @default true
         */
        logToConsole?: boolean,
        /**
         * If `true`, messages will get logged to the file specified as `logFilePath`.
         * @default false
         */
        logToFile?: boolean,
        /**
         * Path to the file in which messages should get logged (in case `logToFile` is `true`).
         * @default './server-state.log'
         */
        logFilePath?: string
    });

    /**
     * Adds a server module function (as specified in https://github.com/server-state/specs/blob/master/terminology/server-module-function.md) under a given name resulting in a server module function (as specified in https://github.com/server-state/specs/blob/master/terminology/server-module.md), making it available under `/api/v1/[name]`.
     * @param name The name of the module. Must be unique (i.e., not registered before). Otherwise, the module will be skipped and an error message logged.
     * @param moduleFunction The function defining the module (SMF). Must either return a Promise for or a JSON serializable value or throw with an error message in case of failure (resulting in the error message getting logged and a `HTTP 500` response).
     * @param moduleOptions Options getting passed to the SMF as first argument. Can be any type, but usually will be a configuration object.
     */
    addModule(name: string, moduleFunction: (options: any) => any | Promise<any>, moduleOptions?: any)

    /**
     * Attaches the server base to the passed Express `app`, handling routes under `/api/` there.
     * @param app The Express app to which the routes get added.
     */
    init(app: Express.Application);
}
