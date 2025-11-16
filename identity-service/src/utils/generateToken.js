const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshToken.modal');
const crypto = require("crypto");

const  generateToken = async(user) =>{
    const accessToken = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1day' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    await RefreshToken.create({
        token: refreshToken,
        userId: user._id,
        expiresAt
    });
    return { accessToken, refreshToken };
}

module.exports = generateToken;