const { verifyMessage } = require('ethers');
const User = require('../models/User');

const nonceStore = {};

exports.getNonce = (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'Thiếu địa chỉ ví' });

  const nonce = Math.floor(Math.random() * 1000000).toString();
  nonceStore[address.toLowerCase()] = nonce;
  res.json({ nonce });
};

exports.verifySignature = async (req, res) => {
  try {
    const { address, signature } = req.body;
    const nonce = nonceStore[address.toLowerCase()];

    if (!nonce) {
      return res.status(400).json({ error: 'Không tìm thấy nonce, hãy lấy nonce trước' });
    }

    const message = `Xác thực ví với nonce: ${nonce}`;

    // ✅ ethers v6: gọi thẳng verifyMessage, không qua ethers.utils
    const recovered = verifyMessage(message, signature);

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Chữ ký không hợp lệ' });
    }

    await User.update(
      { wallet_address: address },
      { where: { id: req.user.id } }
    );

    delete nonceStore[address.toLowerCase()];
    res.json({ success: true, wallet_address: address });
  } catch (err) {
    console.error('LỖI VERIFY WALLET:', err);
    res.status(500).json({ error: err.message });
  }
};