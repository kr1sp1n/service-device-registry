module.exports = function () {
  return {
    port: process.env.PORT || 3000,
    connectionURI: 'mongodb://dockerhost/my_database',
    jwtSecret: process.env.JWT_SECRET || 'my awesome secret',
  };
};
