const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('../middlewares/authMiddleware');
const { createLot, uploadAndAnalyze } = require('../controllers/lotController');

router.post('/', auth, createLot);
router.post('/:lotId/upload', auth, upload.single('file'), uploadAndAnalyze);

module.exports = router;