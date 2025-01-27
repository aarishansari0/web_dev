"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRoutes = exports.logger = void 0;
var winston = require("winston");
var dotenv = require("dotenv");
dotenv.config();
var transports = winston.transports;
var logs = [];
var logger = winston.createLogger({
    level: 'info',
    transports: [
        new transports.Http({
            host: process.env.hosting_website,
            path: '/logs',
            port: process.env.port ? parseInt(process.env.port, 10) : 10000
        })
    ]
});
exports.logger = logger;
var logRoutes = function (app) {
    app.post('/logs', function (req, res) {
        logs.push(req.body); // Store received log data
        res.sendStatus(200);
    });
    app.get('/logs', function (req, res) {
        res.json(logs);
    });
};
exports.logRoutes = logRoutes;
