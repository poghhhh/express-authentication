const { DeviceToken } = require('../models');

exports.savingTokenDevice = async (req, res) => {
  try {
    const userId = req.app.locals.current_user.id;
    const deviceToken = req.body.deviceToken;

    const existingToken = await DeviceToken.findOne({
      where: {
        user_id: userId,
        device_token: deviceToken,
      },
    });

    if (existingToken) {
      return res.status(201).json({ message: 'Device token already exists' });
    }

    await DeviceToken.create({
      user_id: userId,
      device_token: deviceToken,
    });

    res.status(201).json({ message: 'Device token saved' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteTokenDevice = async (req, res) => {
  try {
    const userId = req.app.locals.current_user.id;
    const deviceToken = req.body.deviceToken;

    await DeviceToken.destroy({
      where: {
        user_id: userId,
        device_token: deviceToken,
      },
    });

    res.status(200).json({ message: 'Device token deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
