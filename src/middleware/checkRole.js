require('dotenv').config()
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const checkRole = (role) => {
    return async (req, res, next) => {
     
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
      }
  
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
  
        if (!user || user.role !== role) {
          return res.status(403).json({ message: 'Forbidden' });
        }
  
        req.user = user;
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    };
  };
  
  module.exports = checkRole;