'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CleaningDuty extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CleaningDuty.init({
    cleaner_id: DataTypes.INTEGER,
    assign_date: DataTypes.DATE,
    cleaning_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'CleaningDuty',
  });
  return CleaningDuty;
};