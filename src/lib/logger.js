const fs = require('fs');

let config = {
    logToConsole: true,
    logToFile: false,
    logFilePath: './server-state.log'
};

const logLevelNames = [
    'LOG  ',
    'WARN ',
    '',
    '',
    '',
    'ERROR',
];

function logPerConfig(type, ...args) {
    let message;

    message = '[' + new Date().toISOString() + '] ' + logLevelNames[type] + ' ';
    message += args.reduce(
        (
            (previousValue, currentValue) => previousValue + ' ' + currentValue
        ),
        '',
        args.map(
            arg => arg.toString()
        )
    );

    config.logToConsole ? logConsole(type, message) : null;
    config.logToFile ? logFile(type, message) : null;
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
    if (!fs.existsSync(config.logFilePath)) {
        fs.writeFileSync(config.logFilePath, 'Log file initialized on ' + new Date().toISOString());
    }

    fs.appendFileSync(config.logFilePath, '\n' + message);
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
    _configure: (passedConfig) => {
        config = Object.assign(config, passedConfig);
    }
};
