const loggger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next)=>{
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1];
   
    if(!token){
        loggger.warn('Access token missing in request headers');
        return res.status(401).json({success:false, message: 'Unauthorized access'});
    }
    loggger.info('Validating access token...');

    jwt.verify(token, process.env.JWT_SECRET || "abhi@123", (err, user)=>{
        if(err){
            loggger.warn('Invalid or expired access token');
            return  res.status(403).json({success:false, message: 'Invalid or expired token'});
        }
        req.user = user;
        next();
    });

}

module.exports = validateToken;