const ShrimpLot = require('../models/ShrimpLot');
const AiAnalysis = require('../models/AiAnalysis');
const IpfsMetadata = require('../models/IpfsMetadata');
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