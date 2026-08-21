const ShrimpLot = require('../models/ShrimpLot');
const AiAnalysis = require('../models/AiAnalysis');
const IpfsMetadata = require('../models/IpfsMetadata');
const BlockchainRecord = require('../models/BlockchainRecord');
const { analyzeMedia } = require('../services/aiService');
const { uploadFileToIPFS } = require('../services/ipfsService');

exports.createLot = async (req, res) => {
  try {
    const { title, shrimp_type, description, quantity, unit, price, currency, harvest_date, origin } = req.body;
    const lot = await ShrimpLot.create({
      farmer_id: req.user.id,
      lot_code: `LOT-${Date.now()}`,
      title, shrimp_type, description, quantity, unit, price, currency, harvest_date, origin,
      status: 'DRAFT',
    });
    res.status(201).json(lot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.uploadAndAnalyze = async (req, res) => {
  try {
    const { lotId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'Chua co file upload' });

    const lot = await ShrimpLot.findByPk(lotId);
    if (!lot) return res.status(404).json({ error: 'Khong tim thay lo hang' });

    // 1. Goi AI service phan tich
    const aiResult = await analyzeMedia(req.file.path, req.file.originalname);

    // 2. Luu ket qua AI vao DB
    await AiAnalysis.create({
      lot_id: lot.id,
      model_name: aiResult.model_name,
      model_version: aiResult.model_version,
      shrimp_count: aiResult.shrimp_count,
      confidence: aiResult.confidence,
      quality_grade: aiResult.quality_grade,
      average_size: aiResult.average_size,
      processing_time: aiResult.processing_time,
      ai_result: aiResult.ai_result,
    });

    // 3. Upload file goc len IPFS
    const cid = await uploadFileToIPFS(req.file.path);
    await IpfsMetadata.create({
      lot_id: lot.id,
      cid,
      metadata_uri: `https://gateway.pinata.cloud/ipfs/${cid}`,
    });

    // 4. Cap nhat trang thai lo hang
    lot.status = 'AI_ANALYZED';
    await lot.save();

    res.json({ lot, aiResult, cid });
  } catch (err) {
    console.error('Loi upload/phan tich:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getListingData = async (req, res) => {
  try {
    const { lotId } = req.params;
    const lot = await ShrimpLot.findByPk(lotId);
    if (!lot) return res.status(404).json({ error: 'Khong tim thay lo hang' });
    if (lot.status !== 'AI_ANALYZED') {
      return res.status(400).json({ error: 'Lo hang chua duoc AI phan tich xong' });
    }

    const ipfs = await IpfsMetadata.findOne({ where: { lot_id: lotId } });
    if (!ipfs) return res.status(400).json({ error: 'Chua co du lieu IPFS cho lo nay' });

    res.json({
      lotId: lot.id,
      cid: ipfs.cid,
      quantity: Math.round(lot.quantity * 100),
      price: lot.price || 1,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmListing = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { transactionHash } = req.body;

    const lot = await ShrimpLot.findByPk(lotId);
    if (!lot) return res.status(404).json({ error: 'Khong tim thay lo hang' });

    await BlockchainRecord.create({
      lot_id: lot.id,
      network: 'Hardhat Local',
      smart_contract: process.env.ESCROW_CONTRACT_ADDRESS,
      transaction_hash: transactionHash,
      status: 'PENDING',
    });

    lot.status = 'LISTED';
    await lot.save();

    res.json({ success: true, lot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const Order = require('../models/Order');
const EscrowTransaction = require('../models/EscrowTransaction');

exports.getDepositData = async (req, res) => {
  try {
    const { lotId } = req.params;
    const lot = await ShrimpLot.findByPk(lotId);
    if (!lot) return res.status(404).json({ error: 'Khong tim thay lo hang' });
    if (lot.status !== 'LISTED') {
      return res.status(400).json({ error: 'Lo hang khong o trang thai LISTED' });
    }

    res.json({
      lotId: lot.id,
      price: lot.price || 1,
      quantity: lot.quantity,
      currency: lot.currency || 'ETH',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmDeposit = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { transactionHash } = req.body;

    const lot = await ShrimpLot.findByPk(lotId);
    if (!lot) return res.status(404).json({ error: 'Khong tim thay lo hang' });

    const order = await Order.create({
      lot_id: lot.id,
      buyer_id: req.user.id,
      quantity: lot.quantity,
      total_amount: lot.price || 1,
      currency: lot.currency || 'ETH',
      status: 'ESCROW',
    });

    await EscrowTransaction.create({
      order_id: order.id,
      contract_address: process.env.ESCROW_CONTRACT_ADDRESS,
      tx_lock: transactionHash,
      escrow_amount: lot.price || 1,
      network: 'Hardhat Local',
      status: 'LOCKED',
      locked_at: new Date(),
    });

    lot.status = 'LOCKED';
    await lot.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmReceivedOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionHash } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Khong tim thay don hang' });

    order.status = 'COMPLETED';
    await order.save();

    const escrowTx = await EscrowTransaction.findOne({ where: { order_id: orderId } });
    escrowTx.tx_release = transactionHash;
    escrowTx.status = 'RELEASED';
    escrowTx.released_at = new Date();
    await escrowTx.save();

    const lot = await ShrimpLot.findByPk(order.lot_id);
    lot.status = 'COMPLETED';
    await lot.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};