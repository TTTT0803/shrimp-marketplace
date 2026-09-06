const { User, ShrimpLot, Order, EscrowTransaction } = require('../models');
const { Op } = require('sequelize');

// ==================== THONG KE TONG QUAN ====================

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalFarmers = await User.count({ where: { role: 'FARMER' } });
    const totalBuyers = await User.count({ where: { role: 'BUYER' } });

    const totalLots = await ShrimpLot.count();
    const lotsByStatus = await ShrimpLot.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
    });

    const totalOrders = await Order.count();
    const completedOrders = await Order.count({ where: { status: 'COMPLETED' } });

    // Tong dong tien da giai ngan thanh cong (RELEASED)
    const releasedTransactions = await EscrowTransaction.findAll({
      where: { status: 'RELEASED' },
      attributes: ['escrow_amount'],
    });
    const totalVolume = releasedTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.escrow_amount || 0),
      0
    );

    res.json({
      users: {
        total: totalUsers,
        farmers: totalFarmers,
        buyers: totalBuyers,
      },
      lots: {
        total: totalLots,
        byStatus: lotsByStatus,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
      },
      totalVolumeReleased: totalVolume.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== QUAN LY NGUOI DUNG ====================

exports.listUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] }, // khong bao gio tra ve password
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.lockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Khong tim thay nguoi dung' });

    if (user.role === 'ADMIN') {
      return res.status(400).json({ error: 'Khong the khoa tai khoan Admin' });
    }

    // Vi bang users trong schema chua co cot is_locked, ta them field nay
    // (xem Buoc 5 ben duoi de biet cach them cot vao DB)
    user.is_locked = true;
    await user.save();

    res.json({ success: true, message: `Da khoa tai khoan ${user.email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Khong tim thay nguoi dung' });

    user.is_locked = false;
    await user.save();

    res.json({ success: true, message: `Da mo khoa tai khoan ${user.email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== KIEM DUYET NOI DUNG ====================

exports.listAllLots = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { rows, count } = await ShrimpLot.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'farmer', attributes: ['id', 'full_name', 'email'] }],
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.hideLot = async (req, res) => {
  try {
    const { lotId } = req.params;
    const lot = await ShrimpLot.findByPk(lotId);
    if (!lot) return res.status(404).json({ error: 'Khong tim thay lo hang' });

    // Chi an tren MySQL, khong dong nghia voi viec xoa duoc tren Blockchain
    lot.is_hidden = true;
    await lot.save();

    res.json({ success: true, message: `Da an lo hang ${lot.lot_code}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unhideLot = async (req, res) => {
  try {
    const { lotId } = req.params;
    const lot = await ShrimpLot.findByPk(lotId);
    if (!lot) return res.status(404).json({ error: 'Khong tim thay lo hang' });

    lot.is_hidden = false;
    await lot.save();

    res.json({ success: true, message: `Da hien lai lo hang ${lot.lot_code}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};