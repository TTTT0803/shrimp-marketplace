import { useState, useEffect } from 'react';
import {
  Users, Package, ShoppingBag, TrendingUp, Lock, Unlock,
  EyeOff, Eye, Loader2, Search,
} from 'lucide-react';
import api from '../services/api';

const TABS = [
  { key: 'analytics', label: 'Tong quan' },
  { key: 'users', label: 'Nguoi dung' },
  { key: 'lots', label: 'Kiem duyet lo hang' },
];

function StatCard(props) {
  const Icon = props.icon;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon size={18} className="text-primary-600" />
        </div>
        <p className="text-sm text-slate-500">{props.label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-800">{props.value}</p>
    </div>
  );
}

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
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Loader2 size={28} className="animate-spin mb-2" />
        Dang tai thong ke...
      </div>
    );
  }

  if (!data) {
    return <p className="text-slate-400 text-center py-16">Khong co du lieu</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Tong nguoi dung" value={data.users.total} />
        <StatCard icon={Package} label="Tong lo hang" value={data.lots.total} />
        <StatCard icon={ShoppingBag} label="Tong don hang" value={data.orders.total} />
        <StatCard icon={TrendingUp} label="Da giai ngan (ETH)" value={data.totalVolumeReleased} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Nguoi dung theo vai tro</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Farmer</span>
              <span className="font-medium text-slate-800">{data.users.farmers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Buyer</span>
              <span className="font-medium text-slate-800">{data.users.buyers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Lo hang theo trang thai</h3>
          <div className="space-y-3 text-sm">
            {data.lots.byStatus.map(function (item, index) {
              return (
                <div key={index} className="flex justify-between">
                  <span className="text-slate-500">{item.status}</span>
                  <span className="font-medium text-slate-800">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Don hang</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Tong don hang</span>
            <span className="font-medium text-slate-800">{data.orders.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Da hoan tat</span>
            <span className="font-medium text-slate-800">{data.orders.completed}</span>
          </div>
        </div>
      </div>
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

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tim theo ten hoac email..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tat ca vai tro</option>
          <option value="FARMER">Farmer</option>
          <option value="BUYER">Buyer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          Tim kiem
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Ten</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Vai tro</th>
                <th className="text-left px-6 py-3 font-medium">Trang thai</th>
                <th className="text-left px-6 py-3 font-medium">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-800">{u.full_name}</td>
                  <td className="px-6 py-3 text-slate-500">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {u.is_locked ? (
                      <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Da khoa
                      </span>
                    ) : (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Hoat dong
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {u.role === 'ADMIN' ? (
                      <span className="text-slate-300 text-xs">Khong the khoa</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleLock(u)}
                        disabled={processingId === u.id}
                        className={
                          'flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 ' +
                          (u.is_locked ? 'text-green-600 hover:underline' : 'text-red-600 hover:underline')
                        }
                      >
                        {u.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
                        {u.is_locked ? 'Mo khoa' : 'Khoa'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-sm">Khong co nguoi dung nao</p>
          ) : null}
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
      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          Loc
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Ma lo</th>
                <th className="text-left px-6 py-3 font-medium">Ten</th>
                <th className="text-left px-6 py-3 font-medium">Farmer</th>
                <th className="text-left px-6 py-3 font-medium">Trang thai</th>
                <th className="text-left px-6 py-3 font-medium">Hien thi</th>
                <th className="text-left px-6 py-3 font-medium">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">{lot.lot_code}</td>
                  <td className="px-6 py-3 font-medium text-slate-800">{lot.title}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {lot.farmer ? lot.farmer.full_name : '-'}
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {lot.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {lot.is_hidden ? (
                      <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Da an
                      </span>
                    ) : (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Cong khai
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleHide(lot)}
                      disabled={processingId === lot.id}
                      className={
                        'flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 ' +
                        (lot.is_hidden ? 'text-green-600 hover:underline' : 'text-red-600 hover:underline')
                      }
                    >
                      {lot.is_hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                      {lot.is_hidden ? 'Hien lai' : 'An'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lots.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-sm">Khong co lo hang nao</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Admin Dashboard</h1>
      <p className="text-slate-500 mb-6">Quan ly va giam sat toan bo san giao dich</p>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ' +
              (activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700')
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' ? <AnalyticsTab /> : null}
      {activeTab === 'users' ? <UsersTab /> : null}
      {activeTab === 'lots' ? <LotsModerationTab /> : null}
    </div>
  );
}