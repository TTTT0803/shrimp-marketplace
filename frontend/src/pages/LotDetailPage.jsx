import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { MapPin } from 'lucide-react';
import { Fish } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import { Calendar } from 'lucide-react';
import { Package } from 'lucide-react';
import { Video } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { Wallet } from 'lucide-react';
import { User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import contractJson from '../contracts/ShrimpEscrow.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function getStatusBadgeClass(status) {
  const base = 'text-xs font-semibold px-2.5 py-1 rounded-full';

  if (status === 'LISTED') {
    return base + ' bg-green-100 text-green-700';
  }

  if (status === 'LOCKED') {
    return base + ' bg-amber-100 text-amber-700';
  }

  if (status === 'COMPLETED') {
    return base + ' bg-slate-100 text-slate-600';
  }

  return base + ' bg-slate-100 text-slate-500';
}

function isFreshQuality(quality) {
  if (!quality) {
    return false;
  }

  const lower = quality.toLowerCase();
  const hasTuoi = lower.indexOf('tuoi') !== -1;
  const hasKhong = lower.indexOf('khong') !== -1;

  return hasTuoi && !hasKhong;
}

function formatWallet(addr) {
  if (!addr) {
    return '';
  }

  return addr.slice(0, 8) + '...' + addr.slice(-6);
}

