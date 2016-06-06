module.exports = function (config) {
  const express = require('express');
  const bodyParser = require('body-parser');
  const db = require('./db')(config);
  const filterResult = require('./response_filter');
  const expressJwt = require('express-jwt');
  const jwt = require('./jwt')({ secret: config.jwtSecret });

  const errors = require('./errors');

  const app = express();

  const handleResult = function (req, res) {
    return function (err, result) {
      if (err) return res.send({ message: err.message });
      const responseData = filterResult(result);
      res.send(responseData);
    };
  };

  app.use(expressJwt({ secret: config.jwtSecret }).unless({ method: 'POST', path: ['/device', '/login'] }));
  app.use(errors());

  app.use(bodyParser.json());

  app.post('/login', function (req, res) {
    const fingerprint = req.body.fingerprint;
    const password = req.body.password;
    db.loginByDevice({
      fingerprint: fingerprint,
      password: password,
    }, function (err, user) {
      if (err) return res.send(err);
      const token = jwt(user);
      res.send({ token: token });
    });
  });

  app.post('/device', function (req, res, next) {
    const data = req.body;
    db.getUserByName(data.user, function (err, user) {
      if (err) return next(err);
      if (user) {
        req.user = user;
        next();
      } else {
        db.registerUser({ user: data.user }, function (err, user) {
          if (err) return next(err);
          req.user = user;
          next();
        });
      }
    });
  }, function (req, res) {

    const data = req.body;
    data.user = req.user;
    db.registerDevice(data, function (err, device) {
      // console.log(err);
      if (err) return res.send({ message: err.message });
      const result = {
        id: device._id,
        user: device.user.name,
        title: device.title,
      };
      res.send(result);
    });
  });

  app.get('/device', function (req, res) {
    if (req.query.user) {
      db.getDevicesByUserName(req.query.user, handleResult(req, res));
    } else {
      db.getAllDevices(handleResult(req, res));
    }
  });

  app.get('/user', function (req, res) {
    db.getAllUsers(handleResult(req, res));
  });

  app.get('/user/:id', function (req, res) {
    db.getUserById(req.params.id, handleResult(req, res));
  });

  return app;
};
