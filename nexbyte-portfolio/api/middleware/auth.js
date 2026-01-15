const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.cookies.token || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT decoded:', decoded);
    req.user = decoded.user;
    console.log('req.user set to:', req.user);
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
