const expess = require('express');
const logger = require('../utils/logger');


/**
 * 
 * @param {expess.Request} req 
 * @param {expess.Response} res 
 * @param {expess.NextFunction} next 
 */
const loggerMiddleware = (req, res, next) => {
    const start = new Date();

    res.on('finish', () => {
        const end = new Date();
        const responseTime = end.getTime() - start.getTime();
        const code = res.statusCode;

        if (code < 400) {
            logger.info(`${req.method} ${req.url} ${code} ${responseTime}ms`);
        } else if (code < 600) {
            logger.error(`${req.method} ${req.url} ${code} ${responseTime}ms\n`);
        } else {
            logger.debug(`${req.method} ${req.url} ${code} ${responseTime}ms`);
        }
    });

    next();
};

module.exports = loggerMiddleware;
