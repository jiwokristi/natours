import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore package has no official TypeScript type definitions.
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import tourRouter from 'routes/tourRoutes.js';
import userRouter from 'routes/userRoutes.js';

import globalErrorHandler from 'controllers/errorController.js';

const app = express();

// * 1) GLOBAL MIDDLEWARES
// Serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Set secure HTTP headers
// -------------------------------------------------------------
// helmet() adds many security-related headers automatically, such as:
//   - X-DNS-Prefetch-Control
//   - X-Frame-Options (prevents clickjacking)
//   - X-XSS-Protection
//   - Strict-Transport-Security (HSTS)
//   - Content-Security-Policy (optional to configure)
// These headers help protect your app from common web vulnerabilities.
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Parse incoming JSON payloads (e.g., from fetch/axios requests)
// Populates req.body with a JavaScript object
// Only triggers when Content-Type: application/json
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded data (typically from HTML <form> submissions)
// Populates req.body with key/value pairs
// Only triggers when Content-Type: application/x-www-form-urlencoded
// extended: true allows nested objects (e.g., { user: { name: 'Jiwo' } })
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse cookies sent by the client and populate req.cookies
// Required for reading JWT tokens stored in cookies, sessions, etc.
app.use(cookieParser());

// Prevent NoSQL injection attacks
// -------------------------------------------------------------
// mongoSanitize() removes any keys in req.body, req.query, and req.params
// that begin with "$" or contain "." —
// these characters are used in malicious MongoDB operators like:
//   { "$gt": "" }  or  { "email": { "$ne": null } }
// Without this, attackers could manipulate your database queries.
//! deprecated
// app.use(mongoSanitize());

// Prevent XSS (Cross-Site Scripting) attacks
// -------------------------------------------------------------
// xss() cleans user input from malicious HTML or JavaScript code
// Example of an attack:
//   <script>alert("Hacked")</script>
// This middleware sanitizes such input so it cannot run in browsers.
// Essential whenever you store user-generated content.
//! deprecated
// app.use(xss());

// Prevent HTTP Parameter Pollution (HPP)
// -------------------------------------------------------------
// hpp() ensures query parameters cannot be duplicated to bypass logic.
// Example attack:
//   /api/v1/users?role=admin&role=user
// Without hpp(), Express would turn this into: { role: ["admin", "user"] }
// This middleware forces a single value (the last one) unless allowed.
// whiteList: parameters allowed to appear multiple times (optional)
// @ts-ignore package has no official TypeScript type definitions.
app.use(hpp({ whiteList: [] }));

// * 2) ROUTES
// app.use('/', (req, res) => {});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', (req, res) => {});
app.use('/api/v1/bookings', (req, res) => {});

app.all('*path', (req, res, next) => {
  next();
});

app.use(globalErrorHandler);

export default app;
