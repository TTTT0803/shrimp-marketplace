const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.uploadFileToIPFS = async (filePath) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      },
    }
  );

  return response.data.IpfsHash; // đây là CID
};