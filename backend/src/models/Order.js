const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  lot_id: DataTypes.BIGINT,
  buyer_id: DataTypes.BIGINT,
  quantity: DataTypes.DECIMAL(10, 2),
  total_amount: DataTypes.DECIMAL(15, 2),
  currency: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('PENDING', 'ESCROW', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
}, { tableName: 'orders', timestamps: false });

module.exports = Order;