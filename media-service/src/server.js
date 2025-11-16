require("dotenv").config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const mediaRoutes = require('./routes/media.route');
const  mongoose  = require("mongoose");


mongoose
.connect(process.env.MONGO_URL)
.then(() => logger.info("Connected to mongodb"))
.catch((e) => logger.error("Mongo connection error", e));

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});



app.use("/api/media", mediaRoutes);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  logger.info(`Media Service running on port ${process.env.PORT}`);
});

