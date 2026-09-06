import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { Fish, ShieldCheck, Loader2, AlertCircle, CheckCircle2, Rocket } from 'lucide-react';
import api from '../services/api';
import contractJson from '../contracts/ShrimpEscrow.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function FarmerLotDetailPage() {
  const params = useParams();
  const lotId = params.id;

  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLot();
  }, [lotId]);

  async function fetchLot() {
    setLoading(true);
    try {
      const res = await api.get('/lots/' + lotId);
      setLot(res.data);
    } catch (err) {
      setError('Khong tim thay lo hang');
    } finally {
      setLoading(false);
    }
  }

  async function handleListOnChain() {
    setError('');
    setSuccess('');

    if (!window.ethereum) {
      setError('Vui long cai dat MetaMask truoc');
      return;
    }

    setListing(true);

    try {
      const dataRes = await api.get('/lots/' + lotId + '/listing-data');
      const listingData = dataRes.data;

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, signer);

      const priceInWei = ethers.parseEther(String(listingData.price));
      const tx = await contract.createListing(
        listingData.lotId,
        listingData.cid,
        listingData.quantity,
        priceInWei
      );
      await tx.wait();

      await api.post('/lots/' + lotId + '/confirm-listing', { transactionHash: tx.hash });

      setSuccess('Da dang ban thanh cong len Blockchain!');
      fetchLot();
    } catch (err) {
      let msg = 'Dang ban that bai';
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      } else if (err.reason) {
        msg = err.reason;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setListing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 size={32} className="animate-spin mb-3" />
        Dang tai...
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="text-center py-24 text-slate-400">
        <AlertCircle size={48} className="mx-auto mb-3" />
        Khong tim thay lo hang
      </div>
    );
  }

  const aiAnalysis = lot.aiAnalysis;
  const ipfsMetadata = lot.ipfsMetadata;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-ocean-500 to-primary-600 flex items-center justify-center">
          <Fish className="text-white/30" size={64} />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-slate-800">{lot.title}</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {lot.status}
            </span>
          </div>
          <p className="text-slate-500 text-sm">{lot.shrimp_type} - {lot.quantity} {lot.unit}</p>
        </div>
      </div>

      {aiAnalysis ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary-600" />
            Ket qua kiem dinh AI
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">So luong</p>
              <p className="text-lg font-bold text-slate-800">{aiAnalysis.shrimp_count} con</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Chat luong</p>
              <p className="text-lg font-bold text-slate-800">{aiAnalysis.quality_grade}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Do tin cay</p>
              <p className="text-lg font-bold text-slate-800">
                {(aiAnalysis.confidence * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">CID IPFS</p>
              <p className="text-xs font-mono text-slate-600 truncate">
                {ipfsMetadata ? ipfsMetadata.cid : 'Chua co'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-3">Dang ban len Blockchain</h2>
        <p className="text-sm text-slate-500 mb-4">
          Sau khi dang ban, lo hang se hien thi cong khai tren Marketplace va Buyer co the dat coc mua.
        </p>

        {error ? (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="flex items-center gap-2 bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            <CheckCircle2 size={16} />
            {success}
          </div>
        ) : null}

        {lot.status === 'AI_ANALYZED' ? (
          <button
            type="button"
            onClick={handleListOnChain}
            disabled={listing}
            className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {listing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Rocket size={18} />
            )}
            {listing ? 'Dang xu ly...' : 'Dang ban len Blockchain'}
          </button>
        ) : lot.status === 'DRAFT' ? (
          <div className="text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg">
            Lo hang chua duoc AI phan tich. Vui long upload video/anh truoc.
          </div>
        ) : (
          <div className="text-sm text-slate-500 bg-slate-50 px-4 py-3 rounded-lg">
            Lo hang da o trang thai: <strong>{lot.status}</strong>
          </div>
        )}
      </div>
    </div>
  );
}