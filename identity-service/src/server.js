require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const { log } = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const {RateLimiterRedis} = require("rate-limiter-flexible")
const Redis = require("ioredis");
const mongoose = require('mongoose');
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require("rate-limit-redis");
const errorHandler = require('./middleware/errorHandler');


const app = express();

mongoose.connect(process.env.MONGO_DB_URL).then(() => {
    logger.info('Connected to MongoDB');
}).catch((err) => {
    logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to  ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
})

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 5,
    duration: 5,
});

app.use((req, res, next) => {
    rateLimiter.consume(req.ip).then(() => {
        next();
    }).catch(() => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).send('Too Many Requests');
    });
});

const sensitiveEndpointLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).send('Too Many Requests');
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

// app.use("/api/auth/register", sensitiveEndpointLimiter);


//Routes
app.use("/api/auth", require("./routes/identity.service.route"));


// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

//error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Identity service running on port ${PORT}`);
});


process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});