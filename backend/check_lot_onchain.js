require('dotenv').config();
const { ethers } = require('ethers');
const contractJson = require('./src/contracts/ShrimpEscrow.json');

const RPC_URL = 'http://127.0.0.1:8545';
const CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;
const LOT_ID = 1; // doi thanh lotId ban muon kiem tra

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, provider);

  const lot = await contract.getLot(LOT_ID);
  console.log('Farmer tren chain:', lot.farmer);
  console.log('Buyer tren chain:', lot.buyer);
  console.log('Status tren chain (so):', lot.status.toString());
  console.log('Gia (wei):', lot.price.toString());

  // Kiem tra so du dung theo dia chi that tren chain
  const farmerBalance = await provider.getBalance(lot.farmer);
  const buyerBalance = await provider.getBalance(lot.buyer);
  console.log('So du Farmer (dia chi tren chain):', ethers.formatEther(farmerBalance), 'ETH');
  console.log('So du Buyer (dia chi tren chain):', ethers.formatEther(buyerBalance), 'ETH');
}

main().catch(console.error);