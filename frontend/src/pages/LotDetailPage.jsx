import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  MapPin,
  Fish,
  ShieldCheck,
  Calendar,
  Package,
  Video,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Wallet,
  User,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Database,
  CircleCheck,
  LockKeyhole,
  Building2,
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import contractJson from '../contracts/ShrimpEscrow.json';

const CONTRACT_ADDRESS =
  '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function getStatusBadgeClass(status) {
  const base =
    'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border';

  if (status === 'LISTED') {
    return base + ' bg-emerald-50 text-emerald-600 border-emerald-100';
  }

  if (status === 'LOCKED') {
    return base + ' bg-orange-50 text-orange-600 border-orange-100';
  }

  if (status === 'COMPLETED') {
    return base + ' bg-slate-100 text-slate-600 border-slate-200';
  }

  return base + ' bg-slate-50 text-slate-500 border-slate-100';
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
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    fetchLot();
  }, [lotId]);

  async function fetchLot() {
    setLoading(true);
    setImgFailed(false);

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
      const dataRes = await api.get(
        '/lots/' + lotId + '/deposit-data'
      );

      const depositData = dataRes.data;

      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(
        window.ethereum
      );

      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractJson.abi,
        signer
      );

      const priceInWei = ethers.parseEther(
        String(depositData.price)
      );

      const tx = await contract.deposit(lotId, {
        value: priceInWei,
      });

      await tx.wait();

      await api.post(
        '/lots/' + lotId + '/confirm-deposit',
        {
          transactionHash: tx.hash,
        }
      );

      setSuccess(
        'Dat coc thanh cong! Don hang da duoc tao.'
      );

      fetchLot();
    } catch (err) {
      let msg = 'Dat coc that bai';

      if (
        err.response &&
        err.response.data &&
        err.response.data.error
      ) {
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
      <div className="min-h-[75vh] bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-4">
            <Loader2
              size={30}
              className="animate-spin text-[#4DB3F3]"
            />
          </div>

          <p className="text-sm font-semibold text-[#172A46]">
            Dang tai thong tin lo hang...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Vui long cho trong giay lat
          </p>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-[75vh] bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8 py-12 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle
              size={32}
              className="text-red-400"
            />
          </div>

          <h2 className="text-lg font-bold text-[#172A46]">
            Khong tim thay lo hang
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Lo hang co the da bi xoa hoac khong ton tai.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172A46] text-white text-sm font-semibold hover:bg-[#213B60] transition"
          >
            <ArrowLeft size={16} />
            Quay lai
          </button>
        </div>
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
    qualityColorClass = 'text-[#4DB3F3]';
  }

  let buyerAddress = null;

  if (onChain) {
    buyerAddress = onChain.buyer;
  }

  const emptyAddress =
    '0x0000000000000000000000000000000000000000';

  const hasBuyer =
    Boolean(buyerAddress) &&
    buyerAddress !== emptyAddress;

  let priceLabel = 'Lien he';

  if (lot.price) {
    const currency = lot.currency || 'ETH';
    priceLabel = lot.price + ' ' + currency;
  }

  let confidencePercent = '0';

  if (aiAnalysis) {
    confidencePercent = (
      aiAnalysis.confidence * 100
    ).toFixed(0);
  }

  const showImage = Boolean(lot.ipfsVideoUrl) && !imgFailed;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* BREADCRUMB */}
        <div className="mb-5 flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#4DB3F3] transition"
          >
            <ArrowLeft size={15} />
            Quay lai
          </button>

          <span className="text-slate-300">/</span>

          <span className="text-slate-500">
            Chi tiet lo hang
          </span>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* HERO / LOT INFORMATION */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Hero */}
              <div className="relative h-64 sm:h-72 overflow-hidden bg-[#EAF6FD]">
                {showImage ? (
                  <img
                    src={lot.ipfsVideoUrl}
                    alt={lot.title}
                    onError={() => setImgFailed(true)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-[#4DB3F3]/15" />

                    <div className="absolute -bottom-28 -right-16 w-80 h-80 rounded-full bg-[#FF6B35]/10" />

                    <div className="absolute top-7 right-7 w-3 h-3 rounded-full bg-[#FF6B35]" />

                    <div className="absolute top-12 right-14 w-2 h-2 rounded-full bg-[#4DB3F3]" />

                    <div className="relative h-full flex items-center justify-center">
                      <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center">
                        <Fish
                          size={78}
                          strokeWidth={1.3}
                          className="text-[#4DB3F3]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Top left label */}
                <div className="absolute left-6 top-6 z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-white shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />

                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#172A46]">
                      Shrimp Trading Platform
                    </span>
                  </div>
                </div>
              </div>

              {/* Information */}
              <div className="p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#FF6B35] mb-2">
                      Thong tin lo hang
                    </p>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172A46] leading-tight">
                      {lot.title}
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                      {lot.shrimp_type}
                    </p>
                  </div>

                  <span className="self-start inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500">
                    {lot.lot_code}
                  </span>
                </div>

                {/* Information cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF6FD] flex items-center justify-center mb-3">
                      <MapPin
                        size={18}
                        className="text-[#4DB3F3]"
                      />
                    </div>

                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                      Xuat xu
                    </p>

                    <p className="text-sm font-semibold text-[#172A46] mt-1">
                      {lot.origin || 'Chua cap nhat'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                      <Calendar
                        size={18}
                        className="text-[#FF6B35]"
                      />
                    </div>

                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                      Ngay thu hoach
                    </p>

                    <p className="text-sm font-semibold text-[#172A46] mt-1">
                      {lot.harvest_date || 'Chua cap nhat'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF6FD] flex items-center justify-center mb-3">
                      <Package
                        size={18}
                        className="text-[#4DB3F3]"
                      />
                    </div>

                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                      So luong
                    </p>

                    <p className="text-sm font-semibold text-[#172A46] mt-1">
                      {lot.quantity} {lot.unit}
                    </p>
                  </div>
                </div>

                {lot.description ? (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                      Mo ta
                    </p>

                    <p className="text-sm text-slate-600 leading-7">
                      {lot.description}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* AI ANALYSIS */}
            {aiAnalysis ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EAF6FD] flex items-center justify-center">
                      <Sparkles
                        size={21}
                        className="text-[#4DB3F3]"
                      />
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#172A46]">
                        Ket qua kiem dinh AI
                      </h2>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Phan tich chat luong san pham
                      </p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#4DB3F3] bg-[#EAF6FD] px-3 py-1.5 rounded-full">
                    <ShieldCheck size={14} />
                    AI Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mb-2">
                      So luong dem duoc
                    </p>

                    <p className="text-xl font-extrabold text-[#172A46]">
                      {aiAnalysis.shrimp_count}
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                      con
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mb-2">
                      Chat luong
                    </p>

                    <p
                      className={
                        'text-lg font-extrabold ' +
                        qualityColorClass
                      }
                    >
                      {quality}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mb-2">
                      Do tin cay
                    </p>

                    <p className="text-xl font-extrabold text-[#172A46]">
                      {confidencePercent}%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mb-2">
                      Model
                    </p>

                    <p className="text-sm font-bold text-[#172A46] truncate">
                      {aiAnalysis.model_name}
                    </p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">
                      Muc do tin cay
                    </span>

                    <span className="text-xs font-bold text-[#4DB3F3]">
                      {confidencePercent}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4DB3F3] to-[#70C5F7] transition-all"
                      style={{
                        width: confidencePercent + '%',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* IPFS */}
            {ipfsMetadata ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Database
                      size={21}
                      className="text-[#FF6B35]"
                    />
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#172A46]">
                      Bang chung goc
                    </h2>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Du lieu duoc luu tru tren IPFS
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                      <Video
                        size={17}
                        className="text-[#4DB3F3]"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-slate-500 leading-6">
                        Video/anh goc duoc luu bat bien
                        tren mang phi tap trung IPFS.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mb-2">
                    IPFS CID
                  </p>

                  <code className="block bg-[#172A46] text-[#9DDCFF] text-xs px-4 py-3 rounded-xl break-all">
                    {ipfsMetadata.cid}
                  </code>
                </div>

                <a
                  href={lot.ipfsVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-[#4DB3F3] font-semibold text-sm hover:text-[#2498DD] transition"
                >
                  Xem file goc tren IPFS
                  <ExternalLink size={15} />
                </a>
              </div>
            ) : null}

            {/* BLOCKCHAIN */}
            {onChain ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#EAF6FD] flex items-center justify-center">
                    <LockKeyhole
                      size={21}
                      className="text-[#4DB3F3]"
                    />
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#172A46]">
                      Trang thai Blockchain
                    </h2>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Giao dich duoc xac thuc tren Smart Contract
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-4 bg-[#F8FAFC] border-b border-slate-100">
                    <span className="text-sm text-slate-500">
                      Trang thai on-chain
                    </span>

                    <span className="inline-flex items-center gap-2 text-sm font-bold text-[#172A46]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {onChain.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-4 border-b border-slate-100">
                    <span className="text-sm text-slate-500">
                      Vi nguoi ban
                    </span>

                    <span className="font-mono text-xs text-[#172A46] bg-slate-50 px-3 py-1.5 rounded-lg">
                      {formatWallet(onChain.farmer)}
                    </span>
                  </div>

                  {hasBuyer ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-4">
                      <span className="text-sm text-slate-500">
                        Vi nguoi mua
                      </span>

                      <span className="font-mono text-xs text-[#172A46] bg-slate-50 px-3 py-1.5 rounded-lg">
                        {formatWallet(buyerAddress)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* PURCHASE CARD */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden lg:sticky lg:top-6">
              <div className="h-1.5 bg-gradient-to-r from-[#4DB3F3] to-[#FF6B35]" />

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Gia ban
                  </p>

                  <div className="w-9 h-9 rounded-xl bg-[#EAF6FD] flex items-center justify-center">
                    <Wallet
                      size={18}
                      className="text-[#4DB3F3]"
                    />
                  </div>
                </div>

                <p className="text-3xl sm:text-4xl font-extrabold text-[#172A46] tracking-tight">
                  {priceLabel}
                </p>

                <div className="mt-4">
                  {lot.status === 'LISTED' ? (
                    <span className={getStatusBadgeClass(lot.status)}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      San sang giao dich
                    </span>
                  ) : (
                    <span className={getStatusBadgeClass(lot.status)}>
                      {lot.status}
                    </span>
                  )}
                </div>

                {/* Error */}
                {error ? (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <AlertCircle
                          size={16}
                          className="text-red-500"
                        />
                      </div>

                      <p className="text-xs leading-5 text-red-600">
                        {error}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Success */}
                {success ? (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <CheckCircle2
                          size={16}
                          className="text-emerald-500"
                        />
                      </div>

                      <p className="text-xs leading-5 text-emerald-600">
                        {success}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* CTA */}
                <div className="mt-5">
                  {lot.status === 'LISTED' ? (
                    <button
                      type="button"
                      onClick={handleDeposit}
                      disabled={depositing}
                      className="group w-full bg-[#FF6B35] text-white font-bold py-3.5 rounded-xl hover:bg-[#F45B27] transition-all shadow-sm shadow-orange-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {depositing ? (
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                      ) : (
                        <Wallet size={19} />
                      )}

                      <span>
                        {depositing
                          ? 'Dang xu ly...'
                          : 'Dat coc mua ngay'}
                      </span>

                      {!depositing ? (
                        <ArrowRight
                          size={17}
                          className="group-hover:translate-x-0.5 transition"
                        />
                      ) : null}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full bg-slate-100 text-slate-400 font-semibold py-3.5 rounded-xl cursor-not-allowed"
                    >
                      Khong kha dung de dat coc
                    </button>
                  )}
                </div>

                {/* Escrow information */}
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF6FD] flex items-center justify-center shrink-0">
                      <ShieldCheck
                        size={16}
                        className="text-[#4DB3F3]"
                      />
                    </div>

                    <p className="text-xs leading-5 text-slate-400">
                      Tien se duoc khoa an toan trong
                      Smart Contract cho den khi ban xac
                      nhan da nhan hang.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mini trust footer */}
              <div className="px-5 sm:px-6 py-4 bg-[#F8FAFC] border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CircleCheck
                    size={15}
                    className="text-[#4DB3F3]"
                  />

                  <span>
                    Giao dich minh bach & tin cay
                  </span>
                </div>
              </div>
            </div>

            {/* FARMER CARD */}
            {farmer ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Building2
                      size={19}
                      className="text-[#FF6B35]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Nguoi ban
                    </p>

                    <p className="text-sm font-bold text-[#172A46] mt-0.5">
                      Thong tin nha cung cap
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF6FD] flex items-center justify-center shrink-0">
                    <User
                      size={21}
                      className="text-[#4DB3F3]"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-[#172A46] text-sm truncate">
                      {farmer.full_name}
                    </p>

                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {farmer.company ||
                        'Chua cap nhat cong ty'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-[#F8FAFC] border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={15}
                      className="text-[#4DB3F3]"
                    />

                    <span className="text-xs text-slate-500">
                      Thong tin nguoi ban da duoc xac minh
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}