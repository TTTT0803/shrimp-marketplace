import { useState, useEffect } from 'react';
import {
  Users, Package, ShoppingBag, TrendingUp, Lock, Unlock,
  EyeOff, Eye, Loader2, Search, Sprout, ShoppingCart, Shield,
  LayoutDashboard,
} from 'lucide-react';
import api from '../services/api';

const TABS = [
  { key: 'analytics', label: 'Tong quan', icon: LayoutDashboard },
  { key: 'users', label: 'Nguoi dung', icon: Users },
  { key: 'lots', label: 'Kiem duyet lo hang', icon: Package },
];

const STATUS_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-600',
  AI_ANALYZED: 'bg-blue-100 text-blue-700',
  LISTED: 'bg-green-100 text-green-700',
  LOCKED: 'bg-amber-100 text-amber-700',
  SOLD: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-violet-100 text-violet-700',
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-500';
  return (
    <span className={'inline-block text-xs font-semibold px-2.5 py-1 rounded-full ' + style}>
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + tint}>
          <Icon size={19} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-0.5">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 p-6">
      <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function BreakdownRow({ label, value, tint }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2">
        <span className={'w-2 h-2 rounded-full ' + tint} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function LoadingBlock({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Loader2 size={28} className="animate-spin mb-3 text-primary-400" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function EmptyBlock({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
      <Package size={40} className="mb-3" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

const STATUS_DOT = {
  DRAFT: 'bg-slate-400',
  AI_ANALYZED: 'bg-blue-400',
  LISTED: 'bg-green-400',
  LOCKED: 'bg-amber-400',
  SOLD: 'bg-indigo-400',
  COMPLETED: 'bg-violet-400',
};

function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingBlock text="Dang tai thong ke..." />;
  }

  if (!data) {
    return <EmptyBlock text="Khong co du lieu" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Tong nguoi dung"
          value={data.users.total}
          tint="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Package}
          label="Tong lo hang"
          value={data.lots.total}
          tint="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={ShoppingBag}
          label="Tong don hang"
          value={data.orders.total}
          tint="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Da giai ngan (ETH)"
          value={data.totalVolumeReleased}
          tint="bg-green-50 text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Nguoi dung theo vai tro">
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <Sprout size={16} className="text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 leading-none">{data.users.farmers}</p>
                <p className="text-xs text-slate-400">Farmer</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <ShoppingCart size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 leading-none">{data.users.buyers}</p>
                <p className="text-xs text-slate-400">Buyer</p>
              </div>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
            <div
              className="h-full bg-primary-500"
              style={{ width: (data.users.farmers / (data.users.total || 1)) * 100 + '%' }}
            />
            <div
              className="h-full bg-amber-400"
              style={{ width: (data.users.buyers / (data.users.total || 1)) * 100 + '%' }}
            />
          </div>
        </SectionCard>

        <SectionCard title="Lo hang theo trang thai">
          {data.lots.byStatus.map((item, index) => (
            <BreakdownRow
              key={index}
              label={item.status}
              value={item.count}
              tint={STATUS_DOT[item.status] || 'bg-slate-300'}
            />
          ))}
        </SectionCard>
      </div>

      <SectionCard title="Don hang">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">{data.orders.total}</p>
            <p className="text-sm text-slate-400">Tong don hang</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{data.orders.completed}</p>
            <p className="text-sm text-slate-400">Da hoan tat</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleLock(user) {
    setProcessingId(user.id);
    try {
      const action = user.is_locked ? 'unlock' : 'lock';
      await api.post('/admin/users/' + user.id + '/' + action);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchUsers();
  }

  function roleTint(role) {
    if (role === 'FARMER') return 'bg-primary-50 text-primary-700';
    if (role === 'BUYER') return 'bg-amber-50 text-amber-700';
    return 'bg-violet-50 text-violet-700';
  }

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tim theo ten hoac email..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tat ca vai tro</option>
          <option value="FARMER">Farmer</option>
          <option value="BUYER">Buyer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition shadow-sm shadow-primary-200"
        >
          Tim kiem
        </button>
      </form>

      {loading ? (
        <LoadingBlock text="Dang tai danh sach..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3.5 font-semibold">Ten</th>
                <th className="text-left px-6 py-3.5 font-semibold">Email</th>
                <th className="text-left px-6 py-3.5 font-semibold">Vai tro</th>
                <th className="text-left px-6 py-3.5 font-semibold">Trang thai</th>
                <th className="text-left px-6 py-3.5 font-semibold">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="font-medium text-slate-800">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{u.email}</td>
                  <td className="px-6 py-3.5">
                    <span className={'text-xs font-semibold px-2.5 py-1 rounded-full ' + roleTint(u.role)}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    {u.is_locked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Da khoa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Hoat dong
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    {u.role === 'ADMIN' ? (
                      <span className="text-slate-300 text-xs">Khong the khoa</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleLock(u)}
                        disabled={processingId === u.id}
                        className={
                          'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 ' +
                          (u.is_locked
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100')
                        }
                      >
                        {processingId === u.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : u.is_locked ? (
                          <Unlock size={13} />
                        ) : (
                          <Lock size={13} />
                        )}
                        {u.is_locked ? 'Mo khoa' : 'Khoa'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 ? <EmptyBlock text="Khong co nguoi dung nao" /> : null}
        </div>
      )}
    </div>
  );
}

function LotsModerationTab() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchLots();
  }, []);

  async function fetchLots() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/lots', { params });
      setLots(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleHide(lot) {
    setProcessingId(lot.id);
    try {
      const action = lot.is_hidden ? 'unhide' : 'hide';
      await api.post('/admin/lots/' + lot.id + '/' + action);
      fetchLots();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tat ca trang thai</option>
          <option value="DRAFT">DRAFT</option>
          <option value="AI_ANALYZED">AI_ANALYZED</option>
          <option value="LISTED">LISTED</option>
          <option value="LOCKED">LOCKED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <button
          type="button"
          onClick={fetchLots}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition shadow-sm shadow-primary-200"
        >
          Loc
        </button>
      </div>

      {loading ? (
        <LoadingBlock text="Dang tai danh sach..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3.5 font-semibold">Ma lo</th>
                <th className="text-left px-6 py-3.5 font-semibold">Ten</th>
                <th className="text-left px-6 py-3.5 font-semibold">Farmer</th>
                <th className="text-left px-6 py-3.5 font-semibold">Trang thai</th>
                <th className="text-left px-6 py-3.5 font-semibold">Hien thi</th>
                <th className="text-left px-6 py-3.5 font-semibold">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">{lot.lot_code}</td>
                  <td className="px-6 py-3.5 font-medium text-slate-800">{lot.title}</td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {lot.farmer ? lot.farmer.full_name : '-'}
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={lot.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    {lot.is_hidden ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Da an
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Cong khai
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggleHide(lot)}
                      disabled={processingId === lot.id}
                      className={
                        'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 ' +
                        (lot.is_hidden
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100')
                      }
                    >
                      {processingId === lot.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : lot.is_hidden ? (
                        <Eye size={13} />
                      ) : (
                        <EyeOff size={13} />
                      )}
                      {lot.is_hidden ? 'Hien lai' : 'An'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lots.length === 0 ? <EmptyBlock text="Khong co lo hang nao" /> : null}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
      </div>
      <p className="text-slate-400 mb-7 ml-13 pl-0.5">Quan ly va giam sat toan bo san giao dich</p>

      <div className="flex gap-1 bg-slate-100/70 p-1 rounded-xl w-fit mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ' +
                (isActive
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700')
              }
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'analytics' ? <AnalyticsTab /> : null}
      {activeTab === 'users' ? <UsersTab /> : null}
      {activeTab === 'lots' ? <LotsModerationTab /> : null}
    </div>
  );
}