const FireBase = require('../services/firebase');
const { DeviceToken } = require('../models');

exports.sendNotification = async (req, res) => {
  try {
    const userId = req.app.locals.current_user.id;

    const deviceTokens = await DeviceToken.findAll({
      where: {
        user_id: userId,
      },
    });

    const messages = deviceTokens.map((deviceToken) => {
      return {
        notification: {
          title: 'Nhắc nhở trực nhật',
          body: 'Hôm nay là ngày trực nhật của bạn , hãy nhớ đổ rác đúng giờ nhé !',
        },
        token: deviceToken.device_token,
      };
    });

    const responses = await Promise.all(
      messages.map((message) => FireBase.messaging().send(message))
    );
    console.log('Successfully sent messages:', responses);

    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.log('Error sending messages:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
};
