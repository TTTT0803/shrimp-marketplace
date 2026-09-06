import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fish, Mail, Lock, User, AlertCircle, Sprout, ShoppingBag } from 'lucide-react';
import api from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'BUYER',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-ocean-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl mb-2">
            <Fish size={32} />
            Sàn giao dịch Tôm - Sông Thu Bồn, Đà Nẵng
          </div>
          <p className="text-slate-500">Tạo tài khoản để bắt đầu giao dịch</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8">
          <h1 className="text-xl font-bold text-slate-800 mb-6">Đăng ký</h1>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
              Đăng ký thành công! Đang chuyển đến trang đăng nhập...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Chon vai tro */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bạn là</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'BUYER' })}
                  className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition ${
                    form.role === 'BUYER'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <ShoppingBag size={20} />
                  <span className="text-sm font-medium">Người mua</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'FARMER' })}
                  className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition ${
                    form.role === 'FARMER'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <Sprout size={20} />
                  <span className="text-sm font-medium">Người nuôi tôm</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="full_name"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ban@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}