const express = require('express');
const multer = require('multer');
const { uploadMedia, getAllMedias } = require('../controllers/media.controller');
const authenticateRequest = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit

}).single('file');

router.post('/upload', authenticateRequest, (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            logger.error("Multer error during file upload", err);
            return res.status(400).json({ success: false, message: err.message });
        }   
        else if (err) {
            logger.error("Unknown error during file upload", err);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }

        if (!req.file) {
        return res.status(400).json({
          message: "No file found!",
        });
      }

        next();
    });
}   , uploadMedia);

router.get("/", authenticateRequest, getAllMedias);

module.exports = router;
