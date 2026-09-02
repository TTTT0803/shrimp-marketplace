const ShrimpLot = require('./ShrimpLot');
const AiAnalysis = require('./AiAnalysis');
const IpfsMetadata = require('./IpfsMetadata');
const BlockchainRecord = require('./BlockchainRecord');
const Order = require('./Order');
const EscrowTransaction = require('./EscrowTransaction');
const User = require('./User');

// 1 lo hang co nhieu ban ghi AI (moi lan phan tich), nhung o day ta chi lay 1-1 don gian
ShrimpLot.hasOne(AiAnalysis, { foreignKey: 'lot_id', as: 'aiAnalysis' });
AiAnalysis.belongsTo(ShrimpLot, { foreignKey: 'lot_id' });

ShrimpLot.hasOne(IpfsMetadata, { foreignKey: 'lot_id', as: 'ipfsMetadata' });
IpfsMetadata.belongsTo(ShrimpLot, { foreignKey: 'lot_id' });

ShrimpLot.hasMany(BlockchainRecord, { foreignKey: 'lot_id', as: 'blockchainRecords' });
BlockchainRecord.belongsTo(ShrimpLot, { foreignKey: 'lot_id' });

ShrimpLot.hasMany(Order, { foreignKey: 'lot_id', as: 'orders' });
Order.belongsTo(ShrimpLot, { foreignKey: 'lot_id' });

Order.hasOne(EscrowTransaction, { foreignKey: 'order_id', as: 'escrowTransaction' });
EscrowTransaction.belongsTo(Order, { foreignKey: 'order_id' });

Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
ShrimpLot.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

module.exports = {
  ShrimpLot,
  AiAnalysis,
  IpfsMetadata,
  BlockchainRecord,
  Order,
  EscrowTransaction,
  User,
};