export default function LotDetailPage() {
  const params = useParams();
  const lotId = params.id;
  const auth = useAuth();
  const user = auth.user;
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
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

  async function handleDeposit() {
    setError('');
    setSuccess('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (!window.ethereum) {
      setError('Vui long cai dat MetaMask truoc');
      return;
    }

    setDepositing(true);

    try {
      const dataRes = await api.get('/lots/' + lotId + '/deposit-data');
      const depositData = dataRes.data;

      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractJson.abi,
        signer
      );

      const priceInWei = ethers.parseEther(String(depositData.price));

      const tx = await contract.deposit(lotId, {
        value: priceInWei
      });

      await tx.wait();

      await api.post('/lots/' + lotId + '/confirm-deposit', {
        transactionHash: tx.hash
      });

      setSuccess('Dat coc thanh cong! Don hang da duoc tao.');

      fetchLot();
    } catch (err) {
      let msg = 'Dat coc that bai';

      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      } else if (err.reason) {
        msg = err.reason;
      } else if (err.message) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setDepositing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 size={32} className="animate-spin mb-3" />
        <p>Dang tai thong tin lo hang...</p>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="text-center py-24 text-slate-400">
        <AlertCircle size={48} className="mx-auto mb-3" />
        <p>Khong tim thay lo hang</p>
      </div>
    );
  }

  const aiAnalysis = lot.aiAnalysis;
  const ipfsMetadata = lot.ipfsMetadata;
  const onChain = lot.onChain;
  const farmer = lot.farmer;

  let quality = null;

  if (aiAnalysis) {
    quality = aiAnalysis.quality_grade;
  }

  const fresh = isFreshQuality(quality);

  let qualityColorClass = 'text-amber-600';

  if (fresh) {
    qualityColorClass = 'text-green-600';
  }

  let buyerAddress = null;

  if (onChain) {
    buyerAddress = onChain.buyer;
  }

  const emptyAddress =
    '0x0000000000000000000000000000000000000000';

  const hasBuyer =
    Boolean(buyerAddress) && buyerAddress !== emptyAddress;

  let priceLabel = 'Lien he';

  if (lot.price) {
    const currency = lot.currency || 'ETH';
    priceLabel = lot.price + ' ' + currency;
  }

  let confidencePercent = '0';

  if (aiAnalysis) {
    confidencePercent = (aiAnalysis.confidence * 100).toFixed(0);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="h-56 bg-gradient-to-br from-ocean-500 to-primary-600 flex items-center justify-center">
            <Fish className="text-white/30" size={96} />
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-slate-800">
                {lot.title}
              </h1>

              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {lot.lot_code}
              </span>
            </div>

            <p className="text-slate-500 mb-4">
              {lot.shrimp_type}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500">

              <div className="flex items-center gap-1.5">
                <MapPin size={15} />
                <span>
                  {lot.origin || 'Chua cap nhat'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar size={15} />
                <span>
                  {lot.harvest_date || 'Chua cap nhat'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Package size={15} />
                <span>
                  {lot.quantity} {lot.unit}
                </span>
              </div>

            </div>

            {lot.description ? (
              <p className="text-slate-600 mt-4 text-sm leading-relaxed">
                {lot.description}
              </p>
            ) : null}
          </div>
        </div>

        {aiAnalysis ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary-600" />
              <span>Ket qua kiem dinh AI</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">
                  So luong dem duoc
                </p>

                <p className="text-lg font-bold text-slate-800">
                  {aiAnalysis.shrimp_count} con
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">
                  Chat luong
                </p>

                <p className={'text-lg font-bold ' + qualityColorClass}>
                  {quality}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">
                  Do tin cay
                </p>

                <p className="text-lg font-bold text-slate-800">
                  {confidencePercent}%
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">
                  Model
                </p>

                <p className="text-sm font-medium text-slate-700 truncate">
                  {aiAnalysis.model_name}
                </p>
              </div>

            </div>
          </div>
        ) : null}

        {ipfsMetadata ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6">

            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Video size={20} className="text-primary-600" />
              <span>Bang chung goc (IPFS)</span>
            </h2>

            <p className="text-sm text-slate-500 mb-3">
              Video/anh goc duoc luu bat bien tren mang phi tap trung IPFS.
              Ma CID:
            </p>

            <code className="block bg-slate-50 text-xs text-slate-600 px-3 py-2 rounded-lg break-all mb-3">
              {ipfsMetadata.cid}
            </code>

            <a
              href={lot.ipfsVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary-600 font-medium text-sm hover:underline"
            >
              <span>Xem file goc tren IPFS</span>
              <ExternalLink size={14} />
            </a>

          </div>
        ) : null}

        {onChain ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6">

            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Wallet size={20} className="text-primary-600" />
              <span>Trang thai tren Blockchain</span>
            </h2>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">
                  Trang thai on-chain
                </span>

                <span className="font-medium text-slate-800">
                  {onChain.status}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">
                  Vi nguoi ban
                </span>

                <span className="font-mono text-xs text-slate-700">
                  {formatWallet(onChain.farmer)}
                </span>
              </div>

              {hasBuyer ? (
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">
                    Vi nguoi mua
                  </span>

                  <span className="font-mono text-xs text-slate-700">
                    {formatWallet(buyerAddress)}
                  </span>
                </div>
              ) : null}

            </div>
          </div>
        ) : null}

      </div>

      <div className="space-y-6">

        <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">

          <p className="text-sm text-slate-400 mb-1">
            Gia ban
          </p>

          <p className="text-3xl font-bold text-primary-600 mb-4">
            {priceLabel}
          </p>

          <div className="flex items-center gap-2 mb-2">
            <span className={getStatusBadgeClass(lot.status)}>
              {lot.status}
            </span>
          </div>

          {error ? (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs px-3 py-2.5 rounded-lg mb-3">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {success ? (
            <div className="flex items-center gap-2 bg-green-50 text-green-600 text-xs px-3 py-2.5 rounded-lg mb-3">
              <CheckCircle2 size={14} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          ) : null}

          {lot.status === 'LISTED' ? (
            <button
              type="button"
              onClick={handleDeposit}
              disabled={depositing}
              className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {depositing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Wallet size={18} />
              )}

              <span>
                {depositing
                  ? 'Dang xu ly...'
                  : 'Dat coc mua ngay'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full bg-slate-100 text-slate-400 font-medium py-3 rounded-lg cursor-not-allowed"
            >
              Khong kha dung de dat coc
            </button>
          )}

          <p className="text-xs text-slate-400 mt-3 text-center">
            Tien se duoc khoa an toan trong Smart Contract cho den khi ban
            xac nhan da nhan hang
          </p>

        </div>

        {farmer ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6">

            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Nguoi ban
            </h3>

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User size={18} className="text-primary-600" />
              </div>

              <div>
                <p className="font-medium text-slate-800 text-sm">
                  {farmer.full_name}
                </p>

                <p className="text-xs text-slate-400">
                  {farmer.company || 'Chua cap nhat cong ty'}
                </p>
              </div>

            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}