"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bcrypt = require("bcrypt");
var nodemailer = require("nodemailer");
var mongoose_1 = require("mongoose");
var jwt = require("jsonwebtoken");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var winston = require("winston");
var transports = winston.transports;
var app = express();
app.use(express.json());
var port = process.env.PORT || 3000;
var mongoUrl = process.env.mongoUrl;
var hosting_website = process.env.hosting_website;
var logger_port = process.env.logger_port || 10001;
var logger_app = express();
logger_app.use(express.json());
var sender = {
    email: process.env.email,
    pass: process.env.pass
};
//
// Create a transporter
var transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'gmail', 'yahoo', 'hotmail'
    auth: {
        user: sender.email,
        pass: sender.pass
    }
});
// Set up email data
var mailOptions = {
    from: sender.email,
    to: 'recipient-email@example.com',
    subject: 'Hello from Nodemailer',
    text: 'This is a test email sent using Nodemailer'
};
function send_email(reciever_email, subject, text) {
    mailOptions.to = reciever_email;
    mailOptions.subject = subject;
    mailOptions.text = text;
    console.log(mailOptions);
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
}
var logs = [];
var logger = winston.createLogger({
    level: 'info',
    transports: [
        new transports.Http({
            host: hosting_website,
            path: '/logs',
            port: logger_port
        })
    ]
});
logger_app.post('/logs', function (req, res) {
    logs.push(req.body); // Store received log data
    res.sendStatus(200);
});
logger_app.get('/logs', function (req, res) {
    res.json(logs);
});
logger_app.listen(logger_port, function () {
    console.log("Logger listening on port ".concat(logger_port, "!"));
});
var connection = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log("Connecting to DB...");
                return [4 /*yield*/, mongoose_1.default.connect(mongoUrl)];
            case 1:
                _a.sent();
                console.log("DB connected");
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                if (error_1 instanceof Error) {
                    console.error(error_1.message);
                }
                else {
                    console.error('An unknown error occurred');
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
connection();
var userSchema = new mongoose_1.Schema({
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
    }
});
var User = (0, mongoose_1.model)("User", userSchema);
app.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, first_name, last_name, email, password, user, hash_password, code_num, code, newuser, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, first_name = _a.first_name, last_name = _a.last_name, email = _a.email, password = _a.password;
                return [4 /*yield*/, User.findOne({ email: email })];
            case 1:
                user = _b.sent();
                if (user) {
                    res.status(400).json({ message: "Email already exists" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 2:
                hash_password = _b.sent();
                code_num = (Math.floor(100000 + Math.random() * 10000));
                code = code_num.toString();
                newuser = new User({ first_name: first_name, last_name: last_name, email: email, password: hash_password, code: code });
                //newuser.otp = code;
                return [4 /*yield*/, send_email(email, "Verification", code)];
            case 3:
                //newuser.otp = code;
                _b.sent();
                return [4 /*yield*/, newuser.save()];
            case 4:
                _b.sent();
                logger.info("".concat(email, " signup"));
                res.status(201).json({
                    message: "email sent successfully",
                    user: newuser
                });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _b.sent();
                if (error_2 instanceof Error) {
                    res.status(500).json({ message: error_2.message });
                }
                else {
                    res.status(500).json({ message: 'An unknown error occurred' });
                }
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.post("/verify_email", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, otp, user;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, otp = _a.otp;
                return [4 /*yield*/, User.findOne({ email: email })];
            case 1:
                user = _b.sent();
                if (!(req.body.otp === otp && req.body.email === email)) return [3 /*break*/, 3];
                return [4 /*yield*/, User.findOneAndUpdate({ email: email }, { email_verified: true, otp: "" })];
            case 2:
                _b.sent();
                logger.info("".concat(email, " verified email"));
                res.status(200).json({
                    message: "Email verified successfully",
                    user: user
                });
                return [2 /*return*/];
            case 3:
                res.status(400).json({ message: "Invalid OTP" });
                _b.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User.find()];
            case 1:
                users = _a.sent();
                logger.info("data fetched");
                res.status(200).json({
                    message: "Data fetched successfully",
                    data: users
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                if (error_3 instanceof Error) {
                    res.status(500).json({ message: error_3.message });
                }
                else {
                    res.status(500).json({ message: 'An unknown error occurred' });
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, first_name, last_name, email, password, hash_password, user, updated_user, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                id = req.params.id;
                _a = req.body, first_name = _a.first_name, last_name = _a.last_name, email = _a.email, password = _a.password;
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 1:
                hash_password = _b.sent();
                return [4 /*yield*/, User.findById(id)];
            case 2:
                user = _b.sent();
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, User.findByIdAndUpdate(id, { first_name: first_name, last_name: last_name, email: email, password: hash_password }, { new: true })];
            case 3:
                updated_user = _b.sent();
                if (!updated_user) {
                    res.status(404).json({ message: "User not found" });
                    return [2 /*return*/];
                }
                logger.info("object no ".concat(id, "  updated"));
                res.status(200).json({
                    message: "User updated successfully",
                    user: user
                });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _b.sent();
                if (error_4 instanceof Error) {
                    res.status(500).json({ message: error_4.message });
                }
                else {
                    res.status(500).json({ message: 'An unknown error occurred' });
                }
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.delete('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, User.findByIdAndDelete(id)];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return [2 /*return*/];
                }
                logger.info("object no ".concat(id, "  deleted"));
                res.status(200).json({
                    message: "User deleted successfully",
                    user: user
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                if (error_5 instanceof Error) {
                    res.status(500).json({ message: error_5.message });
                }
                else {
                    res.status(500).json({ message: 'An unknown error occurred' });
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, _b, access_token;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, User.findOne({ email: email })];
            case 1:
                user = _c.sent();
                _b = !user;
                if (_b) return [3 /*break*/, 3];
                return [4 /*yield*/, bcrypt.compare(password, user.password)];
            case 2:
                _b = !(_c.sent());
                _c.label = 3;
            case 3:
                if (_b) {
                    res.status(401).json({ message: "Invalid credentials" });
                    return [2 /*return*/];
                }
                logger.info("".concat(email, " logging in"));
                access_token = jwt.sign({ email: user.email, id: user._id }, process.env.SECRET_ACCESS_TOKEN);
                res.json({ access_token: access_token });
                return [2 /*return*/];
        }
    });
}); });
var verify_Token = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var header, token, decoded;
    return __generator(this, function (_a) {
        header = req.header('Authorization');
        token = header && header.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Access denied. No token provided' });
            return [2 /*return*/];
        }
        try {
            decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
            req.body.user = decoded;
            next();
        }
        catch (err) {
            res.status(400).json({ message: 'Invalid token' });
        }
        return [2 /*return*/];
    });
}); };
app.get("/get", verify_Token, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.user.email;
                return [4 /*yield*/, User.findOne({ email: email })];
            case 1:
                user = _a.sent();
                logger.info("".concat(email, " fetched his data"));
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return [2 /*return*/];
                }
                res.json({ user: user });
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("Server is running on port ".concat(port));
});
