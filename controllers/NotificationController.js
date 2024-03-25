const FireBase = require('../services/firebase');
const { DeviceToken, CleaningDuty } = require('../models');
const { Op } = require('sequelize');

exports.sendNotification = async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];

    const user = await CleaningDuty.findOne({
      where: {
        // So sánh chỉ ngày của trường assign_date với ngày hiện tại
        assign_date: {
          [Op.eq]: currentDate,
        },
      },
    });
    if (!user) {
      res.status(200).json({ message: 'No user on duty today' });
      return;
    }

    const deviceTokens = await DeviceToken.findAll({
      where: {
        user_id: user.id,
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
