const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { uploadFileToIPFS } = require('../services/ipfsService');

router.post('/test-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được gửi lên' });
    }
    const cid = await uploadFileToIPFS(req.file.path);
    res.json({ cid, url: `https://gateway.pinata.cloud/ipfs/${cid}` });
  } catch (err) {
    console.error('Lỗi upload IPFS:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;