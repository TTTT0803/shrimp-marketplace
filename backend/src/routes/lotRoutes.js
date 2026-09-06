const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('../middlewares/authMiddleware');
const {
  createLot,
  uploadAndAnalyze,
  getListingData,
  confirmListing,
  getDepositData,
  confirmDeposit,
  confirmReceivedOrder,
  listLots,
  getLotDetail,
  getMyLots,
} = require('../controllers/lotController');

// Route cu the phai dat TRUOC route tong quat /:lotId
router.get('/my-lots', auth, getMyLots);
router.get('/', listLots);
router.post('/', auth, createLot);

router.post('/orders/:orderId/confirm-received', auth, confirmReceivedOrder);

router.post('/:lotId/upload', auth, upload.single('file'), uploadAndAnalyze);
router.get('/:lotId/listing-data', auth, getListingData);
router.post('/:lotId/confirm-listing', auth, confirmListing);
router.get('/:lotId/deposit-data', auth, getDepositData);
router.post('/:lotId/confirm-deposit', auth, confirmDeposit);

// Route tong quat /:lotId phai dat CUOI CUNG
router.get('/:lotId', getLotDetail);

module.exports = router;