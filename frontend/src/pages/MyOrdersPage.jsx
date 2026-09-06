import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Package, Loader2, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import api from '../services/api';
import contractJson from '../contracts/ShrimpEscrow.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

function getStatusColor(status) {
  if (status === 'ESCROW') {
    return 'bg-amber-100 text-amber-700';
  }
  if (status === 'SHIPPING') {
    return 'bg-blue-100 text-blue-700';
  }
  if (status === 'DELIVERED') {
    return 'bg-indigo-100 text-indigo-700';
  }
  if (status === 'COMPLETED') {
    return 'bg-green-100 text-green-700';
  }
  if (status === 'CANCELLED') {
    return 'bg-red-100 text-red-700';
  }
  return 'bg-slate-100 text-slate-600';
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
      setError('Vui long cai dat MetaMask truoc');
      setConfirmingId(null);
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, signer);

      const tx = await contract.confirmReceived(order.lot_id);
      await tx.wait();

      await api.post('/lots/orders/' + order.id + '/confirm-received', {
        transactionHash: tx.hash,
      });

      fetchOrders();
    } catch (err) {
      let msg = 'Xac nhan that bai';
      if (err.response && err.response.data && err.response.data.error) {
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
      await api.post('/reviews/orders/' + orderId, { rating, comment });
      setReviewingOrderId(null);
      setRating(5);
      setComment('');
      fetchOrders();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : 'Danh gia that bai';
      setError(msg);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 size={32} className="animate-spin mb-3" />
        Dang tai don hang...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Don hang cua toi</h1>

      {error ? (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Package size={48} className="mb-3" />
          <p className="font-medium">Ban chua co don hang nao</p>
          <Link to="/" className="text-primary-600 font-medium text-sm mt-2 hover:underline">
            Kham pha Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Link
                    to={'/lots/' + order.lot_id}
                    className="font-semibold text-slate-800 hover:text-primary-600 transition"
                  >
                    {order.ShrimpLot ? order.ShrimpLot.title : 'Lo hang #' + order.lot_id}
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">
                    {order.ShrimpLot ? order.ShrimpLot.lot_code : ''}
                  </p>
                </div>
                <span className={'text-xs font-semibold px-2.5 py-1 rounded-full ' + getStatusColor(order.status)}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">So luong</p>
                  <p className="font-medium text-slate-700">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tong tien</p>
                  <p className="font-medium text-slate-700">{order.total_amount} {order.currency}</p>
                </div>
                {order.escrowTransaction ? (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Trang thai ky quy</p>
                    <p className="font-medium text-slate-700">{order.escrowTransaction.status}</p>
                  </div>
                ) : null}
              </div>

              {order.status === 'ESCROW' ? (
                <button
                  type="button"
                  onClick={() => handleConfirmReceived(order)}
                  disabled={confirmingId === order.id}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {confirmingId === order.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {confirmingId === order.id ? 'Dang xu ly...' : 'Xac nhan da nhan hang'}
                </button>
              ) : null}

              {order.status === 'COMPLETED' && !order.review ? (
                reviewingOrderId === order.id ? (
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <p className="text-sm font-medium text-slate-700 mb-2">Danh gia don hang</p>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-2xl"
                        >
                          <Star
                            size={24}
                            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Chia se cam nhan cua ban..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSubmitReview(order.id)}
                        disabled={submittingReview}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                      >
                        {submittingReview ? 'Dang gui...' : 'Gui danh gia'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewingOrderId(null)}
                        className="text-slate-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
                      >
                        Huy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReviewingOrderId(order.id)}
                    className="flex items-center gap-2 text-primary-600 font-medium text-sm hover:underline"
                  >
                    <Star size={16} />
                    Danh gia don hang nay
                  </button>
                )
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}