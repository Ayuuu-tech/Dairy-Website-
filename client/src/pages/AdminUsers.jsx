import { useState, useEffect } from 'react';
import { Search, Bell, Users, Mail, Phone, MapPin, Calendar, ChevronLeft, ChevronRight, Shield, ShoppingBag } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const tabs = ['All', 'Customers', 'Admins'];
  const avatarColors = ['bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-emerald-100 text-emerald-700','bg-pink-100 text-pink-700','bg-amber-100 text-amber-700'];

  useEffect(() => { fetchUsers(); }, [activeTab, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: 15 };
      if (activeTab === 'Customers') params.role = 'customer';
      if (activeTab === 'Admins') params.role = 'admin';
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || { total: res.data.users?.length || 0, page: 1, pages: 1 });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 md:h-16 px-4 md:px-8 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
          <div className="relative flex-1 max-w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
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
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 text-sm mt-1">Total <span className="font-bold text-primary">{pagination.total}</span> registered users</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex gap-2 text-sm overflow-x-auto pb-1 scrollbar-hide">
                  {tabs.map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab); setPagination(p => ({...p, page: 1})); }}
                      className={`px-4 md:px-5 py-2 rounded-full font-medium transition-all whitespace-nowrap shrink-0 text-xs md:text-sm ${activeTab === tab ? 'bg-primary-light text-primary' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'} border border-transparent`}>
                      {tab}
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
                  <div className="hidden md:block overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-4 py-4">Email</th>
                          <th className="px-4 py-4">Phone</th>
                          <th className="px-4 py-4">Role</th>
                          <th className="px-4 py-4">Addresses</th>
                          <th className="px-4 py-4">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filtered.map((u, i) => (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${avatarColors[i % avatarColors.length]}`}>
                                  {u.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                                </div>
                                <div className="font-bold text-gray-900">{u.name}</div>
                              </div>
                            </td>
                            <td className="px-4 py-5 text-gray-600"><Mail size={14} className="inline mr-2 text-gray-400" />{u.email}</td>
                            <td className="px-4 py-5 text-gray-600"><Phone size={14} className="inline mr-2 text-gray-400" />{u.phone || '—'}</td>
                            <td className="px-4 py-5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                {u.role === 'admin' ? <Shield size={12} /> : <ShoppingBag size={12} />} {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-5 text-gray-500"><MapPin size={14} className="inline mr-1 text-gray-400" />{u.addresses?.length || 0} saved</td>
                            <td className="px-4 py-5 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          </tr>
                        ))}
                        {filtered.length === 0 && (
                          <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-lg font-medium text-gray-900">No users found</p>
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-medium text-gray-900">No users found</p>
                      </div>
                    ) : filtered.map((u, i) => (
                      <div key={u.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${avatarColors[i % avatarColors.length]}`}>
                              {u.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                              <p className="text-[11px] text-gray-400">{u.email}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {u.role === 'admin' ? <Shield size={10} /> : <ShoppingBag size={10} />} {u.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 pl-12">
                          {u.phone && <span><Phone size={11} className="inline mr-1" />{u.phone}</span>}
                          <span><MapPin size={11} className="inline mr-1" />{u.addresses?.length || 0} addr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs md:text-sm">
                <span className="text-gray-500">Page <strong>{pagination.page}</strong> / {pagination.pages}</span>
                <div className="flex gap-1">
                  <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({...p, page: p.page - 1}))}
                    className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded border border-primary bg-primary text-white font-bold">{pagination.page}</button>
                  <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
                    className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
