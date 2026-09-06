const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EscrowTransaction = sequelize.define('EscrowTransaction', {
  order_id: DataTypes.BIGINT,
  contract_address: DataTypes.STRING,
  tx_lock: DataTypes.STRING,
  tx_release: DataTypes.STRING,
  escrow_amount: DataTypes.DECIMAL(15, 2),
  gas_fee: DataTypes.DECIMAL(15, 6),
  network: DataTypes.STRING,
  status: DataTypes.ENUM('LOCKED', 'RELEASED', 'REFUNDED'),
  locked_at: DataTypes.DATE,
  released_at: DataTypes.DATE,
}, { tableName: 'escrow_transactions', timestamps: false });

module.exports = EscrowTransaction;