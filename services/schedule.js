const schedule = require('node-schedule');

const { sendNotification } = require('../controllers/NotificationController'); // Đường dẫn đến controller gửi thông báo

// Lên lịch gửi thông báo vào 5 giờ chiều hàng ngày
schedule.scheduleJob('0 17 * * *', function () {
  sendNotification(); // Gọi hàm gửi thông báo từ controller
});

console.log('Chức năng nhắc nhở đã được lên lịch!');
