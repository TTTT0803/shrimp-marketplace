const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AiAnalysis = sequelize.define('AiAnalysis', {
  lot_id: DataTypes.BIGINT,
  model_name: DataTypes.STRING,
  model_version: DataTypes.STRING,
  shrimp_count: DataTypes.INTEGER,
  confidence: DataTypes.DECIMAL(5, 2),
  quality_grade: DataTypes.STRING,
  average_size: DataTypes.DECIMAL(10, 2),
  processing_time: DataTypes.DECIMAL(10, 2),
  ai_result: DataTypes.JSON,
}, { tableName: 'ai_analysis', timestamps: false });

module.exports = AiAnalysis;