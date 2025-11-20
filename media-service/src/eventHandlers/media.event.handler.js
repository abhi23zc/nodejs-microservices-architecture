const logger = require("../../../post-service/src/utils/logger");

const handlePostDeleted = async (data) => {
    // Logic to handle post deletion, e.g., remove associated media
    logger.info(`Handling post.deleted event for postId: ${data.postId}`);
    // Add your media deletion logic here
}

module.exports = {
    handlePostDeleted
}