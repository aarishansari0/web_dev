import express = require('express');
import * as winston from 'winston';
import * as dotenv from 'dotenv';
dotenv.config();

const { transports } = winston;

interface LogEntry {
    message: string;
    level: string;
    timestamp: string;
}

let logs: LogEntry[] = [];

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new transports.Http({ 
            host: process.env.hosting_website as string,
            path: '/logs',
            port: process.env.port ? parseInt(process.env.port as string, 10) : 10000
        })
    ]
});

const logRoutes = (app: any) => {
    app.post('/logs', (req: any, res: any) => {
        logs.push(req.body); // Store received log data
        res.sendStatus(200);
    });

    app.get('/logs', (req: any, res: any) => {
        res.json(logs);
    });
};

export { logger, logRoutes };
