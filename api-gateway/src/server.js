require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const helmet = require('helmet');
const app = express();
const PORT = process.env.PORT || 8000;

const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require("rate-limit-redis")
const logger = require('./utils/logger');
const proxy = require('express-http-proxy');
const errorHandler = require('./middleware/errorHandler');

app.use(cors());
app.use(helmet());
app.use(express.json());


const redisClient = new Redis(process.env.REDIS_URL);

const rateLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
    windowMs: 15 * 60 * 1000,
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ message: 'Too many requests, please try again later.' });
    }
});

app.use(rateLimiter);
app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url} - IP: ${req.ip}`);
    logger.info(`Request body: ${(req.body)}`);
    next();
})

app.use('/api/auth', proxy("http://localhost:8001", {
    proxyReqPathResolver: (req) => {
        return `/api/auth${req.url}`;
    }
}))

app.use(errorHandler)

app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
    logger.info(`Identity Service URL: ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Redis URL: ${process.env.REDIS_URL}`);
});