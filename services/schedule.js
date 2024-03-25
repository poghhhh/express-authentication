const schedule = require('node-schedule');

const { sendNotification } = require('./notification');

schedule.scheduleJob('0 17 * * *', function () {
  sendNotification();
});

console.log('Chức năng nhắc nhở đã được lên lịch!');
