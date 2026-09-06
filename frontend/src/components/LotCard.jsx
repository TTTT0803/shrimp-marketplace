import { Link } from 'react-router-dom';
import { MapPin, Fish, ShieldCheck } from 'lucide-react';

export default function LotCard({ lot }) {
  const quality = lot.aiAnalysis?.quality_grade;
  const isFresh = quality && quality.toLowerCase().includes('tuoi') && !quality.toLowerCase().includes('khong');

  return (
    <Link
      to={`/lots/${lot.id}`}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all"
    >
      <div className="h-40 bg-gradient-to-br from-ocean-500 to-primary-600 flex items-center justify-center relative">
        <Fish className="text-white/30" size={64} />
        {lot.aiAnalysis && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <ShieldCheck size={13} className={isFresh ? 'text-green-600' : 'text-amber-600'} />
            <span className={isFresh ? 'text-green-700' : 'text-amber-700'}>
              {isFresh ? 'AI: Đạt chuẩn' : 'AI: Cần kiểm tra'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-800 group-hover:text-primary-600 transition line-clamp-1">
            {lot.title}
          </h3>
        </div>

        <p className="text-sm text-slate-500 mb-3">{lot.shrimp_type}</p>

        <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
          <MapPin size={13} />
          {lot.origin || 'Chưa cập nhật'}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Số lượng</p>
            <p className="text-sm font-medium text-slate-700">{lot.quantity} {lot.unit}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Giá</p>
            <p className="text-sm font-bold text-primary-600">
              {lot.price ? `${lot.price} ${lot.currency || 'ETH'}` : 'Liên hệ'}
            </p>
          </div>
        </div>

        {lot.aiAnalysis?.shrimp_count && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            AI đếm được: <span className="font-medium text-slate-700">{lot.aiAnalysis.shrimp_count} con</span>
          </div>
        )}
      </div>
    </Link>
  );
}