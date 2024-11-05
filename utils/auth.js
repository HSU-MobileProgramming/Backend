const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/config.js');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>" 형식
    
    if (!token) 
        return res.status(401).json({ message: "토큰이 필요합니다." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) 
            return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;