const logToConsole = true;
const logToFile = false;

function logPerConfig(type, ...args) {
    let message;

    message = '[' + new Date().toISOString() + '] ';
    message += args.reduce(
        (
            (previousValue, currentValue) => previousValue + ' ' + currentValue
        ),
        '',
        args.map(
            arg => arg.toString()
        )
    );

    logToConsole ? logConsole(type, message) : null;
    logToFile ? logFile(type, message) : null;
}

function logConsole(type, message) {
    switch (type) {
    case 0:
        console.log(message);
        break;
    case 1:
        console.warn(message);
        break;
    default:
        console.error(message);
    }
}

function logFile(type, message) {
    //TODO: Implement logging to file
    type;
    message;
}

module.exports = {
    log: (...args) => {
        return logPerConfig(0, ...args);
    },
    warn: (...args) => {
        return logPerConfig(1, ...args);
    },
    error: (...args) => {
        return logPerConfig(5, ...args);
    },
};
