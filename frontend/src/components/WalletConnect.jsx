import { useState, useEffect } from 'react';
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import api from '../services/api';

export default function WalletConnect({ currentWalletAddress, onLinked }) {
  const { address, connecting, error: walletError, connect, getSigner } = useWallet();
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linked, setLinked] = useState(!!currentWalletAddress);

  useEffect(() => {
    setLinked(!!currentWalletAddress);
  }, [currentWalletAddress]);

  const handleConnect = async () => {
    setLinkError('');
    const acc = await connect();
    if (!acc) return;

    try {
      setLinking(true);

      // 1. Lay nonce tu backend
      const nonceRes = await api.get(`/wallet/nonce?address=${acc}`);
      const { nonce } = nonceRes.data;

      // 2. Ky message bang MetaMask
      const signer = await getSigner();
      const message = `Xac thuc vi voi nonce: ${nonce}`;
      const signature = await signer.signMessage(message);

      // 3. Gui len backend verify
      const verifyRes = await api.post('/wallet/verify', { address: acc, signature });

      if (verifyRes.data.success) {
        setLinked(true);
        onLinked?.(acc);
      }
    } catch (err) {
      setLinkError(err.response?.data?.error || err.message || 'Lien ket vi that bai');
    } finally {
      setLinking(false);
    }
  };

  if (linked) {
    return (
      <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg text-sm">
        <CheckCircle2 size={18} />
        Ví đã liên kết: {(currentWalletAddress || address)?.slice(0, 6)}...{(currentWalletAddress || address)?.slice(-4)}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={connecting || linking}
        className="flex items-center gap-2 bg-orange-500 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
      >
        {connecting || linking ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {connecting ? 'Đang kết nối...' : 'Đang xác thực...'}
          </>
        ) : (
          <>
            <Wallet size={18} />
            Kết nối ví MetaMask
          </>
        )}
      </button>

      {(walletError || linkError) && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <AlertCircle size={14} />
          {walletError || linkError}
        </div>
      )}
    </div>
  );
}