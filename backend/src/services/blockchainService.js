const { ethers } = require('ethers');
const contractJson = require('../contracts/ShrimpEscrow.json');

const RPC_URL = process.env.AMOY_RPC_URL || 'http://127.0.0.1:8545';
const CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Contract instance chi doc (khong can private key) - dung de doc du lieu on-chain
const readContract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, provider);

exports.getLotOnChain = async (lotId) => {
  const lot = await readContract.getLot(lotId);
  return {
    farmer: lot.farmer,
    buyer: lot.buyer,
    cid: lot.cid,
    quantity: lot.quantity.toString(),
    price: ethers.formatEther(lot.price),
    lockedAt: Number(lot.lockedAt),
    status: ["Listed", "Locked", "Released", "Refunded"][Number(lot.status)],
  };
};