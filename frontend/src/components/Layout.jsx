import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Fish, LogOut, User, ShoppingBag, LayoutDashboard } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <Fish size={28} />
            Sàn giao dịch Tôm - Sông Thu Bồn, Đà Nẵng
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'BUYER' && (
                  <Link to="/my-orders" className="flex items-center gap-1 text-slate-600 hover:text-primary-600 text-sm font-medium">
                    <ShoppingBag size={18} /> Đơn hàng của tôi
                  </Link>
                )}
                {user.role === 'FARMER' && (
                  <Link to="/farmer" className="flex items-center gap-1 text-slate-600 hover:text-primary-600 text-sm font-medium">
                    <LayoutDashboard size={18} /> Quản lý lô hàng
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="flex items-center gap-1 text-slate-600 hover:text-primary-600 text-sm font-medium">
                    <LayoutDashboard size={18} /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500 pl-4 border-l border-slate-200">
                  <User size={16} />
                  {user.fullName}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}