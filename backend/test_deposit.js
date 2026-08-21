require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const contractJson = require('./src/contracts/ShrimpEscrow.json');

// Private key Account #1 (dong vai Buyer)
const BUYER_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const BUYER_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IkJVWUVSIiwiaWF0IjoxNzg3MjkxNjA3LCJleHAiOjE3ODc4OTY0MDd9.XbyyY2L3kvKAKghEKShqt2EMRT_XQFZpqBHaXEtCk68";
const LOT_ID = 1;

const RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;

async function main() {
  const dataRes = await axios.get(`http://localhost:5000/lots/${LOT_ID}/deposit-data`, {
    headers: { Authorization: `Bearer ${BUYER_JWT_TOKEN}` },
  });
  const depositData = dataRes.data;
  console.log("Du lieu deposit:", depositData);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(BUYER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, wallet);

  const priceInWei = ethers.parseEther(depositData.price.toString());
  const tx = await contract.deposit(LOT_ID, { value: priceInWei });
  console.log("Da gui giao dich dat coc...");
  await tx.wait();
  console.log("Dat coc thanh cong! Hash:", tx.hash);

  const confirmRes = await axios.post(
    `http://localhost:5000/lots/${LOT_ID}/confirm-deposit`,
    { transactionHash: tx.hash },
    { headers: { Authorization: `Bearer ${BUYER_JWT_TOKEN}` } }
  );
  console.log("Ket qua tu backend:", confirmRes.data);
}

main().catch((err) => console.error("Loi:", err.response?.data || err.message));