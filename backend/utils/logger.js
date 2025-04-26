const winston = require('winston')
require('winston-daily-rotate-file')
const AppError = require('../utils/AppError')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')

//Logs dir
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

//Morgan for requests
const morganStream = fs.createWriteStream(path.join(logDirectory, 'Requests.log'), {
    flags: 'a', 
});


//Winston configuration

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, stack }) => {
            let logEntry = `${timestamp} [${level}]: ${message}`
            if (stack) {
                logEntry += `\n${stack}`
            }
            return logEntry
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
            filename: path.join(logDirectory , 'error.log'), 
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.printf(({ level, message, timestamp, stack }) => {
                    let logEntry = `${timestamp} [${level}]: ${message}`
                    if (stack) {
                        logEntry += `\n${stack}`
                    }
                    return logEntry
                })
            )
        }),
    ],
});

//Save morgan in it's own file to seprate it from error logger
const morganMiddleware = morgan('combined', { stream: morganStream }); 

module.exports = {
    logger,
    morganMiddleware
};