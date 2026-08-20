const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.analyzeMedia = async (filePath, originalFilename) => {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath), originalFilename);

  const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
    maxBodyLength: Infinity,
    headers: formData.getHeaders(),
    timeout: 120000,
  });

  return response.data;
};