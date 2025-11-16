const RefreshToken = require('../models/refreshToken.modal');
const User = require('../models/user.modal');
const generateToken = require('../utils/generateToken');
const logger = require('../utils/logger');
const { validateRegistration } = require('../utils/validation');

const registerUser = async (req, res) => {
    logger.info('Registering new user...');
    try {
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn("validation error: ", error.details[0].message);
            return res.status(400).json({ success: false, error: error.details[0].message });
        }
        const { username, password, email } = req.body;
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            logger.warn("User already exists with given username or email");
            return res.status(400).json({ success: false, error: 'User already exists with given username or email' });
        }
        user = new User({ username, password, email });
        await user.save();
        logger.info('User registered successfully');

        const { accessToken, refreshToken } = await generateToken(user);
        return res.status(201).json({ success: true, message: 'User registered successfully', accessToken, refreshToken });


    } catch (err) {
        logger.error('Error registering user: ', err);
        return res.status(500).json({ message: 'Internal Server Error', succcess: false });
    }
}

const loginUser = async (req, res) => {
    // Login logic here
    logger.info('Logging in user...');
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            logger.warn("Invalid email or password");
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        logger.info('User logged in successfully');
        const { accessToken, refreshToken } = await generateToken(user);
        return res.status(200).json({ success: true, message: 'User logged in successfully', accessToken, refreshToken });
    } catch (err) {
        logger.error('Error logging in user: ', err);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

const refreshToken = async(req, res)=>{
    logger.info("Refresh token endpoint hit...");
    try{
        const {refreshToken} = req.body;
        if(!refreshToken){
            logger.warn("No refresh token provided");
            return res.status(400).json({success:false, error:"No refresh token provided"});
        }
        const storedToken = await RefreshToken.findOne({token: refreshToken});
        if(!storedToken){
            logger.warn("Invalid refresh token");
            return res.status(401).json({success:false, error:"Invalid refresh token"});
        }
        const user = await User.findById(storedToken.userId);
        if(!user){
            logger.warn("User not found for the provided refresh token");
            return res.status(404).json({success:false, error:"User not found"});
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateToken(user);
        await RefreshToken.deleteOne({_id: storedToken._id});
        return res.status(200).json({success:true, accessToken, refreshToken: newRefreshToken});
    } catch (err) {
        logger.error("Error refreshing token: ", err);
        return res.status(500).json({success:false, error:"Internal Server Error"});
    }
    
}

module.exports = {
    registerUser,
    loginUser,
    refreshToken
};