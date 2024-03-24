const admin = require('firebase-admin');

const serviceAccount = require('../keys/cleaning-duty-project-firebase-adminsdk-9awfw-55dcb4ad14.json');

// Khởi tạo Firebase Admin SDK với thông tin xác thực
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
