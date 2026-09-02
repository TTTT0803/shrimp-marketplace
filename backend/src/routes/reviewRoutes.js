const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { createReview, getReviewByOrder, getReviewsByLot } = require('../controllers/reviewController');

router.post('/orders/:orderId', auth, createReview);
router.get('/orders/:orderId', getReviewByOrder);
router.get('/lots/:lotId', getReviewsByLot);

module.exports = router;