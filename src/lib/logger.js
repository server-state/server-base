const logToConsole = true;
const logToFile = false;

async function logPerConfig(type, ...args) {
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

    logToConsole ? await logConsole(type, message) : null;
    logToFile ? await logFile(type, message) : null;
}

async function logConsole(type, message) {
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

async function logFile(type, message) {
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
