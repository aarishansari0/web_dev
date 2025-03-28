import express = require('express');
import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

import mongoose, { model, Schema } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();
import * as winston from 'winston';

import { hash } from 'crypto';
import { send } from 'process';
import { log } from 'console';
const { transports } = winston;

const app = express();
const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
 
const port = process.env.port || 10000;
const mongoUrl = process.env.mongoUrl as string;

const sender = 
{
    email: process.env.email,
    pass: process.env.pass
}
//

// Create a transporter

const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail', 'yahoo', 'hotmail'
  auth: {
    user: sender.email,
    pass: sender.pass
  }
});

// Set up email data
const mailOptions = {
  from: sender.email,
  to: 'recipient-email@example.com',
  subject: 'Hello from Nodemailer',
  text: 'This is a test email sent using Nodemailer'
};

function send_email(reciever_email: string, subject: string, text: string) {
    mailOptions.to = reciever_email;
    mailOptions.subject = subject;
    mailOptions.text = text;
    console.log(mailOptions)
    transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  console.log('Email sent: ' + info.response);
});
}
//send_email('gjc.aarish.ansari@gnkhalsa.edu.in','check','succ');


// Logger with Winston
interface LogEntry {
    message: string;
    level: string;
    timestamp: string;
}

let logs: LogEntry[] = [];


const logger = winston.createLogger({
    level: 'info',
    transports: [
        new transports.Console(),
        new transports.Http({
            host: 'web-dev-node.onrender.com',
            path: '/logs',
            port: 443, // Use port 443 for HTTPS
            ssl: true
        })
    ]
});

logger.on('error', (err) => {
    console.error('Error with logger transport:', err); // Log any errors with the transport
});

app.post('/logs', (req, res) => {
    logs.push(req.body);
    console.log('Log received:', req.body); // Debug statement
    res.sendStatus(200);
});

app.post('/example', (req, res) => {
    logger.info("test")
    res.send("test")
})

app.get('/logs', (req, res) => {
    res.json(logs);
});

const connection = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(mongoUrl);
        console.log("DB connected");
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('An unknown error occurred');
        }
    }
};

connection();

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    code:{
        type: String,
        required: false
    }
});

const User = model("User", userSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

app.get('/verify-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});


app.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const user = await User.findOne({ email })
        if (user) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }
        const hash_password = await bcrypt.hash(password, 10);
        let code = Math.floor(100000 + Math.random() * 900000).toString();
        
        let newuser = new User({ first_name, last_name, email, password: hash_password,code: code });
        //newuser.otp = code;
        await send_email(email, "Verification", code);
        await newuser.save();
        logger.info(`${email} signup`);
        res.status(201).json({
            message: "email sent successfully",
            user: newuser
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

app.post("/verify_email", async(req: Request, res: Response) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    if (user.email_verified) {
        res.status(400).json({ message: "Email already verified" });
        return;
    }
    if (otp === user.code && req.body.email === user.email) {
        await User.findOneAndUpdate({email}, { email_verified: true, code: "" });
        logger.info(`${email} verified email`);
        res.status(200).json({ 
            message: "Email verified successfully",
        });
        return;
    } else {
        res.status(400).json({ message: "Invalid OTP" });
    }
});

app.get('/', async (req, res) => {
    try {
        let users = await User.find();
        logger.info(`data fetched`);
        res.status(200).json({
            message: "Data fetched successfully",
            data: users
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});


app.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, password } = req.body;
        const hash_password = await bcrypt.hash(password, 10);
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const updated_user =await User.findByIdAndUpdate(id, { first_name, last_name, email, password: hash_password }, { new: true });
        if (!updated_user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        logger.info(`object no ${id}  updated`);
        res.status(200).json({
            message: "User updated successfully",
            user: user
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

app.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        logger.info(`object no ${id}  deleted`);
        res.status(200).json({
            message: "User deleted successfully",
            user: user
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

app.post("/login", async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: "Invalid credentials"});
        return;
    }
    const log_check = logger.info(`${email} logging in`);
    if (!log_check) {
        res.status(401).json({ message: "log not recicevd"});
        return;
    }
    const access_token = jwt.sign({ email: user.email, id: user._id }, process.env.SECRET_ACCESS_TOKEN as string);
    res.json({ access_token });
});

const verify_Token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.header('Authorization');
    const token = header && header.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN as string);
        req.body.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

app.get("/get", verify_Token, async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body.user;
    const user = await User.findOne({ email });
    logger.info(`${email} fetched his data`);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json({ user });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





