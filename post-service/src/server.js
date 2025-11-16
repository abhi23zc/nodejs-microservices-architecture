require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const postRoutes = require("./routes/post.route");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 8002;

mongoose.connect(process.env.MONGO_DB_URL).then(() => {
    logger.info('Connected to MongoDB');
}).catch((err) => {
    logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next)=>{
    logger.info(`Received${req.method} request to ${req.url}`);
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
    next();
})

app.use("/api/post", (req, res, next)=>{
    req.redisClient = redisClient;
    next();
}, postRoutes);


app.listen(PORT, ()=>{
    logger.info(`Post service is running on port ${PORT}`);
})

app.use(errorHandler);


