module.exports = function (config) {
  const secret = config.secret;
  const jwt = require('jsonwebtoken');

  return function (payload) {
    return jwt.sign(payload, secret, { expiresIn: '2h' });
  };
};
