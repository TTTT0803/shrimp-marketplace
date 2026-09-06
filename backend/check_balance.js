const { ethers } = require('ethers');

const RPC_URL = 'http://127.0.0.1:8545';
const FARMER_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const BUYER_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const farmerBalance = await provider.getBalance(FARMER_ADDRESS);
  const buyerBalance = await provider.getBalance(BUYER_ADDRESS);

  console.log('So du Farmer:', ethers.formatEther(farmerBalance), 'ETH');
  console.log('So du Buyer:', ethers.formatEther(buyerBalance), 'ETH');
}

main();