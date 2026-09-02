const { Review, Order, ShrimpLot } = require('../models');

// Buyer tao danh gia cho don hang da COMPLETED
exports.createReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating phai tu 1 den 5 sao' });
    }

    const order = await Order.findOne({
      where: { id: orderId, buyer_id: req.user.id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Khong tim thay don hang hoac ban khong co quyen' });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Chi co the danh gia sau khi don hang da hoan tat' });
    }

    const existingReview = await Review.findOne({ where: { order_id: orderId } });
    if (existingReview) {
      return res.status(400).json({ error: 'Ban da danh gia don hang nay roi' });
    }

    const review = await Review.create({
      order_id: orderId,
      buyer_id: req.user.id,
      rating,
      comment: comment || null,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xem danh gia cua 1 don hang cu the
exports.getReviewByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const review = await Review.findOne({
      where: { order_id: orderId },
      include: [{ model: require('../models').User, as: 'buyer', attributes: ['id', 'full_name'] }],
    });

    if (!review) return res.status(404).json({ error: 'Don hang nay chua co danh gia' });

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xem tat ca danh gia cua 1 lo hang (thong qua cac don hang cua lo do)
exports.getReviewsByLot = async (req, res) => {
  try {
    const { lotId } = req.params;

    const orders = await Order.findAll({
      where: { lot_id: lotId },
      include: [
        {
          model: Review,
          as: 'review',
          required: true, // chi lay don da co review
          include: [{ model: require('../models').User, as: 'buyer', attributes: ['id', 'full_name'] }],
        },
      ],
    });

    const reviews = orders.map((o) => o.review);

    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({
      averageRating: avgRating,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};