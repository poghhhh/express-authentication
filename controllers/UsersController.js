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
    res.json({
      message: 'Get user information successfully',
      data: filteredUser,
    });
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller to update a user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.app.locals.current_user.id);

    await user.update(req.body);

    // Pick only the required properties using lodash(dto)
    const filteredUser = dto.pick(user, Object.values(userResponseModel));

    // Return the filteredUser object in the response
    res.json({ message: 'User updated successfully', data: filteredUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    // Check if avatar data exists in the request body
    if (!req.body || !req.body.avatar) {
      return res.status(400).json({ message: 'Avatar data is missing' });
    }

    const base64Data = req.body.avatar;
    var bucketName = 'cleanning-duty';
    // Decode the base64 string into binary data
    const imageData = new Buffer.from(
      base64Data.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    const type = base64Data.split(';')[0].split('/')[1];
    const objectName =
      req.app.locals.current_user.username + Date.now() + '.jpg';
    var metaData = {
      ContentEncoding: 'base64',
      ContentType: `image/${type}`,
    };
    // Upload the temporary file to MinIO
    minioClient.putObject(
      bucketName,
      objectName,
      imageData,
      metaData,
      async function (err, etag) {
        if (err) {
          console.error('Error uploading file:', err);
          return res.status(500).json({ message: 'Failed to upload file' });
        }
        console.log('File uploaded successfully.');
        const avatar_url = `http://${process.env.ENDPOINT}:${process.env.MINIO_PORT}/cleanning-duty/${objectName}`;

        // Update the user's avatar_url in the database
        const user = await User.findByPk(req.app.locals.current_user.id);
        user.update({ avatar_url: avatar_url });

        res.status(200).json({
          message: 'Avatar updated successfully',
          data: { avatar_url: avatar_url },
        });
      }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
