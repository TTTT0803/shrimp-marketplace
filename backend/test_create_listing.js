require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const contractJson = require('./src/contracts/ShrimpEscrow.json');

const FARMER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkZBUk1FUiIsImlhdCI6MTc4NzIxNjc3MywiZXhwIjoxNzg3ODIxNTczfQ.9Idgd7i9_uGZTTyL6-vvbwMb9O7K0HjZzYfIQCDGwxM";
const LOT_ID = 1;

const RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;

async function main() {
  const dataRes = await axios.get(`http://localhost:5000/lots/${LOT_ID}/listing-data`, {
    headers: { Authorization: `Bearer ${JWT_TOKEN}` },
  });
  const listingData = dataRes.data;
  console.log("Du lieu listing:", listingData);

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(FARMER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, wallet);

  const priceInWei = ethers.parseEther(listingData.price.toString());
  const tx = await contract.createListing(
    listingData.lotId,
    listingData.cid,
    listingData.quantity,
    priceInWei
  );
  console.log("Da gui giao dich, dang cho xac nhan...");
  await tx.wait();
  console.log("Giao dich thanh cong! Hash:", tx.hash);

  const confirmRes = await axios.post(
    `http://localhost:5000/lots/${LOT_ID}/confirm-listing`,
    { transactionHash: tx.hash },
    { headers: { Authorization: `Bearer ${JWT_TOKEN}` } }
  );
  console.log("Ket qua tu backend:", confirmRes.data);
}

main().catch((err) => console.error("Loi:", err.response?.data || err.message));