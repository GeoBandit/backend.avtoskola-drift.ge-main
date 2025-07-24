const jwt = require('jsonwebtoken');

// Secret key for signing the token (store this in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Function to verify a JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null; // Invalid or expired token
  }
};

module.exports = { generateToken, verifyToken };