const jwt = require('jsonwebtoken');
const User = require('../models/user');  

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    throw new GraphQLError('Authentication token is required', {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);  
    if (!user) {
      throw new GraphQLError('User not found', {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      });
    }

    req.user = user;  
    next();
  } catch (error) {
    throw new GraphQLError('Invalid or expired token', {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
};

module.exports = authMiddleware;
