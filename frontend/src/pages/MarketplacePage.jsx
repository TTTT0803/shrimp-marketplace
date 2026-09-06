import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, PackageX, Loader2 } from 'lucide-react';
import api from '../services/api';
import LotCard from '../components/LotCard';

export default function MarketplacePage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shrimpType, setShrimpType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (shrimpType) params.shrimp_type = shrimpType;

      const res = await api.get('/lots', { params });
      setLots(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLots();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Sàn giao dịch tôm</h1>
        <p className="text-slate-500">Mọi lô hàng đều được AI kiểm định và Blockchain xác thực</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên lô hàng..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 font-medium text-sm"
        >
          <SlidersHorizontal size={16} />
          Bộ lọc
        </button>

        <button
          type="submit"
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          Tìm kiếm
        </button>
      </form>

      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3">
          <select
            value={shrimpType}
            onChange={(e) => setShrimpType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả loại tôm</option>
            <option value="Tom the">Tôm thẻ chân trắng</option>
            <option value="Tom su">Tôm sú</option>
          </select>
          <button
            onClick={fetchLots}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900"
          >
            Áp dụng
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 size={32} className="animate-spin mb-3" />
          Đang tải danh sách lô hàng...
        </div>
      ) : lots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <PackageX size={48} className="mb-3" />
          <p className="font-medium">Chưa có lô hàng nào đang bán</p>
          <p className="text-sm">Hãy quay lại sau nhé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {lots.map((lot) => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
      )}
    </div>
  );
}