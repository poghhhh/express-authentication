'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CleaningDuty extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CleaningDuty.belongsTo(models.User, {
        foreignKey: 'cleaner_id',
        as: 'cleaner', // Alias to refer to the User model
      });
    }
  }
  CleaningDuty.init(
    {
      cleaner_id: DataTypes.INTEGER,
      assign_date: DataTypes.DATE,
      cleaning_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'CleaningDuty',
    }
  );
  return CleaningDuty;
};
