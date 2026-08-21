const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BlockchainRecord = sequelize.define('BlockchainRecord', {
  lot_id: DataTypes.BIGINT,
  network: DataTypes.STRING,
  smart_contract: DataTypes.STRING,
  transaction_hash: DataTypes.STRING,
  block_number: DataTypes.BIGINT,
  metadata_hash: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED'),
    defaultValue: 'PENDING',
  },
}, { tableName: 'blockchain_records', timestamps: false });

module.exports = BlockchainRecord;