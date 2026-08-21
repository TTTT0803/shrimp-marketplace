require('dotenv').config();
const { getLotOnChain } = require('./src/services/blockchainService');

(async () => {
  try {
    const lot = await getLotOnChain(1); // lotId = 1, chua co du lieu nen se ra gia tri rong/default
    console.log('Du lieu lo hang tren chain:', lot);
  } catch (err) {
    console.error('Loi:', err.message);
  }
})();