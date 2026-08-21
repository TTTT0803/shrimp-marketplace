require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const contractJson = require('./src/contracts/ShrimpEscrow.json');

// Van dung private key Buyer (Account #1) - chi Buyer moi duoc goi confirmReceived
const BUYER_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const BUYER_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IkJVWUVSIiwiaWF0IjoxNzg3MjkxNjA3LCJleHAiOjE3ODc4OTY0MDd9.XbyyY2L3kvKAKghEKShqt2EMRT_XQFZpqBHaXEtCk68";
const LOT_ID = 1;
const ORDER_ID = 1; // lay tu ket qua tra ve o buoc deposit

const RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Kiem tra so du Farmer TRUOC khi confirm
  const farmerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Account #0
  const balanceBefore = await provider.getBalance(farmerAddress);
  console.log("So du Farmer TRUOC:", ethers.formatEther(balanceBefore), "ETH");

  const wallet = new ethers.Wallet(BUYER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, wallet);

  const tx = await contract.confirmReceived(LOT_ID);
  console.log("Da gui giao dich xac nhan nhan hang...");
  await tx.wait();
  console.log("Xac nhan thanh cong! Hash:", tx.hash);

  // Kiem tra so du Farmer SAU khi confirm
  const balanceAfter = await provider.getBalance(farmerAddress);
  console.log("So du Farmer SAU:", ethers.formatEther(balanceAfter), "ETH");

  const confirmRes = await axios.post(
    `http://localhost:5000/lots/orders/${ORDER_ID}/confirm-received`,
    { transactionHash: tx.hash },
    { headers: { Authorization: `Bearer ${BUYER_JWT_TOKEN}` } }
  );
  console.log("Ket qua tu backend:", confirmRes.data);
}

main().catch((err) => console.error("Loi:", err.response?.data || err.message));