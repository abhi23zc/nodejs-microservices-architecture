const logger = require("../utils/logger");

const authenticateRequest = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        logger.warn("Unauthorized access attempt");
        return res.status(401).json({ success:false, message: "Unauthorized" });
    }
    req.user = { userId };
    next();
}

module.exports = authenticateRequest;