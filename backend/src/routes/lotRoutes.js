const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('../middlewares/authMiddleware');
// const { createLot, uploadAndAnalyze } = require('../controllers/lotController');
const { createLot, uploadAndAnalyze, getListingData, confirmListing } = require('../controllers/lotController');
const { getDepositData, confirmDeposit, confirmReceivedOrder } = require('../controllers/lotController');

router.post('/', auth, createLot);
router.post('/:lotId/upload', auth, upload.single('file'), uploadAndAnalyze);
router.get('/:lotId/listing-data', auth, getListingData);
router.post('/:lotId/confirm-listing', auth, confirmListing);
router.get('/:lotId/deposit-data', auth, getDepositData);
router.post('/:lotId/confirm-deposit', auth, confirmDeposit);
router.post('/orders/:orderId/confirm-received', auth, confirmReceivedOrder);
module.exports = router;