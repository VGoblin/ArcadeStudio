'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AiImage  extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  AiImage.init({
    userId: DataTypes.INTEGER,
    imageId: DataTypes.INTEGER,
    projectId: DataTypes.INTEGER,
    order: DataTypes.INTEGER,
    prompt: DataTypes.STRING,
    visible: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'AiImage',
  });
  return AiImage;
};