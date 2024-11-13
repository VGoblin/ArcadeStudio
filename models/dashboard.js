'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dashboard  extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Dashboard.init({
    title: DataTypes.STRING,
    subTitle: DataTypes.STRING,
    backgroundUrl: DataTypes.STRING,
    backgroundType: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Dashboard',
  });
  return Dashboard;
};