const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IpfsMetadata = sequelize.define('IpfsMetadata', {
  lot_id: DataTypes.BIGINT,
  cid: DataTypes.STRING,
  metadata_uri: DataTypes.TEXT,
  video_cid: DataTypes.STRING,
  image_cid: DataTypes.STRING,
}, { tableName: 'ipfs_metadata', timestamps: false });

module.exports = IpfsMetadata;