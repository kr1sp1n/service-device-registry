module.exports = function (data) {

  const userFilter = function (user) {
    return {
      id: user._id,
      name: user.name,
      type: user.type,
    };
  };

  const deviceFilter = function (device) {
    return {
      id: device._id,
      title: device.title,
      user: device.user,
      type: device.type,
    };
  };

  const filters = {
    user: userFilter,
    device: deviceFilter,
  };

  const filterSwitch = function (item) {
    if (filters[item.type]) {
      return filters[item.type](item);
    } else {
      return {};
    }
  };

  if (data.map) {
    return data.map((item) => filterSwitch(item));
  } else {
    return filterSwitch(data);
  }
};
