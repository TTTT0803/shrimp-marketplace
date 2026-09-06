import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Loader2 } from 'lucide-react';
import api from '../services/api';

function getStatusColor(status) {
  if (status === 'DRAFT') {
    return 'bg-slate-100 text-slate-600';
  }
  if (status === 'AI_ANALYZED') {
    return 'bg-blue-100 text-blue-700';
  }
  if (status === 'LISTED') {
    return 'bg-green-100 text-green-700';
  }
  if (status === 'LOCKED') {
    return 'bg-amber-100 text-amber-700';
  }
  if (status === 'COMPLETED') {
    return 'bg-slate-200 text-slate-700';
  }
  return 'bg-slate-100 text-slate-500';
}

export default function FarmerDashboardPage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLots();
  }, []);

  async function fetchMyLots() {
    setLoading(true);
    try {
      const res = await api.get('/lots/my-lots');
      setLots(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Quan ly lo hang</h1>
          <p className="text-slate-500">Theo doi cac lo tom ban da dang ban</p>
        </div>
        <Link
          to="/farmer/create-lot"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          <Plus size={18} />
          Tao lo hang moi
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-3" />
          Dang tai...
        </div>
      ) : lots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Package size={48} className="mb-3" />
          <p className="font-medium">Ban chua co lo hang nao</p>
          <Link to="/farmer/create-lot" className="text-primary-600 font-medium text-sm mt-2 hover:underline">
            Tao lo hang dau tien
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Ma lo</th>
                <th className="text-left px-6 py-3 font-medium">Ten lo hang</th>
                <th className="text-left px-6 py-3 font-medium">Loai tom</th>
                <th className="text-left px-6 py-3 font-medium">So luong</th>
                <th className="text-left px-6 py-3 font-medium">Trang thai</th>
                <th className="text-left px-6 py-3 font-medium">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{lot.lot_code}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{lot.title}</td>
                  <td className="px-6 py-4 text-slate-600">{lot.shrimp_type}</td>
                  <td className="px-6 py-4 text-slate-600">{lot.quantity} {lot.unit}</td>
                  <td className="px-6 py-4">
                    <span className={'text-xs font-semibold px-2.5 py-1 rounded-full ' + getStatusColor(lot.status)}>
                      {lot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={'/farmer/lots/' + lot.id}
                      className="text-primary-600 font-medium hover:underline"
                    >
                      Xem chi tiet
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}