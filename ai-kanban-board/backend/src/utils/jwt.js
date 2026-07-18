const jwt = require("jsonwebtoken");

const signToken = (payload) => 
    jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.jwt_expires_in || "7d",
    });

const verifyToken = (token) =>jwt.verify(token, process.env.JWT_SECRET);

module.exports = { signToken, verifyToken };
