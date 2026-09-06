import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function CreateLotPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    shrimp_type: 'Tom the',
    description: '',
    quantity: '',
    unit: 'kg',
    price: '',
    currency: 'ETH',
    harvest_date: '',
    origin: '',
  });
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [lotId, setLotId] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreateLot(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await api.post('/lots', form);
      setLotId(res.data.id);
      setStep(2);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : 'Tao lo hang that bai';
      setError(msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleUpload() {
    if (!file) {
      setError('Vui long chon file video hoac anh');
      return;
    }
    setError('');
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/lots/' + lotId + '/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      setAiResult(res.data.aiResult);
      setStep(3);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : 'Phan tich AI that bai';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-primary-600 font-bold text-xl mb-6">
        <Sprout size={24} />
        Tao lo hang moi
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ' +
                (step >= s ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400')
              }
            >
              {s}
            </div>
            {s < 3 ? (
              <div className={'flex-1 h-1 rounded ' + (step > s ? 'bg-primary-600' : 'bg-slate-100')} />
            ) : null}
          </div>
        ))}
      </div>

      {error ? (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <form onSubmit={handleCreateLot} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 mb-2">Buoc 1: Thong tin lo hang</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ten lo hang</label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Vi du: Tom the chan trang thu hoach thang 9"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loai tom</label>
              <select
                name="shrimp_type"
                value={form.shrimp_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Tom the">Tom the chan trang</option>
                <option value="Tom su">Tom su</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngay thu hoach</label>
              <input
                type="date"
                name="harvest_date"
                value={form.harvest_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">So luong</label>
              <input
                type="number"
                name="quantity"
                required
                step="0.01"
                value={form.quantity}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Don vi</label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="kg">kg</option>
                <option value="tan">tan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gia ban (ETH)</label>
              <input
                type="number"
                name="price"
                step="0.0001"
                value={form.price}
                onChange={handleChange}
                placeholder="1.0"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vung nuoi</label>
              <input
                type="text"
                name="origin"
                value={form.origin}
                onChange={handleChange}
                placeholder="Vi du: Ca Mau"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mo ta</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Mo ta chi tiet ve lo hang..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {creating ? 'Dang tao...' : 'Tiep tuc'}
          </button>
        </form>
      ) : null}

      {step === 2 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-2">Buoc 2: Upload video/anh de AI kiem dinh</h2>
          <p className="text-sm text-slate-500 mb-4">
            AI se tu dong dem so luong tom va kiem tra chat luong tu file ban upload.
          </p>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg py-10 cursor-pointer hover:border-primary-400 transition mb-4">
            <Upload size={32} className="text-slate-400 mb-2" />
            <span className="text-sm text-slate-500">
              {file ? file.name : 'Bam de chon file video hoac anh'}
            </span>
            <input
              type="file"
              accept="video/*,image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleUpload}
            disabled={analyzing || !file}
            className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                AI dang phan tich, vui long doi...
              </>
            ) : (
              'Upload va phan tich'
            )}
          </button>
        </div>
      ) : null}

     {step === 3 ? (
  <div className="bg-white rounded-xl border border-slate-200 p-6">
    <div className="flex items-center gap-2 text-green-600 font-semibold mb-6">
      <CheckCircle2 size={22} />
      Phan tich hoan tat!
    </div>

    {aiResult ? (
      <div className="space-y-6">
        {/* Tong quan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">So luong dem duoc</p>
            <p className="text-xl font-bold text-slate-800">{aiResult.shrimp_count} con</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Chat luong chung</p>
            <p className="text-xl font-bold text-slate-800">{aiResult.quality_grade}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Do tin cay TB</p>
            <p className="text-xl font-bold text-slate-800">
              {(aiResult.confidence * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Thoi gian xu ly</p>
            <p className="text-xl font-bold text-slate-800">{aiResult.processing_time}s</p>
          </div>
        </div>

        {/* Model info */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
          <span className="font-medium text-slate-500">Model AI:</span>
          <span>{aiResult.model_name} ({aiResult.model_version})</span>
        </div>

        {/* Phan bo chat luong */}
        {aiResult.ai_result && aiResult.ai_result.quality_distribution ? (
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Phan bo chat luong</h3>
            <div className="space-y-2">
              {Object.entries(aiResult.ai_result.quality_distribution).map(function (entry) {
                const label = entry[0];
                const count = entry[1];
                const total = aiResult.shrimp_count || 1;
                const percent = Math.round((count / total) * 100);
                const isFresh = label.toLowerCase().indexOf('tuoi') !== -1 && label.toLowerCase().indexOf('khong') === -1;
                const barColor = isFresh ? 'bg-green-500' : 'bg-amber-500';
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">{label}</span>
                      <span className="text-slate-400">{count} con ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={barColor + ' h-full rounded-full'}
                        style={{ width: percent + '%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Chi tiet tung con phat hien duoc */}
        {aiResult.ai_result && aiResult.ai_result.detections_sample && aiResult.ai_result.detections_sample.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Chi tiet phat hien ({aiResult.ai_result.detections_sample.length} muc)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">#</th>
                    <th className="text-left px-3 py-2 font-medium">Frame</th>
                    <th className="text-left px-3 py-2 font-medium">Do tin cay phat hien</th>
                    <th className="text-left px-3 py-2 font-medium">Chat luong</th>
                    <th className="text-left px-3 py-2 font-medium">Do tin cay chat luong</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {aiResult.ai_result.detections_sample.map(function (det, index) {
                    const isFresh = det.quality_label && det.quality_label.toLowerCase().indexOf('tuoi') !== -1 && det.quality_label.toLowerCase().indexOf('khong') === -1;
                    const qualityClass = isFresh ? 'text-green-600 font-medium' : 'text-amber-600 font-medium';
                    return (
                      <tr key={index}>
                        <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                        <td className="px-3 py-2 text-slate-500">{det.frame_index}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {(det.detection_confidence * 100).toFixed(1)}%
                        </td>
                        <td className={'px-3 py-2 ' + qualityClass}>
                          {det.quality_label || 'Chua phan loai'}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {det.quality_confidence ? (det.quality_confidence * 100).toFixed(1) + '%' : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* So khung hinh da xu ly */}
        {aiResult.ai_result && aiResult.ai_result.processed_frames ? (
          <p className="text-xs text-slate-400 text-center">
            Da xu ly {aiResult.ai_result.processed_frames} khung hinh tu video/anh cua ban
          </p>
        ) : null}
      </div>
    ) : null}

    <button
      type="button"
      onClick={() => navigate('/farmer/lots/' + lotId)}
      className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition mt-6"
    >
      Xem chi tiet va dang ban
    </button>
  </div>
) : null}
    </div>
  );
}