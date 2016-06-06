module.exports = function (config) {
  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const DeviceSchema = new Schema({
    user: {
      type: ObjectId,
      ref: 'User',
    },
    title: String,
    fingerprint: String,
    type: String,
  });

  DeviceSchema.methods.getUser = function (done) {
    return this.db.model('User').findById(this.user, done);
  };

  DeviceSchema.path('type').default(() => 'device');

  const Device = mongoose.model('Device', DeviceSchema);

  const UserSchema = new Schema({
    name: String,
    type: String,
  });

  UserSchema.path('type').default(() => 'user');

  const User = mongoose.model('User', UserSchema);

  mongoose.connect(config.connectionURI);

  const getUserByName = (name, done) => User.findOne({ name: name }, done);
  const getUserById = (id, done) => User.findById(id, done);
  const getDeviceByFingerprint = (fingerprint, done) => Device.findOne({ fingerprint: fingerprint }, done);

  const createDevice = function (data, done) {
    const newDevice = new Device();
    newDevice.title = data.title || '';
    newDevice.fingerprint = data.fingerprint;
    newDevice.user = data.user;
    newDevice.save(done);
  };

  const registerDevice = function (data, done) {
    getDeviceByFingerprint(data.fingerprint, function (err, device) {
      if (device) return done(new Error('Device already registered'));
      createDevice(data, done);
    });
  };

  const registerUser = function (data, done) {
    const name = data.user;
    getUserByName(name, function (err, user) {
      if (err) return done(err);
      if (user) return done(new Error('User already exists'));
      const newUser = new User();
      newUser.name = name;
      newUser.save(function (err) {
        if (err) return done(err);
        done(null, newUser);
      });
    });
  };

  const getAllDevices = (done) => Device.find({}, done);

  const getAllUsers = (done) => User.find({}, done);

  const getDevicesByUserName = (username, done) => {
    getUserByName(username, function (err, user) {
      if (err) return done(err);
      Device.find({ user: user }, done);
    });
  };

  const getUserByDeviceFingerprint = (fingerprint, done) => {
    Device.findOne({ fingerprint: fingerprint }, (err, device) => {
      if (err) return done(err);
      if (!device) {
        return done(new Error('Device not found'));
      } else {
        device.getUser((err, user) => {
          if (err) return done(err);
          done(null, user);
        });
      }
    });
  };

  const loginByDevice = (data, done) => {
    getUserByDeviceFingerprint(data.fingerprint, (err, user) => {
      if (err) return done(err);
      const result = {
        id: user._id,
        type: user.type,
        name: user.name,
      };
      done(null, result);
    });
  };

  return {
    registerDevice: registerDevice,
    registerUser: registerUser,
    getAllDevices: getAllDevices,
    getDevicesByUserName: getDevicesByUserName,
    getAllUsers: getAllUsers,
    loginByDevice: loginByDevice,
    getUserById: getUserById,
    getUserByName: getUserByName,
  };
};
