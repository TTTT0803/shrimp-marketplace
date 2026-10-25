import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.role, res.data.full_name);

      if (res.data.role === 'FARMER') navigate('/farmer');
      else if (res.data.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-6xl">

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] bg-white rounded-[28px] overflow-hidden shadow-[0_20px_70px_rgba(31,41,55,0.10)] border border-slate-100">

          {/* =========================
              LEFT - BRAND
          ========================== */}
          <div className="relative hidden lg:flex flex-col justify-between bg-[#FBF9F7] px-14 py-12 overflow-hidden">

            {/* Decorative shapes */}
            <div className="absolute -top-28 -left-28 w-72 h-72 rounded-full bg-[#47AEF1]/10" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#F76C35]/10" />

            {/* Small decorative line */}
            <div className="absolute top-20 right-0 w-32 h-[3px] bg-[#F76C35] rounded-full" />
            <div className="absolute top-[88px] right-12 w-12 h-[3px] bg-[#47AEF1] rounded-full" />

            <div className="relative z-10">

              {/* Logo */}
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="ShrimpMarket"
                  className="w-14 h-14 object-contain"
                />

                <div>
                  <h2 className="text-xl font-bold text-[#47AEF1]">
                    ShrimpMarket
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    B2B Seafood Marketplace
                  </p>
                </div>
              </div>

              {/* Main content */}
              <div className="mt-24 max-w-lg">

                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="w-8 h-[2px] bg-[#F76C35]" />

                  <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#F76C35]">
                    Shrimp Trading Platform
                  </span>
                </div>

                <h1 className="text-[42px] leading-[1.15] font-bold text-slate-800">
                  Kết nối giao dịch tôm
                  <span className="block text-[#47AEF1]">
                    minh bạch & tin cậy.
                  </span>
                </h1>

                <p className="mt-6 text-[15px] leading-7 text-slate-500 max-w-md">
                  Nền tảng thương mại điện tử B2B giúp kết nối
                  người nuôi và doanh nghiệp trong chuỗi cung ứng
                  thủy sản.
                </p>

                {/* Features */}
                <div className="mt-10 space-y-4">

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#47AEF1]/10 flex items-center justify-center">
                      <ShieldCheck
                        size={20}
                        className="text-[#47AEF1]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Giao dịch minh bạch
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Blockchain & Smart Contract
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F76C35]/10 flex items-center justify-center">
                      <span className="text-[#F76C35] font-bold text-sm">
                        AI
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Đánh giá chất lượng
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Hỗ trợ phân tích bằng AI
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="relative z-10 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                © 2026 ShrimpMarket
              </p>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#47AEF1]" />
                <span className="w-2 h-2 rounded-full bg-[#F76C35]" />
              </div>
            </div>

          </div>


          {/* =========================
              RIGHT - LOGIN
          ========================== */}
          <div className="px-7 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16">

            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img
                src={logo}
                alt="ShrimpMarket"
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Header */}
            <div className="mb-8">

              <p className="text-sm font-medium text-[#F76C35] mb-2">
                Chào mừng trở lại 👋
              </p>

              <h1 className="text-3xl font-bold text-slate-800">
                Đăng nhập
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Đăng nhập vào tài khoản ShrimpMarket của bạn
              </p>

            </div>


            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3.5 mb-6 rounded-xl bg-red-50 border border-red-100">

                <AlertCircle
                  size={18}
                  className="text-red-500 mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-sm font-semibold text-red-600">
                    Đăng nhập không thành công
                  </p>

                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>
                </div>

              </div>
            )}


            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>

                <div className="relative group">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#47AEF1] transition-colors"
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@email.com"
                    className="
                      w-full
                      h-12
                      pl-11
                      pr-4
                      rounded-xl
                      bg-[#FBF9F7]
                      border
                      border-slate-200
                      text-sm
                      text-slate-700
                      placeholder:text-slate-400
                      outline-none
                      transition-all
                      focus:bg-white
                      focus:border-[#47AEF1]
                      focus:ring-4
                      focus:ring-[#47AEF1]/10
                    "
                  />

                </div>
              </div>


              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Mật khẩu
                </label>

                <div className="relative group">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#47AEF1] transition-colors"
                  />

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="
                      w-full
                      h-12
                      pl-11
                      pr-4
                      rounded-xl
                      bg-[#FBF9F7]
                      border
                      border-slate-200
                      text-sm
                      text-slate-700
                      placeholder:text-slate-400
                      outline-none
                      transition-all
                      focus:bg-white
                      focus:border-[#47AEF1]
                      focus:ring-4
                      focus:ring-[#47AEF1]/10
                    "
                  />

                </div>
              </div>


              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  w-full
                  h-12
                  mt-2
                  rounded-xl
                  bg-[#F76C35]
                  hover:bg-[#e95f2b]
                  active:bg-[#d95320]
                  text-white
                  font-semibold
                  text-sm
                  flex
                  items-center
                  justify-center
                  gap-2
                  shadow-lg
                  shadow-[#F76C35]/20
                  transition-all
                  duration-200
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >

                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>

                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}

              </button>

            </form>


            {/* Register */}
            <div className="mt-8 pt-6 border-t border-slate-100">

              <p className="text-center text-sm text-slate-500">
                Chưa có tài khoản?{' '}

                <Link
                  to="/register"
                  className="font-semibold text-[#47AEF1] hover:text-[#3299dc] transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>

            </div>


            {/* Security */}
            <div className="flex justify-center items-center gap-2 mt-6">

              <ShieldCheck
                size={14}
                className="text-[#47AEF1]"
              />

              <span className="text-xs text-slate-400">
                Thông tin tài khoản được bảo mật
              </span>

            </div>

          </div>

        </div>

        {/* Mobile footer */}
        <p className="lg:hidden text-center text-xs text-slate-400 mt-5">
          © 2026 ShrimpMarket · AI • Blockchain • IPFS
        </p>

      </div>
    </div>
  );
}