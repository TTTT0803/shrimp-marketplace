import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  Package,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Truck,
  CircleCheck,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import api from '../services/api';
import contractJson from '../contracts/ShrimpEscrow.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function getStatusColor(status) {
  if (status === 'ESCROW') {
    return 'bg-orange-50 text-orange-600 border-orange-100';
  }

  if (status === 'SHIPPING') {
    return 'bg-blue-50 text-blue-600 border-blue-100';
  }

  if (status === 'DELIVERED') {
    return 'bg-sky-50 text-sky-600 border-sky-100';
  }

  if (status === 'COMPLETED') {
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  }

  if (status === 'CANCELLED') {
    return 'bg-red-50 text-red-600 border-red-100';
  }

  return 'bg-slate-50 text-slate-600 border-slate-100';
}

function getStatusLabel(status) {
  if (status === 'ESCROW') return 'Đang ký quỹ';
  if (status === 'SHIPPING') return 'Đang giao hàng';
  if (status === 'DELIVERED') return 'Đã giao hàng';
  if (status === 'COMPLETED') return 'Hoàn tất';
  if (status === 'CANCELLED') return 'Đã hủy';

  return status;
}

function getStatusIcon(status) {
  if (status === 'ESCROW') return Clock3;
  if (status === 'SHIPPING') return Truck;
  if (status === 'DELIVERED') return Package;
  if (status === 'COMPLETED') return CircleCheck;
  if (status === 'CANCELLED') return XCircle;

  return Clock3;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [error, setError] = useState('');
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);

    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReceived(order) {
    setError('');
    setConfirmingId(order.id);

    if (!window.ethereum) {
      setError('Vui lòng cài đặt MetaMask trước');
      setConfirmingId(null);
      return;
    }

    try {
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

      const tx = await contract.confirmReceived(order.lot_id);

      await tx.wait();

      await api.post(
        '/lots/orders/' + order.id + '/confirm-received',
        {
          transactionHash: tx.hash,
        }
      );

      fetchOrders();
    } catch (err) {
      let msg = 'Xác nhận thất bại';

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
      setConfirmingId(null);
    }
  }

  async function handleSubmitReview(orderId) {
    setSubmittingReview(true);
    setError('');

    try {
      await api.post('/reviews/orders/' + orderId, {
        rating,
        comment,
      });

      setReviewingOrderId(null);
      setRating(5);
      setComment('');

      fetchOrders();
    } catch (err) {
      const msg =
        err.response &&
        err.response.data &&
        err.response.data.error
          ? err.response.data.error
          : 'Đánh giá thất bại';

      setError(msg);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
            <Loader2
              size={30}
              className="animate-spin text-[#4DB3F3]"
            />
          </div>

          <p className="text-sm font-medium text-slate-700">
            Đang tải đơn hàng...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* =========================================
            PAGE HEADER
        ========================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm mb-7">

          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#4DB3F3]/10" />
          <div className="absolute -bottom-24 right-32 w-40 h-40 rounded-full bg-[#FF6B35]/8" />

          <div className="relative px-6 sm:px-8 py-7 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-[2px] bg-[#FF6B35]" />

                  <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-[#FF6B35]">
                    Shrimp Trading Platform
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172A46]">
                  Đơn hàng của tôi
                </h1>

                <p className="text-sm text-slate-500 mt-2 max-w-xl">
                  Theo dõi đơn hàng, xác nhận giao nhận và đánh giá
                  chất lượng sản phẩm của bạn.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#EAF6FD] flex items-center justify-center">
                  <ShoppingBag
                    size={22}
                    className="text-[#4DB3F3]"
                  />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Tổng đơn hàng
                  </p>

                  <p className="text-xl font-bold text-[#172A46]">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            ERROR MESSAGE
        ========================================== */}
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                <AlertCircle
                  size={18}
                  className="text-red-500"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Có lỗi xảy ra
                </p>

                <p className="text-sm text-red-600 mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* =========================================
            EMPTY STATE
        ========================================== */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-20">
            <div className="flex flex-col items-center text-center">

              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-3xl bg-[#EAF6FD] flex items-center justify-center">
                  <Package
                    size={38}
                    className="text-[#4DB3F3]"
                  />
                </div>

                <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-[#FF6B35] border-4 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    0
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-[#172A46]">
                Bạn chưa có đơn hàng nào
              </h2>

              <p className="text-sm text-slate-400 mt-2 max-w-sm">
                Khám phá các lô tôm chất lượng trên ShrimpMarket
                và bắt đầu giao dịch ngay hôm nay.
              </p>

              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-200 hover:bg-[#F45B27] hover:shadow-md transition-all"
              >
                Khám phá Marketplace
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (

          /* =========================================
             ORDERS LIST
          ========================================== */
          <div className="space-y-5">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);

              return (
                <div
                  key={order.id}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >

                  {/* TOP COLOR LINE */}
                  <div
                    className={
                      order.status === 'COMPLETED'
                        ? 'h-1 bg-emerald-400'
                        : order.status === 'CANCELLED'
                        ? 'h-1 bg-red-400'
                        : 'h-1 bg-gradient-to-r from-[#4DB3F3] to-[#FF6B35]'
                    }
                  />

                  <div className="p-5 sm:p-6">

                    {/* =================================
                        ORDER HEADER
                    ================================== */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                      <div className="flex items-start gap-4">

                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF6FD] flex items-center justify-center shrink-0">
                          <Package
                            size={25}
                            className="text-[#4DB3F3]"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-400 mb-1">
                            Đơn hàng #{order.id}
                          </p>

                          <Link
                            to={'/lots/' + order.lot_id}
                            className="block text-base sm:text-lg font-bold text-[#172A46] hover:text-[#4DB3F3] transition-colors truncate"
                          >
                            {order.ShrimpLot
                              ? order.ShrimpLot.title
                              : 'Lô hàng #' + order.lot_id}
                          </Link>

                          {order.ShrimpLot ? (
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />

                              <p className="text-xs sm:text-sm text-slate-400">
                                {order.ShrimpLot.lot_code}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* STATUS */}
                      <div
                        className={
                          'inline-flex items-center gap-1.5 self-start text-xs font-bold px-3 py-2 rounded-full border ' +
                          getStatusColor(order.status)
                        }
                      >
                        <StatusIcon size={14} />

                        {getStatusLabel(order.status)}
                      </div>
                    </div>

                    {/* =================================
                        ORDER INFO
                    ================================== */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6">

                      <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1.5">
                          Số lượng
                        </p>

                        <p className="text-base font-bold text-[#172A46]">
                          {order.quantity}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1.5">
                          Tổng tiền
                        </p>

                        <p className="text-base font-bold text-[#172A46]">
                          {order.total_amount}{' '}
                          <span className="text-xs font-semibold text-slate-400">
                            {order.currency}
                          </span>
                        </p>
                      </div>

                      {order.escrowTransaction ? (
                        <div className="col-span-2 lg:col-span-1 rounded-2xl bg-[#F8FAFC] border border-slate-100 px-4 py-4">
                          <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 mb-1.5">
                            Trạng thái ký quỹ
                          </p>

                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#4DB3F3]" />

                            <p className="text-sm font-bold text-[#172A46]">
                              {order.escrowTransaction.status}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* =================================
                        CONFIRM RECEIVED
                    ================================== */}
                    {order.status === 'ESCROW' ? (
                      <div className="mt-5 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-4 sm:p-5">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-orange-100 flex items-center justify-center shrink-0">
                              <ShieldCheck
                                size={20}
                                className="text-[#FF6B35]"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-[#172A46]">
                                Xác nhận đã nhận hàng
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                Xác nhận giao dịch khi bạn đã nhận
                                đủ hàng.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleConfirmReceived(order)
                            }
                            disabled={
                              confirmingId === order.id
                            }
                            className="w-full sm:w-auto min-w-[210px] flex items-center justify-center gap-2 bg-[#FF6B35] text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-sm shadow-orange-200 hover:bg-[#F45B27] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {confirmingId === order.id ? (
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2 size={17} />
                            )}

                            {confirmingId === order.id
                              ? 'Đang xử lý...'
                              : 'Xác nhận đã nhận hàng'}

                            {confirmingId !== order.id ? (
                              <ArrowRight size={16} />
                            ) : null}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* =================================
                        REVIEW
                    ================================== */}
                    {order.status === 'COMPLETED' &&
                    !order.review ? (
                      reviewingOrderId === order.id ? (

                        <div className="mt-5 border-t border-slate-100 pt-5">

                          <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-5">

                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Star
                                  size={19}
                                  className="text-[#FFB000]"
                                />
                              </div>

                              <div>
                                <p className="text-sm font-bold text-[#172A46]">
                                  Đánh giá đơn hàng
                                </p>

                                <p className="text-xs text-slate-400 mt-0.5">
                                  Chia sẻ trải nghiệm của bạn
                                </p>
                              </div>
                            </div>

                            {/* STARS */}
                            <div className="flex items-center gap-1 mb-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    setRating(star)
                                  }
                                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white transition"
                                >
                                  <Star
                                    size={23}
                                    className={
                                      star <= rating
                                        ? 'fill-[#FFB000] text-[#FFB000]'
                                        : 'text-slate-200'
                                    }
                                  />
                                </button>
                              ))}

                              <span className="ml-2 text-sm font-semibold text-slate-500">
                                {rating}/5
                              </span>
                            </div>

                            {/* COMMENT */}
                            <textarea
                              rows={3}
                              value={comment}
                              onChange={(e) =>
                                setComment(e.target.value)
                              }
                              placeholder="Chia sẻ cảm nhận của bạn..."
                              className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:border-[#4DB3F3] focus:ring-4 focus:ring-[#4DB3F3]/10 transition"
                            />

                            {/* BUTTONS */}
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-3">

                              <button
                                type="button"
                                onClick={() =>
                                  setReviewingOrderId(null)
                                }
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-white hover:text-slate-700 transition"
                              >
                                Hủy
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSubmitReview(order.id)
                                }
                                disabled={submittingReview}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#172A46] text-white text-sm font-semibold hover:bg-[#213B60] transition disabled:opacity-50"
                              >
                                {submittingReview ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Star size={16} />
                                )}

                                {submittingReview
                                  ? 'Đang gửi...'
                                  : 'Gửi đánh giá'}
                              </button>
                            </div>
                          </div>
                        </div>

                      ) : (

                        <div className="mt-5 pt-4 border-t border-slate-100">

                          <button
                            type="button"
                            onClick={() =>
                              setReviewingOrderId(order.id)
                            }
                            className="group/review inline-flex items-center gap-2 text-[#4DB3F3] font-semibold text-sm hover:text-[#2498DD] transition"
                          >
                            <span className="w-8 h-8 rounded-lg bg-[#EAF6FD] flex items-center justify-center group-hover/review:bg-[#DDF1FC] transition">
                              <Star size={16} />
                            </span>

                            <span>
                              Đánh giá đơn hàng này
                            </span>

                            <ArrowRight
                              size={15}
                              className="group-hover/review:translate-x-0.5 transition"
                            />
                          </button>
                        </div>
                      )
                    ) : null}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}