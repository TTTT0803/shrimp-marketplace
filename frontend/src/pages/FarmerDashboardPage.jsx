import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Package,
  Loader2,
  ArrowRight,
  Fish,
  Layers3,
} from 'lucide-react';
import api from '../services/api';

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
    <div className="min-h-full">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#F76C35]" />

            <span className="text-xs font-bold uppercase tracking-wider text-[#F76C35]">
              Farmer Dashboard
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Quản lý lô hàng
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Theo dõi và quản lý các lô tôm bạn đang giao dịch
          </p>
        </div>


        {/* Create button */}
        <Link
          to="/farmer/create-lot"
          className="
            group
            inline-flex
            items-center
            justify-center
            gap-2
            bg-[#F76C35]
            hover:bg-[#e95f2b]
            active:bg-[#d95320]
            text-white
            px-5
            py-3
            rounded-xl
            font-semibold
            text-sm
            shadow-lg
            shadow-[#F76C35]/20
            transition-all
            duration-200
          "
        >
          <Plus
            size={18}
            className="group-hover:rotate-90 transition-transform duration-200"
          />

          <span>Tạo lô hàng mới</span>
        </Link>

      </div>


      {/* =====================================================
          SUMMARY
      ====================================================== */}
      {!loading && lots.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          {/* Total */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Tổng số lô
                </p>

                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {lots.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-[#47AEF1]/10 flex items-center justify-center">
                <Layers3
                  size={21}
                  className="text-[#47AEF1]"
                />
              </div>

            </div>

          </div>


          {/* Listed */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Đang bán
                </p>

                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {lots.filter((lot) => lot.status === 'LISTED').length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Package
                  size={21}
                  className="text-emerald-500"
                />
              </div>

            </div>

          </div>


          {/* Completed */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Hoàn tất
                </p>

                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {lots.filter((lot) => lot.status === 'COMPLETED').length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-[#F76C35]/10 flex items-center justify-center">
                <Fish
                  size={21}
                  className="text-[#F76C35]"
                />
              </div>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          CONTENT
      ====================================================== */}

      {loading ? (

        /* Loading */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

          <div className="flex flex-col items-center justify-center py-28">

            <div className="w-12 h-12 rounded-2xl bg-[#47AEF1]/10 flex items-center justify-center mb-4">

              <Loader2
                size={24}
                className="text-[#47AEF1] animate-spin"
              />

            </div>

            <p className="text-sm font-medium text-slate-600">
              Đang tải dữ liệu...
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Vui lòng chờ trong giây lát
            </p>

          </div>

        </div>

      ) : lots.length === 0 ? (

        /* Empty */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

          <div className="flex flex-col items-center justify-center py-24 px-6">

            <div className="w-20 h-20 rounded-3xl bg-[#47AEF1]/10 flex items-center justify-center mb-5">

              <Package
                size={36}
                className="text-[#47AEF1]"
              />

            </div>

            <h3 className="text-base font-semibold text-slate-700">
              Bạn chưa có lô hàng nào
            </h3>

            <p className="text-sm text-slate-400 mt-2 text-center max-w-sm">
              Tạo lô hàng đầu tiên để bắt đầu đăng bán
              sản phẩm trên ShrimpMarket.
            </p>

            <Link
              to="/farmer/create-lot"
              className="
                group
                inline-flex
                items-center
                gap-2
                mt-6
                px-5
                py-2.5
                rounded-xl
                bg-[#F76C35]
                hover:bg-[#e95f2b]
                text-white
                text-sm
                font-semibold
                shadow-md
                shadow-[#F76C35]/15
                transition-all
              "
            >
              <Plus size={17} />

              <span>Tạo lô hàng đầu tiên</span>

              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>

          </div>

        </div>

      ) : (

        /* =====================================================
           LOT TABLE
        ====================================================== */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-800">
                Danh sách lô hàng
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Các lô hàng của bạn trên ShrimpMarket
              </p>
            </div>

            <div className="flex items-center gap-2">

              <span className="w-2 h-2 rounded-full bg-[#47AEF1]" />

              <span className="text-xs font-medium text-slate-500">
                {lots.length} lô hàng
              </span>

            </div>

          </div>


          {/* Table */}
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-[#FBF9F7]">

                <tr>

                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Mã lô
                  </th>

                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tên lô hàng
                  </th>

                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Loại tôm
                  </th>

                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Số lượng
                  </th>

                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Trạng thái
                  </th>

                  <th className="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Thao tác
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {lots.map((lot) => (

                  <tr
                    key={lot.id}
                    className="group hover:bg-[#FBF9F7]/70 transition-colors"
                  >

                    {/* Lot code */}
                    <td className="px-6 py-4">

                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-mono text-[11px]">
                        {lot.lot_code}
                      </span>

                    </td>


                    {/* Title */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-lg bg-[#47AEF1]/10 flex items-center justify-center shrink-0">

                          <Package
                            size={17}
                            className="text-[#47AEF1]"
                          />

                        </div>

                        <span className="font-semibold text-slate-700">
                          {lot.title}
                        </span>

                      </div>

                    </td>


                    {/* Shrimp type */}
                    <td className="px-6 py-4">

                      <span className="text-slate-600">
                        {lot.shrimp_type}
                      </span>

                    </td>


                    {/* Quantity */}
                    <td className="px-6 py-4">

                      <span className="font-medium text-slate-700">
                        {lot.quantity}
                      </span>

                      <span className="text-slate-400 ml-1">
                        {lot.unit}
                      </span>

                    </td>


                    {/* Status */}
                    <td className="px-6 py-4">

                      <span
                        className={
                          'inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full ' +
                          getStatusColor(lot.status)
                        }
                      >

                        <span className="w-1.5 h-1.5 rounded-full bg-current" />

                        {getStatusLabel(lot.status)}

                      </span>

                    </td>


                    {/* Action */}
                    <td className="px-6 py-4 text-right">

                      <Link
                        to={'/farmer/lots/' + lot.id}
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          text-[#47AEF1]
                          font-semibold
                          text-xs
                          hover:text-[#3299dc]
                          transition-colors
                        "
                      >

                        <span>
                          Xem chi tiết
                        </span>

                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />

                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}