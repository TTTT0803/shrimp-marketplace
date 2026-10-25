import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Sprout,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import logo from '../assets/logo.png';

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
    <div className="min-h-screen bg-[#FBF9F7] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-6xl">

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] bg-white rounded-[28px] overflow-hidden shadow-[0_20px_70px_rgba(31,41,55,0.10)] border border-slate-100">

          {/* =====================================================
              LEFT - BRANDING
          ====================================================== */}
          <div className="relative hidden lg:flex flex-col justify-between bg-[#FBF9F7] px-14 py-12 overflow-hidden">

            {/* Decorative background */}
            <div className="absolute -top-28 -left-28 w-72 h-72 rounded-full bg-[#47AEF1]/10" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#F76C35]/10" />

            {/* Decorative lines */}
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


              {/* Content */}
              <div className="mt-24 max-w-lg">

                <div className="inline-flex items-center gap-2 mb-5">

                  <span className="w-8 h-[2px] bg-[#F76C35]" />

                  <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#F76C35]">
                    Join ShrimpMarket
                  </span>

                </div>


                <h1 className="text-[42px] leading-[1.15] font-bold text-slate-800">

                  Bắt đầu hành trình
                  <span className="block text-[#47AEF1]">
                    giao dịch thông minh.
                  </span>

                </h1>


                <p className="mt-6 text-[15px] leading-7 text-slate-500 max-w-md">
                  Tạo tài khoản để kết nối với các đối tác
                  trong chuỗi cung ứng tôm và trải nghiệm
                  nền tảng giao dịch minh bạch.
                </p>


                {/* Role introduction */}
                <div className="mt-10 space-y-4">

                  {/* Buyer */}
                  <div className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-xl bg-[#47AEF1]/10 flex items-center justify-center">
                      <ShoppingBag
                        size={19}
                        className="text-[#47AEF1]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Người mua
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Tìm kiếm và giao dịch các lô tôm
                      </p>
                    </div>

                  </div>


                  {/* Farmer */}
                  <div className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-xl bg-[#F76C35]/10 flex items-center justify-center">
                      <Sprout
                        size={19}
                        className="text-[#F76C35]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Người nuôi tôm
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Đăng bán và quản lý các lô tôm
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* Footer */}
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


          {/* =====================================================
              RIGHT - REGISTER FORM
          ====================================================== */}
          <div className="px-7 py-10 sm:px-12 sm:py-12 lg:px-14 lg:py-12">

            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-7">

              <img
                src={logo}
                alt="ShrimpMarket"
                className="w-24 h-24 object-contain"
              />

            </div>


            {/* Header */}
            <div className="mb-7">

              <p className="text-sm font-medium text-[#F76C35] mb-2">
                Tham gia cùng ShrimpMarket
              </p>

              <h1 className="text-3xl font-bold text-slate-800">
                Tạo tài khoản
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Điền thông tin bên dưới để bắt đầu giao dịch
              </p>

            </div>


            {/* Error */}
            {error && (

              <div className="flex items-start gap-3 px-4 py-3.5 mb-5 rounded-xl bg-red-50 border border-red-100">

                <AlertCircle
                  size={18}
                  className="text-red-500 mt-0.5 shrink-0"
                />

                <div>

                  <p className="text-sm font-semibold text-red-600">
                    Đăng ký không thành công
                  </p>

                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>

                </div>

              </div>

            )}


            {/* Success */}
            {success && (

              <div className="flex items-start gap-3 px-4 py-3.5 mb-5 rounded-xl bg-green-50 border border-green-100">

                <ShieldCheck
                  size={18}
                  className="text-green-600 mt-0.5 shrink-0"
                />

                <div>

                  <p className="text-sm font-semibold text-green-700">
                    Đăng ký thành công!
                  </p>

                  <p className="text-xs text-green-600 mt-1">
                    Đang chuyển đến trang đăng nhập...
                  </p>

                </div>

              </div>

            )}


            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">


              {/* =================================================
                  ROLE
              ================================================== */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Bạn là
                </label>

                <div className="grid grid-cols-2 gap-3">

                  {/* BUYER */}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, role: 'BUYER' })
                    }
                    className={`
                      relative
                      flex
                      items-center
                      gap-3
                      p-3.5
                      rounded-xl
                      border-2
                      text-left
                      transition-all
                      duration-200
                      ${
                        form.role === 'BUYER'
                          ? 'border-[#47AEF1] bg-[#47AEF1]/5'
                          : 'border-slate-200 bg-white hover:border-[#47AEF1]/40 hover:bg-slate-50'
                      }
                    `}
                  >

                    <div
                      className={`
                        w-10
                        h-10
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        shrink-0
                        ${
                          form.role === 'BUYER'
                            ? 'bg-[#47AEF1]/10 text-[#47AEF1]'
                            : 'bg-slate-100 text-slate-400'
                        }
                      `}
                    >
                      <ShoppingBag size={19} />
                    </div>

                    <div>

                      <p
                        className={`text-sm font-semibold ${
                          form.role === 'BUYER'
                            ? 'text-[#47AEF1]'
                            : 'text-slate-600'
                        }`}
                      >
                        Người mua
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Mua lô tôm
                      </p>

                    </div>

                    {form.role === 'BUYER' && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#47AEF1]" />
                    )}

                  </button>


                  {/* FARMER */}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, role: 'FARMER' })
                    }
                    className={`
                      relative
                      flex
                      items-center
                      gap-3
                      p-3.5
                      rounded-xl
                      border-2
                      text-left
                      transition-all
                      duration-200
                      ${
                        form.role === 'FARMER'
                          ? 'border-[#F76C35] bg-[#F76C35]/5'
                          : 'border-slate-200 bg-white hover:border-[#F76C35]/40 hover:bg-slate-50'
                      }
                    `}
                  >

                    <div
                      className={`
                        w-10
                        h-10
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        shrink-0
                        ${
                          form.role === 'FARMER'
                            ? 'bg-[#F76C35]/10 text-[#F76C35]'
                            : 'bg-slate-100 text-slate-400'
                        }
                      `}
                    >
                      <Sprout size={19} />
                    </div>

                    <div>

                      <p
                        className={`text-sm font-semibold ${
                          form.role === 'FARMER'
                            ? 'text-[#F76C35]'
                            : 'text-slate-600'
                        }`}
                      >
                        Người nuôi tôm
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Bán lô tôm
                      </p>

                    </div>

                    {form.role === 'FARMER' && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F76C35]" />
                    )}

                  </button>

                </div>

              </div>


              {/* =================================================
                  FULL NAME
              ================================================== */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Họ và tên
                </label>

                <div className="relative group">

                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#47AEF1] transition-colors"
                  />

                  <input
                    type="text"
                    name="full_name"
                    required
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="
                      w-full
                      h-11
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


              {/* =================================================
                  EMAIL
              ================================================== */}
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
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ban@email.com"
                    className="
                      w-full
                      h-11
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


              {/* =================================================
                  PASSWORD
              ================================================== */}
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
                    name="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                    className="
                      w-full
                      h-11
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


              {/* =================================================
                  SUBMIT
              ================================================== */}
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

                    <span>
                      Đang xử lý...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Tạo tài khoản
                    </span>

                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}

              </button>

            </form>


            {/* =================================================
                LOGIN LINK
            ================================================== */}
            <div className="mt-7 pt-6 border-t border-slate-100">

              <p className="text-center text-sm text-slate-500">

                Đã có tài khoản?{' '}

                <Link
                  to="/login"
                  className="font-semibold text-[#47AEF1] hover:text-[#3299dc] transition-colors"
                >
                  Đăng nhập
                </Link>

              </p>

            </div>


            {/* Security */}
            <div className="flex justify-center items-center gap-2 mt-5">

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