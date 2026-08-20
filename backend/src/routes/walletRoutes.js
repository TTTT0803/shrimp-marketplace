const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { getNonce, verifySignature } = require('../controllers/walletController');

router.get('/nonce', getNonce);
router.post('/verify', auth, verifySignature);

module.exports = router;