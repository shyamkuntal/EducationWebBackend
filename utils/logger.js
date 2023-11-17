const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logFormat = format.printf(
    ({ timestamp, label, level, message }) => `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`,
);

const debug = new DailyRotateFile({
    filename: 'logs/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '30m',
    maxFiles: '14d',
    level: 'debug',
    handleExceptions: true,
});

let transport = [new transports.Console({ silent: false })];

if (process.env.NODE_ENV === "dev") {
    transport = [debug];
}

const logger = createLogger({
    format: format.combine(format.timestamp(), format.label({ label: process.env.APP_LABEL || 'EDUPLANET' }), logFormat),
    transports: transport,
});

module.exports = logger;
