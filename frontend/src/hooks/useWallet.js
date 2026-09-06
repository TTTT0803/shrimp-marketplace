import { useState } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = async () => {
    setError(null);
    if (!window.ethereum) {
      setError('Vui long cai dat MetaMask extension truoc');
      return null;
    }
    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      return accounts[0];
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setConnecting(false);
    }
  };

  const getSigner = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner();
  };

  return { address, connecting, error, connect, getSigner };
}