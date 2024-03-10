'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.CleaningDuty, {
        foreignKey: 'cleaner_id', // Use the correct foreign key here
        as: 'cleaningDuties', // Alias to refer to the CleaningDuty model
      });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      date_of_birth: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar_url: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      refresh_token: DataTypes.STRING,
      is_admin: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
