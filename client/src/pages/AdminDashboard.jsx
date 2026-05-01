import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Search, Bell, TrendingUp, DollarSign, ShoppingCart,
  RefreshCcw, Truck, MoreVertical, Filter, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeSubscriptions: 0,
    pendingDeliveries: 0,
    lowStock: [],
    weeklyChart: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Confirmed': return 'bg-blue-100 text-blue-700';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center h-full">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-14 md:h-16 px-4 md:px-8 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
          <div className="relative flex-1 max-w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-gray-50 border-none pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-3">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 md:p-8 overflow-y-auto flex-1 h-full pb-24 md:pb-20">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            {/* Stat Card 1 */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <p className="text-gray-500 text-sm font-medium mb-1">Today's Orders</p>
                   <h3 className="text-3xl font-bold text-gray-900">{stats.todayOrders}</h3>
                 </div>
                 <div className="p-2 bg-primary-light rounded-lg text-primary">
                    <ShoppingCart size={20} />
                 </div>
               </div>
               <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                 <TrendingUp size={14} /> View Details
               </p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <p className="text-gray-500 text-sm font-medium mb-1">Revenue Today</p>
                   <h3 className="text-3xl font-bold text-gray-900">₹{stats.todayRevenue.toFixed(2)}</h3>
                 </div>
                 <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <DollarSign size={20} />
                 </div>
               </div>
               <p className="text-xs text-gray-500">Target: ₹15,000</p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <p className="text-gray-500 text-sm font-medium mb-1">Active Subscriptions</p>
                   <h3 className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</h3>
                 </div>
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <RefreshCcw size={20} />
                 </div>
               </div>
               <p className="text-xs font-medium text-primary">Manage</p>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <p className="text-gray-500 text-sm font-medium mb-1">Pending Deliveries</p>
                   <h3 className="text-3xl font-bold text-gray-900">{stats.pendingDeliveries}</h3>
                 </div>
                 <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Truck size={20} />
                 </div>
               </div>
               <p className="text-xs text-gray-500">View Map</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            
            {/* Chart Section */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">Daily Orders This Week</h3>
                  <p className="text-xs text-gray-500">Order volume performance</p>
                </div>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-600 outline-none">
                  <option>Last 7 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{fill: '#f3f4f6'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="orders" 
                      fill="#1D9E75" 
                      radius={[4, 4, 0, 0]} 
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-500">⚠️</span> Low Stock Alerts
              </h3>
              
              <div className="space-y-4 flex-1">
                {stats.lowStock.length > 0 ? stats.lowStock.map((item, idx) => {
                  const img = item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) : 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=400&auto=format&fit=crop';
                  return (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                    <img src={img} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name} {item.variant ? `(${item.variant})` : ''}</p>
                      <p className="text-xs text-gray-500">Category: {item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{item.stock} Left</p>
                      <Link to="/admin/inventory" className="text-[10px] uppercase font-bold text-primary mt-1 hover:underline tracking-wider">Restock</Link>
                    </div>
                  </div>
                )}) : (
                  <div className="flex items-center justify-center h-full text-sm text-gray-500">
                    All products are well stocked!
                  </div>
                )}
              </div>

              <Link to="/admin/inventory" className="w-full py-2.5 mt-4 border border-primary text-primary font-medium rounded-lg hover:bg-primary-light transition-colors text-sm block text-center">
                View Inventory
              </Link>
            </div>
            
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Recent Orders</h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter size={14} /> <span className="hidden sm:inline">Filter</span>
                </button>
                <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-xs md:text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                  <Download size={14} /> <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
            
            
            {/* Desktop Table - hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentOrders && stats.recentOrders.length > 0 ? stats.recentOrders.map((order, i) => {
                    let itemsArray = [];
                    try { itemsArray = Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items) : []); } catch(e) { itemsArray = []; }
                    const itemNames = Array.isArray(itemsArray) ? itemsArray.map(it => `${it?.name || 'Item'} (${it?.quantity || 1})`).join(', ') : '-';

                    return (
                    <tr key={order.id || i} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900">#{order.id?.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            i % 4 === 0 ? 'bg-blue-100 text-blue-700' : 
                            i % 4 === 1 ? 'bg-purple-100 text-purple-700' : 
                            i % 4 === 2 ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-pink-100 text-pink-700'
                          }`}>
                            {(order.user_name || 'U').split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{order.user_name || 'Guest'}</p>
                            <p className="text-xs text-gray-500">{typeof order.delivery_address === 'object' ? (order.delivery_address?.street || 'N/A') : 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]" title={itemNames}>{itemNames || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">₹{Number(order.total_amount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  )}) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - visible only on mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {stats.recentOrders && stats.recentOrders.length > 0 ? stats.recentOrders.map((order, i) => {
                let itemsArray = [];
                try { itemsArray = Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items) : []); } catch(e) { itemsArray = []; }
                const itemNames = Array.isArray(itemsArray) ? itemsArray.map(it => `${it?.name || 'Item'} x${it?.quantity || 1}`).join(', ') : '-';

                return (
                  <div key={order.id || i} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                          i % 4 === 0 ? 'bg-blue-100 text-blue-700' : 
                          i % 4 === 1 ? 'bg-purple-100 text-purple-700' : 
                          i % 4 === 2 ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-pink-100 text-pink-700'
                        }`}>
                          {(order.user_name || 'U').split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{order.user_name || 'Guest'}</p>
                          <p className="text-xs text-gray-400">#{order.id?.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-gray-500 truncate max-w-[200px]">{itemNames || '-'}</p>
                      <p className="font-bold text-gray-900">₹{Number(order.total_amount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-gray-500 text-sm">No recent orders found.</div>
              )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <p className="text-xs md:text-sm">Showing {stats.recentOrders?.length || 0} orders</p>
              <div className="flex items-center gap-1">
                <button className="px-2 md:px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs md:text-sm">Previous</button>
                <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-primary text-white rounded-lg font-medium text-xs md:text-sm">1</button>
                <button className="px-2 md:px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs md:text-sm">Next</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
