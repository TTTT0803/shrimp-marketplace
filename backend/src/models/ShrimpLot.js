const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShrimpLot = sequelize.define('ShrimpLot', {
  farmer_id: DataTypes.BIGINT,
  lot_code: DataTypes.STRING,
  title: DataTypes.STRING,
  shrimp_type: DataTypes.STRING,
  description: DataTypes.TEXT,
  quantity: DataTypes.DECIMAL(10, 2),
  unit: DataTypes.STRING,
  price: DataTypes.DECIMAL(15, 2),
  currency: DataTypes.STRING,
  harvest_date: DataTypes.DATEONLY,
  origin: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('DRAFT', 'AI_ANALYZED', 'LISTED', 'LOCKED', 'SOLD', 'COMPLETED'),
    defaultValue: 'DRAFT',
  },
}, { tableName: 'shrimp_lots', timestamps: false });

module.exports = ShrimpLot;