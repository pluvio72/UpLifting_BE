const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateUser = async function (req, res, next) {
  try {
    const splitAuthHeader = req.headers.auhtorization.split(' ');
    const token = splitAuthHeader[0];
    const user = splitAuthHeader[1];

    const _user = User.findOne({ username: user });
    if (_user) {
      try {
        jwt.verify(token, _user.key);
        return next();
      } catch (decodingTokenError) {
        console.warn(`Error decoding token, ${decodingTokenError}.`);
        return res.json({ success: false, message: 'Token Error.' });
      }
    } else {
      return res.json({ success: false, message: 'No User Found.' });
    }
  } catch (error) {
    console.warn(`Error autenticating tokens, ${error.message}.`);
    return res.json({ success: false, message: 'Authentication Error.' });
  }
};

module.exports = authenticateUser;