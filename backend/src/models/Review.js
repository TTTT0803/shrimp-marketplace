const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  order_id: DataTypes.BIGINT,
  buyer_id: DataTypes.BIGINT,
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  comment: DataTypes.TEXT,
}, { tableName: 'reviews', timestamps: false });

module.exports = Review;