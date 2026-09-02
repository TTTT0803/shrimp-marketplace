const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  full_name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: DataTypes.STRING,
  role: DataTypes.ENUM('ADMIN','FARMER','BUYER'),
  wallet_address: DataTypes.STRING,
  phone: DataTypes.STRING,
  company: DataTypes.STRING,
  country: DataTypes.STRING,
  is_locked: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'users', timestamps: false });

module.exports = User;