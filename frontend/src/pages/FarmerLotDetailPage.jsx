import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  Fish,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Rocket,
  ArrowLeft,
  ArrowRight,
  Database,
  Sparkles,
  // ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import contractJson from '../contracts/ShrimpEscrow.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function getStatusColor(status) {
  if (status === 'DRAFT') {
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  if (status === 'AI_ANALYZED') {
    return 'bg-[#47AEF1]/10 text-[#3299dc] border border-[#47AEF1]/20';
  }

  if (status === 'LISTED') {
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  }

  if (status === 'LOCKED') {
    return 'bg-[#F76C35]/10 text-[#e95f2b] border border-[#F76C35]/20';
  }

  if (status === 'COMPLETED') {
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  return 'bg-slate-100 text-slate-500 border border-slate-200';
}

function getStatusLabel(status) {
  if (status === 'DRAFT') return 'Bản nháp';
  if (status === 'AI_ANALYZED') return 'Đã phân tích AI';
  if (status === 'LISTED') return 'Đang bán';
  if (status === 'LOCKED') return 'Đã khóa';
  if (status === 'COMPLETED') return 'Hoàn tất';

  return status;
}

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
      setError('Không tìm thấy lô hàng');
    } finally {
      setLoading(false);
    }
  }

  async function handleListOnChain() {
    setError('');
    setSuccess('');

    if (!window.ethereum) {
      setError('Vui lòng cài đặt MetaMask trước');
      return;
    }

    setListing(true);

    try {
      const dataRes = await api.get('/lots/' + lotId + '/listing-data');
      const listingData = dataRes.data;

      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractJson.abi,
        signer
      );

      const priceInWei = ethers.parseEther(
        String(listingData.price)
      );

      const tx = await contract.createListing(
        listingData.lotId,
        listingData.cid,
        listingData.quantity,
        priceInWei
      );

      await tx.wait();

      await api.post(
        '/lots/' + lotId + '/confirm-listing',
        {
          transactionHash: tx.hash,
        }
      );

      setSuccess('Đã đăng bán thành công lên Blockchain!');
      fetchLot();
    } catch (err) {
      let msg = 'Đăng bán thất bại';

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
      setListing(false);
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center py-32">

        <div className="flex flex-col items-center">

          <div className="w-14 h-14 rounded-2xl bg-[#47AEF1]/10 flex items-center justify-center mb-4">

            <Loader2
              size={26}
              className="text-[#47AEF1] animate-spin"
            />

          </div>

          <p className="text-sm font-semibold text-slate-600">
            Đang tải thông tin lô hàng...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Vui lòng chờ trong giây lát
          </p>

        </div>

      </div>
    );
  }


  /* ============================================================
     NOT FOUND
  ============================================================ */
  if (!lot) {
    return (
      <div className="min-h-full flex items-center justify-center py-32">

        <div className="text-center">

          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">

            <AlertCircle
              size={30}
              className="text-red-400"
            />

          </div>

          <h2 className="text-base font-semibold text-slate-700">
            Không tìm thấy lô hàng
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Lô hàng có thể không tồn tại hoặc đã bị xóa.
          </p>

        </div>

      </div>
    );
  }


  const aiAnalysis = lot.aiAnalysis;
  const ipfsMetadata = lot.ipfsMetadata;


  return (
    <div className="max-w-5xl mx-auto pb-10">

      {/* =========================================================
          TOP NAV
      ========================================================== */}
      <div className="flex items-center gap-2 mb-6">

        <button
          type="button"
          onClick={() => window.history.back()}
          className="
            w-9
            h-9
            rounded-xl
            bg-white
            border
            border-slate-200
            flex
            items-center
            justify-center
            text-slate-500
            hover:text-[#47AEF1]
            hover:border-[#47AEF1]/30
            transition
          "
        >
          <ArrowLeft size={17} />
        </button>

        <div>
          <p className="text-xs text-slate-400">
            Farmer Dashboard
          </p>

          <p className="text-sm font-semibold text-slate-700">
            Chi tiết lô hàng
          </p>
        </div>

      </div>


      {/* =========================================================
          HERO / LOT INFO
      ========================================================== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">

        {/* Banner */}
        <div className="relative h-36 bg-[#FBF9F7] overflow-hidden">

          {/* Decorative circles */}
          <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-[#47AEF1]/10" />

          <div className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-[#F76C35]/10" />

          {/* Decorative line */}
          <div className="absolute top-8 right-16 w-28 h-[3px] bg-[#F76C35] rounded-full" />

          <div className="absolute bottom-8 left-16 w-20 h-[3px] bg-[#47AEF1] rounded-full" />

          {/* Icon */}
          <div className="relative z-10 h-full flex items-center justify-center">

            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center">

              <Fish
                size={32}
                className="text-[#47AEF1]"
              />

            </div>

          </div>

        </div>


        {/* Info */}
        <div className="p-6 sm:p-7">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div>

              <div className="flex items-center gap-2 mb-2">

                <span className="text-xs font-mono font-medium text-slate-400">
                  {lot.lot_code}
                </span>

                <span className="w-1 h-1 rounded-full bg-slate-300" />

                <span
                  className={
                    'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ' +
                    getStatusColor(lot.status)
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {getStatusLabel(lot.status)}
                </span>

              </div>


              <h1 className="text-2xl font-bold text-slate-800">
                {lot.title}
              </h1>


              <p className="text-sm text-slate-500 mt-2">
                {lot.shrimp_type}
                <span className="mx-2 text-slate-300">•</span>
                {lot.quantity} {lot.unit}
              </p>

            </div>


            {/* Lot quantity */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FBF9F7] border border-slate-100">

              <div className="w-9 h-9 rounded-lg bg-[#47AEF1]/10 flex items-center justify-center">

                <Fish
                  size={18}
                  className="text-[#47AEF1]"
                />

              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                  Số lượng
                </p>

                <p className="text-sm font-bold text-slate-700">
                  {lot.quantity} {lot.unit}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
          AI ANALYSIS
      ========================================================== */}
      {aiAnalysis ? (

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-[#47AEF1]/10 flex items-center justify-center">

                  <Sparkles
                    size={20}
                    className="text-[#47AEF1]"
                  />

                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-800">
                    Kết quả kiểm định AI
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Phân tích chất lượng lô tôm
                  </p>

                </div>

              </div>


              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#47AEF1]">

                <ShieldCheck size={15} />

                AI Verified

              </div>

            </div>

          </div>


          {/* AI Metrics */}
          <div className="p-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Quantity */}
              <div className="rounded-xl bg-[#FBF9F7] border border-slate-100 p-4">

                <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                  Số lượng
                </p>

                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {aiAnalysis.shrimp_count}
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                  con tôm
                </p>

              </div>


              {/* Quality */}
              <div className="rounded-xl bg-[#F76C35]/5 border border-[#F76C35]/10 p-4">

                <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                  Chất lượng
                </p>

                <p className="text-2xl font-bold text-[#F76C35] mt-2">
                  {aiAnalysis.quality_grade}
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                  Quality grade
                </p>

              </div>


              {/* Confidence */}
              <div className="rounded-xl bg-[#47AEF1]/5 border border-[#47AEF1]/10 p-4">

                <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                  Độ tin cậy
                </p>

                <p className="text-2xl font-bold text-[#47AEF1] mt-2">
                  {(aiAnalysis.confidence * 100).toFixed(0)}%
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                  AI confidence
                </p>

              </div>


              {/* IPFS */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                  IPFS CID
                </p>

                <div className="flex items-center gap-2 mt-3">

                  <Database
                    size={17}
                    className="text-slate-400 shrink-0"
                  />

                  <p className="text-xs font-mono text-slate-600 truncate">
                    {ipfsMetadata
                      ? ipfsMetadata.cid
                      : 'Chưa có'}
                  </p>

                </div>

              </div>

            </div>


            {/* Confidence bar */}
            <div className="mt-5">

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs font-medium text-slate-500">
                  Độ tin cậy của kết quả AI
                </span>

                <span className="text-xs font-semibold text-[#47AEF1]">
                  {(aiAnalysis.confidence * 100).toFixed(0)}%
                </span>

              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-[#47AEF1] rounded-full transition-all"
                  style={{
                    width: `${aiAnalysis.confidence * 100}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

      ) : null}


      {/* =========================================================
          BLOCKCHAIN LISTING
      ========================================================== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-[#F76C35]/10 flex items-center justify-center">

              <Rocket
                size={20}
                className="text-[#F76C35]"
              />

            </div>

            <div>

              <h2 className="text-base font-bold text-slate-800">
                Đăng bán lên Blockchain
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Đưa lô hàng lên Marketplace
              </p>

            </div>

          </div>

        </div>


        <div className="p-6">

          <p className="text-sm text-slate-500 leading-6 mb-5 max-w-2xl">
            Sau khi đăng bán, lô hàng sẽ được hiển thị công khai
            trên Marketplace và Buyer có thể đặt cọc mua.
          </p>


          {/* Error */}
          {error ? (

            <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3.5 rounded-xl mb-4">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Có lỗi xảy ra
                </p>

                <p className="text-xs mt-1 text-red-500">
                  {error}
                </p>
              </div>

            </div>

          ) : null}


          {/* Success */}
          {success ? (

            <div className="flex items-start gap-3 bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-3.5 rounded-xl mb-4">

              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Đăng bán thành công
                </p>

                <p className="text-xs mt-1 text-green-600">
                  {success}
                </p>
              </div>

            </div>

          ) : null}


          {/* AI ANALYZED */}
          {lot.status === 'AI_ANALYZED' ? (

            <div>

              <div className="bg-[#47AEF1]/5 border border-[#47AEF1]/10 rounded-xl p-4 mb-5">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={19}
                    className="text-[#47AEF1] mt-0.5 shrink-0"
                  />

                  <div>

                    <p className="text-sm font-semibold text-slate-700">
                      Lô hàng đã sẵn sàng
                    </p>

                    <p className="text-xs text-slate-500 mt-1 leading-5">
                      Kết quả phân tích AI đã hoàn tất.
                      Bạn có thể đăng lô hàng lên Blockchain.
                    </p>

                  </div>

                </div>

              </div>


              <button
                type="button"
                onClick={handleListOnChain}
                disabled={listing}
                className="
                  group
                  w-full
                  h-12
                  bg-[#F76C35]
                  text-white
                  font-semibold
                  text-sm
                  rounded-xl
                  hover:bg-[#e95f2b]
                  active:bg-[#d95320]
                  shadow-lg
                  shadow-[#F76C35]/20
                  transition-all
                  duration-200
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                {listing ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    <span>
                      Đang xử lý Blockchain...
                    </span>
                  </>
                ) : (
                  <>
                    <Rocket
                      size={18}
                      className="group-hover:-translate-y-0.5 transition-transform"
                    />

                    <span>
                      Đăng bán lên Blockchain
                    </span>

                    <ArrowRight
                      size={17}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}

              </button>

            </div>

          ) : lot.status === 'DRAFT' ? (

            /* DRAFT */
            <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-100 px-4 py-4 rounded-xl">

              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <div>

                <p className="font-semibold">
                  Lô hàng chưa được phân tích
                </p>

                <p className="text-xs text-amber-600 mt-1 leading-5">
                  Vui lòng upload video/ảnh trước khi
                  đăng bán lên Blockchain.
                </p>

              </div>

            </div>

          ) : (

            /* OTHER STATUS */
            <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 border border-slate-100 px-4 py-4 rounded-xl">

              <CheckCircle2
                size={19}
                className="text-slate-400 shrink-0"
              />

              <span>
                Lô hàng đang ở trạng thái:{' '}
                <strong className="text-slate-700">
                  {getStatusLabel(lot.status)}
                </strong>
              </span>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}