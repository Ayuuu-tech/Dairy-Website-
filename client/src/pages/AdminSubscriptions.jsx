import { useState, useEffect } from 'react';
import { Search, Bell, CalendarSync, Package, Clock, Play, Pause, XCircle, ChevronDown } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const statusConfig = {
  'Active': { bg: 'bg-green-50', text: 'text-green-600', icon: <Play size={14} className="mr-1.5" /> },
  'Paused': { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Pause size={14} className="mr-1.5" /> },
  'Cancelled': { bg: 'bg-red-50', text: 'text-red-600', icon: <XCircle size={14} className="mr-1.5" /> },
};

const planColors = { 'Daily': 'bg-primary-light text-primary', 'Alternate Days': 'bg-blue-50 text-blue-600', 'Weekly': 'bg-purple-50 text-purple-600' };

export default function AdminSubscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Active', 'Paused', 'Cancelled'];

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/all');
      setSubs(res.data || []);
    } catch (e) {
      console.error(e);
      setSubs([]);
    } finally { setLoading(false); }
  };

  const filtered = subs.filter(s => activeTab === 'All' || s.status === activeTab.toLowerCase());

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 md:h-16 px-4 md:px-8 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
          <div className="relative flex-1 max-w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search subscriptions..." className="w-full bg-gray-50 border-none pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-3">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Bell size={20} /></button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">{user?.name?.charAt(0) || 'A'}</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Subscription Management</h1>
              <p className="text-gray-500 text-sm mt-1"><span className="font-bold text-primary">{subs.filter(s => s.status === 'active').length}</span> active subscriptions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {[
                { label: 'Active', count: subs.filter(s => s.status === 'active').length, color: 'text-green-600', bg: 'bg-green-50', icon: <Play size={22} /> },
                { label: 'Paused', count: subs.filter(s => s.status === 'paused').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Pause size={22} /> },
                { label: 'Cancelled', count: subs.filter(s => s.status === 'cancelled').length, color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle size={22} /> },
              ].map(card => (
                <div key={card.label} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                    <p className="text-2xl font-black text-gray-900">{card.count}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>{card.icon}</div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex gap-2 text-sm overflow-x-auto pb-1 scrollbar-hide">
                  {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 md:px-5 py-2 rounded-full font-medium transition-all whitespace-nowrap shrink-0 text-xs md:text-sm ${activeTab === tab ? 'bg-primary-light text-primary' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'} border border-transparent`}>
                      {tab} {tab !== 'All' && <span className="ml-1 opacity-70">({subs.filter(s => s.status === tab.toLowerCase()).length})</span>}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto min-h-[250px]">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-4 py-4">Plan</th>
                          <th className="px-4 py-4">Product</th>
                          <th className="px-4 py-4">Quantity</th>
                          <th className="px-4 py-4">Started</th>
                          <th className="px-4 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filtered.map((s) => {
                          const statusKey = s.status.charAt(0).toUpperCase() + s.status.slice(1);
                          const planKey = s.plan_type === 'alternate' ? 'Alternate Days' : s.plan_type.charAt(0).toUpperCase() + s.plan_type.slice(1);
                          return (
                          <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="font-bold text-gray-900">{s.customer_name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{s.customer_email}</div>
                            </td>
                            <td className="px-4 py-5">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${planColors[planKey] || 'bg-gray-100 text-gray-600'}`}>{planKey}</span>
                            </td>
                            <td className="px-4 py-5 text-gray-600 font-medium">
                              <Package size={14} className="inline mr-1.5 text-gray-400" />{s.product_name}
                            </td>
                            <td className="px-4 py-5 text-gray-600">{s.quantity} units</td>
                            <td className="px-4 py-5 text-gray-500 text-xs">{s.start_date ? new Date(s.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                            <td className="px-4 py-5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig[statusKey]?.bg} ${statusConfig[statusKey]?.text}`}>
                                {statusConfig[statusKey]?.icon}{statusKey}
                              </span>
                            </td>
                          </tr>
                        )})}
                        {filtered.length === 0 && (
                          <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                            <CalendarSync className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-lg font-medium text-gray-900">No subscriptions found</p>
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <CalendarSync className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-medium text-gray-900">No subscriptions</p>
                      </div>
                    ) : filtered.map(s => {
                      const statusKey = s.status.charAt(0).toUpperCase() + s.status.slice(1);
                      const planKey = s.plan_type === 'alternate' ? 'Alternate Days' : s.plan_type.charAt(0).toUpperCase() + s.plan_type.slice(1);
                      return (
                        <div key={s.id} className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{s.customer_name || 'Unknown'}</p>
                              <p className="text-[11px] text-gray-400">{s.customer_email}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig[statusKey]?.bg} ${statusConfig[statusKey]?.text}`}>
                              {statusConfig[statusKey]?.icon}{statusKey}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${planColors[planKey] || 'bg-gray-100 text-gray-600'}`}>{planKey}</span>
                            <span className="text-xs text-gray-600"><Package size={12} className="inline mr-1 text-gray-400" />{s.product_name}</span>
                            <span className="text-xs text-gray-500">· {s.quantity} units</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
