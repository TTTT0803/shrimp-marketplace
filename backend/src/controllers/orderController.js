const { Order, ShrimpLot, EscrowTransaction, Review } = require('../models');
exports.getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const where = { buyer_id: req.user.id };
    if (status) where.status = status;

    const orders = await Order.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: ShrimpLot,
          attributes: ['id', 'title', 'shrimp_type', 'lot_code', 'origin'],
        },
        {
          model: EscrowTransaction,
          as: 'escrowTransaction',
        },
        {
          model: Review,
          as: 'review',
        },
      ],
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({
      where: { id: orderId, buyer_id: req.user.id },
      include: [
        { model: ShrimpLot },
        { model: EscrowTransaction, as: 'escrowTransaction' },
      ],
    });

    if (!order) return res.status(404).json({ error: 'Khong tim thay don hang' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};