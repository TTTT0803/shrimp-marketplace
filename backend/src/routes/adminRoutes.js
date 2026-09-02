const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');
const {
  getAnalytics,
  listUsers,
  lockUser,
  unlockUser,
  listAllLots,
  hideLot,
  unhideLot,
} = require('../controllers/adminController');

// Tat ca route trong file nay deu yeu cau: da dang nhap (auth) VA la Admin (isAdmin)
router.get('/analytics', auth, isAdmin, getAnalytics);

router.get('/users', auth, isAdmin, listUsers);
router.post('/users/:userId/lock', auth, isAdmin, lockUser);
router.post('/users/:userId/unlock', auth, isAdmin, unlockUser);

router.get('/lots', auth, isAdmin, listAllLots);
router.post('/lots/:lotId/hide', auth, isAdmin, hideLot);
router.post('/lots/:lotId/unhide', auth, isAdmin, unhideLot);

module.exports = router;