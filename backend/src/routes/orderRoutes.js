const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { getMyOrders, getOrderDetail } = require('../controllers/orderController');

router.get('/my-orders', auth, getMyOrders);
router.get('/:orderId', auth, getOrderDetail);

module.exports = router;