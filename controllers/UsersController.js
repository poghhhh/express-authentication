const { User } = require('../models');
const dto = require('lodash');
const minioClient = require('../services/minio');
const userResponseModel = require('../DTOs/usersDTOs/userResponseDTO');

// Controller to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    // Map over the users array and pick only the required properties using lodash(dto)
    const filteredUsers = users.map((user) =>
      dto.pick(user, Object.values(userResponseModel))
    );

    // Return the filteredUsers array in the response
    res.json(filteredUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller to get a single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Pick only the required properties using lodash(dto)
    const filteredUser = dto.pick(user, Object.values(userResponseModel));

    // Return the filteredUser object in the response
    res.json(filteredUser);
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller to update a user
exports.updateUser = async (req, res) => {
  const { username, email, name, date_of_birth } = req.body;
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update(req.body);

    // Pick only the required properties using lodash(dto)
    const filteredUser = dto.pick(user, Object.values(userResponseModel));

    // Return the filteredUser object in the response
    res.json(filteredUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateAvatar = async (req, res) => {
  const base64Data = req.body.avatar;
  try {
    var bucketName = 'cleanning-duty';
    // Decode the base64 string into binary data
    var imageData = Buffer.from(base64Data, 'base64');

    // Upload the temporary file to MinIO
    minioClient.fPutObject(
      bucketName,
      app.locals.current_user.username + Date.now() + '.jpg',
      imageData,
      function (err, etag) {
        if (err) {
          return console.log(err);
        }
        console.log('File uploaded successfully.');
      }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
