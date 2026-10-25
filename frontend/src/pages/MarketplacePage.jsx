import { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  PackageX,
  Loader2,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
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

  const handleClearFilters = () => {
    setShrimpType('');
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="mb-7">

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2 mb-2">

              <div className="w-8 h-8 rounded-lg bg-[#47AEF1]/10 flex items-center justify-center">
                <Sparkles
                  size={17}
                  className="text-[#47AEF1]"
                />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-[#47AEF1]">
                Shrimp Marketplace
              </span>

            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Sàn giao dịch tôm
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Tìm kiếm và lựa chọn các lô tôm đã được AI kiểm định
              và Blockchain xác thực.
            </p>
          </div>


          {/* Trust badges */}
          <div className="flex items-center gap-2">

            <div className="
              flex
              items-center
              gap-2
              px-3
              py-2
              bg-white
              border
              border-slate-100
              rounded-xl
              shadow-sm
            ">
              <Sparkles
                size={15}
                className="text-[#47AEF1]"
              />

              <span className="text-xs font-medium text-slate-600">
                AI kiểm định
              </span>
            </div>


            <div className="
              flex
              items-center
              gap-2
              px-3
              py-2
              bg-white
              border
              border-slate-100
              rounded-xl
              shadow-sm
            ">
              <ShieldCheck
                size={15}
                className="text-[#F76C35]"
              />

              <span className="text-xs font-medium text-slate-600">
                Blockchain
              </span>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SEARCH
      ====================================================== */}
      <div className="
        bg-white
        rounded-2xl
        border
        border-slate-100
        shadow-sm
        p-4
        mb-6
      ">

        <form
          onSubmit={handleSearch}
          className="flex flex-col lg:flex-row gap-3"
        >

          {/* Search input */}
          <div className="relative flex-1">

            <Search
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
              size={18}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên lô hàng..."
              className="
                w-full
                h-11
                pl-11
                pr-4
                bg-slate-50
                border
                border-slate-100
                rounded-xl
                text-sm
                text-slate-700
                placeholder:text-slate-400
                focus:outline-none
                focus:bg-white
                focus:border-[#47AEF1]/40
                focus:ring-4
                focus:ring-[#47AEF1]/10
                transition
              "
            />

          </div>


          {/* Filter */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`
              h-11
              px-4
              rounded-xl
              border
              flex
              items-center
              justify-center
              gap-2
              text-sm
              font-medium
              transition
              ${
                showFilters
                  ? 'bg-[#47AEF1]/10 border-[#47AEF1]/20 text-[#3299dc]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }
            `}
          >

            <SlidersHorizontal size={17} />

            Bộ lọc

            {shrimpType && (
              <span className="
                w-5
                h-5
                rounded-full
                bg-[#F76C35]
                text-white
                text-[10px]
                flex
                items-center
                justify-center
              ">
                1
              </span>
            )}

          </button>


          {/* Search button */}
          <button
            type="submit"
            className="
              h-11
              px-6
              bg-[#F76C35]
              text-white
              rounded-xl
              font-semibold
              text-sm
              hover:bg-[#e95f2b]
              active:bg-[#d95320]
              shadow-lg
              shadow-[#F76C35]/20
              transition-all
              flex
              items-center
              justify-center
              gap-2
            "
          >

            <Search size={17} />

            Tìm kiếm

          </button>

        </form>


        {/* =================================================
            FILTER PANEL
        ================================================== */}
        {showFilters && (

          <div className="
            mt-4
            pt-4
            border-t
            border-slate-100
          ">

            <div className="flex flex-col sm:flex-row sm:items-end gap-3">

              <div className="flex-1 max-w-sm">

                <label className="
                  block
                  text-xs
                  font-semibold
                  text-slate-500
                  mb-2
                ">
                  Loại tôm
                </label>

                <select
                  value={shrimpType}
                  onChange={(e) => setShrimpType(e.target.value)}
                  className="
                    w-full
                    h-10
                    px-3
                    bg-slate-50
                    border
                    border-slate-200
                    rounded-xl
                    text-sm
                    text-slate-700
                    focus:outline-none
                    focus:border-[#47AEF1]/40
                    focus:ring-4
                    focus:ring-[#47AEF1]/10
                  "
                >
                  <option value="">
                    Tất cả loại tôm
                  </option>

                  <option value="Tom the">
                    Tôm thẻ chân trắng
                  </option>

                  <option value="Tom su">
                    Tôm sú
                  </option>

                </select>

              </div>


              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={fetchLots}
                  className="
                    h-10
                    px-5
                    bg-[#47AEF1]
                    text-white
                    rounded-xl
                    text-sm
                    font-semibold
                    hover:bg-[#3299dc]
                    transition
                  "
                >
                  Áp dụng
                </button>


                {shrimpType && (

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="
                      h-10
                      px-3
                      text-slate-500
                      hover:text-slate-700
                      text-sm
                      font-medium
                      flex
                      items-center
                      gap-1
                    "
                  >
                    <X size={15} />
                    Xóa lọc
                  </button>

                )}

              </div>

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
          RESULT HEADER
      ====================================================== */}
      {!loading && lots.length > 0 && (

        <div className="
          flex
          items-center
          justify-between
          mb-4
          px-1
        ">

          <div>

            <span className="text-sm font-semibold text-slate-700">
              Lô hàng đang bán
            </span>

            <span className="
              ml-2
              inline-flex
              items-center
              justify-center
              min-w-6
              h-6
              px-1.5
              rounded-full
              bg-[#47AEF1]/10
              text-[#3299dc]
              text-xs
              font-bold
            ">
              {lots.length}
            </span>

          </div>

          <span className="text-xs text-slate-400">
            Cập nhật mới nhất
          </span>

        </div>

      )}


      {/* =====================================================
          LOADING
      ====================================================== */}
      {loading ? (

        <div className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          py-24
          flex
          flex-col
          items-center
          justify-center
        ">

          <div className="
            w-14
            h-14
            rounded-2xl
            bg-[#47AEF1]/10
            flex
            items-center
            justify-center
            mb-4
          ">

            <Loader2
              size={26}
              className="text-[#47AEF1] animate-spin"
            />

          </div>

          <p className="text-sm font-semibold text-slate-600">
            Đang tải danh sách lô hàng...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Đang tìm những lô tôm phù hợp
          </p>

        </div>

      ) : lots.length === 0 ? (

        /* =================================================
           EMPTY
        ================================================== */
        <div className="
          bg-white
          rounded-2xl
          border
          border-slate-100
          py-24
          flex
          flex-col
          items-center
          justify-center
          text-center
        ">

          <div className="
            w-16
            h-16
            rounded-2xl
            bg-[#F76C35]/10
            flex
            items-center
            justify-center
            mb-4
          ">

            <PackageX
              size={30}
              className="text-[#F76C35]"
            />

          </div>

          <h3 className="
            text-base
            font-semibold
            text-slate-700
          ">
            Chưa có lô hàng nào đang bán
          </h3>

          <p className="
            text-sm
            text-slate-400
            mt-1
          ">
            Hãy thử thay đổi từ khóa hoặc bộ lọc.
          </p>

          {(search || shrimpType) && (

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setShrimpType('');
              }}
              className="
                mt-4
                text-sm
                font-semibold
                text-[#47AEF1]
                hover:underline
              "
            >
              Xóa bộ lọc và tìm lại
            </button>

          )}

        </div>

      ) : (

        /* =================================================
           LOT GRID
        ================================================== */
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          gap-5
        ">

          {lots.map((lot) => (

            <LotCard
              key={lot.id}
              lot={lot}
            />

          ))}

        </div>

      )}

    </div>
  );
}