module.exports = function () {
  const errors = {
    UnauthorizedError: {
      code: 401,
      message: 'Invalid token',
    },
  };

  return function (err, req, res, next) {
    const error = errors[err.name];
    if (error) {
      res.status(error.code).send({ message: error.message });
    } else {
      res.status(500).send({ message: 'Unhandled error' });
    }
  };
};
