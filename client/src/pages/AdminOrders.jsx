import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Bell, Download, ChevronDown, Settings,
  ChevronUp, Truck, CheckCircle2, Clock, XCircle, MapPin, 
  Phone, Edit, Package, Plus
} from 'lucide-react';

const mockOrders = [
  {
    id: '#ORD-8821',
    customer: { name: 'Sarah Jenkins', phone: '+1 (555) 012-3456', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    itemsCount: 3,
    total: 24.50,
    deliverySlot: '06:00 AM - 08:00 AM',
    status: 'Pending',
    timeAgo: '2 Mins Ago',
    items: [
      { id: 1, name: 'Fresh Whole Milk (1L)', price: 3.50, quantity: 2, type: 'milk' },
      { id: 2, name: 'Paneer (200g)', price: 17.50, quantity: 1, type: 'paneer' }
    ],
    deliveryDetails: {
      address: '123 Green Lane, Meadow View, Suite 405, Floor 4',
      instruction: 'Please leave by the front door, ring doorbell twice.'
    }
  },
  {
    id: '#ORD-8820',
    customer: { name: 'Michael Chen', phone: '+1 (555) 987-6543', avatar: 'https://i.pravatar.cc/150?u=michael' },
    itemsCount: 1,
    total: 12.00,
    deliverySlot: '08:00 AM - 10:00 AM',
    status: 'Confirmed',
    timeAgo: '15 Mins Ago',
    items: [{ id: 3, name: 'Toned Milk (1L)', price: 12.00, quantity: 1, type: 'milk' }],
    deliveryDetails: { address: '45 Tech Park, Block B', instruction: 'Call before arriving.' }
  },
  {
    id: '#ORD-8819',
    customer: { name: 'Alicia Moore', phone: '+1 (555) 444-2211', initial: 'AM' },
    itemsCount: 5,
    total: 64.20,
    deliverySlot: 'Evening Slot',
    status: 'Out for Delivery',
    timeAgo: '1 Hour Ago',
    items: [],
    deliveryDetails: { address: '78 Pine Street', instruction: '' }
  },
  {
    id: '#ORD-8818',
    customer: { name: 'Robert Wilson', phone: '+1 (555) 222-3333', avatar: 'https://i.pravatar.cc/150?u=robert' },
    itemsCount: 2,
    total: 8.90,
    deliverySlot: '06:00 AM - 08:00 AM',
    status: 'Delivered',
    timeAgo: '2 Hours Ago',
    items: [],
    deliveryDetails: { address: '12 Maple Ave', instruction: '' }
  },
  {
    id: '#ORD-8817',
    customer: { name: 'James Taylor', phone: '+1 (555) 777-8888', initial: 'JT' },
    itemsCount: 3,
    total: 32.15,
    deliverySlot: 'Evening Slot',
    status: 'Cancelled',
    timeAgo: '3 Hours Ago',
    items: [],
    deliveryDetails: { address: '90 Oak Rd', instruction: '' }
  }
];

const statusConfig = {
  'Pending': { bg: 'bg-orange-50', text: 'text-orange-600', icon: <Clock size={14} className="mr-1.5" /> },
  'Confirmed': { bg: 'bg-blue-50', text: 'text-blue-600', icon: <CheckCircle2 size={14} className="mr-1.5" /> },
  'Out for Delivery': { bg: 'bg-purple-50', text: 'text-purple-600', icon: <Truck size={14} className="mr-1.5" /> },
  'Delivered': { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 size={14} className="mr-1.5" /> },
  'Cancelled': { bg: 'bg-red-50', text: 'text-red-600', icon: <XCircle size={14} className="mr-1.5" /> }
};

export default function AdminOrders() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState(mockOrders);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(['#ORD-8821']);

  const tabs = ['All', 'Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || 
      (activeTab === 'Delivery' ? order.status === 'Out for Delivery' : order.status === activeTab);
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oId => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const toggleExpand = (id) => {
    if (expandedOrders.includes(id)) {
      setExpandedOrders(expandedOrders.filter(oId => oId !== id));
    } else {
      setExpandedOrders([...expandedOrders, id]);
    }
  };

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const bulkUpdateStatus = (newStatus) => {
    setOrders(orders.map(o => selectedOrders.includes(o.id) ? { ...o, status: newStatus } : o));
    setSelectedOrders([]);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders, customers, or items..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 ml-4">
            <button className="flex items-center gap-2 hover:bg-gray-50 px-4 py-2 border border-gray-200 shadow-sm rounded-lg text-sm font-medium text-gray-700 transition-colors">
              <Download size={16} /> Export CSV
            </button>
            <div className="flex items-center gap-4 border-l pl-6 border-gray-200">
              <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white">3</span>
              </button>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <Settings size={20} />
              </button>
              <div className="flex items-center gap-3 ml-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Store Manager</p>
                </div>
                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Title */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-500 text-sm mt-1">Total <span className="font-bold text-primary">145</span> active orders today</p>
              </div>
            </div>

            {/* Board Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              
              {/* Toolbar */}
              <div className="p-4 md:p-6 border-b border-gray-100 space-y-4 md:space-y-5">
                
                {/* Tabs */}
                <div className="flex gap-2 text-sm overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  {tabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 md:px-5 py-2 rounded-full font-medium transition-all whitespace-nowrap shrink-0 text-xs md:text-sm ${
                        activeTab === tab 
                          ? 'bg-primary-light text-primary border-primary-light/50' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent'
                      } border`}
                    >
                      {tab} {(tab === 'All' || tab === 'Pending') && <span className="ml-1 opacity-70">({tab === 'All' ? orders.length : orders.filter(o => o.status === 'Pending').length})</span>}
                    </button>
                  ))}
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
                  <select className="bg-gray-50 border border-gray-200 text-xs md:text-sm rounded-lg px-3 md:px-4 py-2 md:py-2.5 outline-none focus:border-primary text-gray-700 font-medium cursor-pointer">
                    <option>Last 7 Days</option>
                    <option>Today</option>
                    <option>This Month</option>
                  </select>
                  
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Order ID or Customer..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedOrders.length > 0 && (
                  <div className="flex items-center justify-between bg-primary-light/30 border border-primary/20 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-primary">BULK ACTIONS ({selectedOrders.length} SELECTED)</span>
                      <button onClick={() => bulkUpdateStatus('Confirmed')} className="text-xs font-medium bg-white text-gray-700 px-3 py-1.5 rounded border border-gray-200 shadow-sm hover:border-primary hover:text-primary transition-colors">
                        Mark as Confirmed
                      </button>
                      <button onClick={() => bulkUpdateStatus('Delivered')} className="text-xs font-medium bg-white text-gray-700 px-3 py-1.5 rounded border border-gray-200 shadow-sm hover:border-primary hover:text-primary transition-colors">
                        Mark as Delivered
                      </button>
                    </div>
                    <button onClick={() => setSelectedOrders([])} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                      Deselect All
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto min-h-[400px]">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="text-xs text-gray-400 uppercase bg-white font-bold tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary accent-primary" 
                          checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-4">Order ID</th>
                      <th className="px-4 py-4">Customer</th>
                      <th className="px-4 py-4">Items</th>
                      <th className="px-4 py-4">Total</th>
                      <th className="px-4 py-4">Delivery Slot</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        {/* Main Row */}
                        <tr className={`hover:bg-gray-50/50 transition-colors group ${expandedOrders.includes(order.id) ? 'bg-gray-50/50' : ''}`}>
                          <td className="px-6 py-5 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => toggleSelectOrder(order.id)}
                              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary accent-primary cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-5">
                            <div className="font-bold text-gray-900">{order.id}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{order.timeAgo}</div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              {order.customer.avatar ? (
                                <img src={order.customer.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs border border-gray-300">
                                  {order.customer.initial}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-gray-900">{order.customer.name}</div>
                                <div className="text-xs text-gray-500">{order.customer.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="font-medium text-gray-800">{order.itemsCount}</div>
                            <div className="text-xs text-gray-500">Items</div>
                          </td>
                          <td className="px-4 py-5 font-bold text-gray-900">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-5 text-gray-600 font-medium">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-gray-400" />
                              {order.deliverySlot}
                            </div>
                          </td>
                          <td className="px-4 py-5 relative">
                            <select 
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              className={`appearance-none font-bold text-xs px-3 py-1.5 pr-8 rounded-full border-none outline-none cursor-pointer ${statusConfig[order.status].bg} ${statusConfig[order.status].text}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <ChevronDown size={14} className={`absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none ${statusConfig[order.status].text}`} />
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button 
                              onClick={() => toggleExpand(order.id)}
                              className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors inline-flex"
                            >
                              {expandedOrders.includes(order.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Content Area */}
                        {expandedOrders.includes(order.id) && (
                          <tr className="bg-gray-50/50 border-b border-gray-200">
                            <td colSpan="8" className="px-6 py-6 pb-8">
                              <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm ml-12 max-w-5xl">
                                
                                {/* Item List */}
                                <div className="flex-1">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Full Item List</h4>
                                  <div className="space-y-4">
                                    {order.items && order.items.length > 0 ? order.items.map(item => (
                                      <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border border-gray-100 ${item.type === 'milk' ? 'bg-blue-50 text-blue-500' : 'bg-primary-light text-primary'}`}>
                                            <Package size={20} />
                                          </div>
                                          <div>
                                            <h5 className="font-bold text-gray-900 text-sm">{item.name}</h5>
                                            <p className="text-xs text-gray-500">${item.price.toFixed(2)} per unit</p>
                                          </div>
                                        </div>
                                        <div className="font-bold text-gray-900 text-sm bg-white px-3 py-1 rounded shadow-sm border border-gray-100">
                                          x{item.quantity}
                                        </div>
                                      </div>
                                    )) : (
                                      <div className="text-sm text-gray-500 italic py-2">Details not loaded completely for mock demo</div>
                                    )}
                                  </div>
                                </div>

                                {/* Delivery Details */}
                                <div className="flex-1 relative">
                                  <div className="absolute inset-y-0 left-0 w-px bg-gray-100 hidden md:block -ml-4"></div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Delivery Details</h4>
                                  <div className="space-y-4">
                                    <div className="flex gap-3">
                                      <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                      <div className="text-sm font-medium text-gray-700 leading-relaxed max-w-xs cursor-text selection:bg-primary-light">
                                        {order.deliveryDetails.address}
                                      </div>
                                    </div>
                                    {order.deliveryDetails.instruction && (
                                      <div className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 mt-2 ml-1"></div>
                                        <div className="text-xs text-gray-500 italic max-w-xs">
                                          "{order.deliveryDetails.instruction}"
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex gap-3 pt-3">
                                      <button className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2">
                                        <Edit size={14} /> Edit Address
                                      </button>
                                      <button className="text-xs font-bold text-primary bg-primary-light border border-transparent px-4 py-2 rounded-lg py-2 hover:bg-primary hover:text-white shadow-sm transition-all flex items-center gap-2">
                                        <Phone size={14} /> Contact Customer
                                      </button>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-lg font-medium text-gray-900">No orders found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">No orders found</p>
                  </div>
                ) : filteredOrders.map(order => (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {order.customer.avatar ? (
                          <img src={order.customer.avatar} alt="" className="w-9 h-9 rounded-full border border-gray-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">{order.customer.initial}</div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{order.customer.name}</p>
                          <p className="text-xs text-gray-400">{order.id} · {order.timeAgo}</p>
                        </div>
                      </div>
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`appearance-none font-bold text-[10px] px-2.5 py-1 rounded-full border-none outline-none ${statusConfig[order.status].bg} ${statusConfig[order.status].text}`}>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={13} />
                        <span className="text-xs">{order.deliverySlot}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{order.itemsCount} items</span>
                        <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <button onClick={() => toggleExpand(order.id)} className="w-full text-xs text-center py-1.5 text-primary font-medium bg-primary-light/30 rounded-lg">
                      {expandedOrders.includes(order.id) ? 'Hide Details ▲' : 'View Details ▼'}
                    </button>
                    {expandedOrders.includes(order.id) && (
                      <div className="space-y-3 pt-1">
                        {order.items && order.items.length > 0 && order.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'milk' ? 'bg-blue-50 text-blue-500' : 'bg-primary-light text-primary'}`}>
                                <Package size={16} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-xs">{item.name}</p>
                                <p className="text-[10px] text-gray-500">${item.price.toFixed(2)} each</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-100">x{item.quantity}</span>
                          </div>
                        ))}
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                          <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                          <span>{order.deliveryDetails.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs md:text-sm">
                <span className="text-gray-500">
                  <strong>{filteredOrders.length}</strong> of {orders.length}
                </span>
                <div className="flex gap-1">
                  <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white">&lt;</button>
                  <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded border border-primary bg-primary text-white font-bold">1</button>
                  <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 bg-white">&gt;</button>
                </div>
              </div>

            </div>

            {/* Bottom Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 pb-24 md:pb-20">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending</p>
                  <p className="text-2xl font-black text-gray-900">28</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner">
                  <Clock size={24} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-blue-500 shadow-md shadow-blue-500/10 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Confirmed</p>
                  <p className="text-2xl font-black text-gray-900">112</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md relative z-10">
                  <CheckCircle2 size={24} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">In Route</p>
                  <p className="text-2xl font-black text-gray-900">14</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shadow-inner">
                  <Truck size={24} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Delivered</p>
                  <p className="text-2xl font-black text-gray-900">892</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      
      {/* Floating Action Button */}
      <button className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-12 h-12 md:w-14 md:h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none z-30">
        <Plus size={24} />
      </button>

    </div>
  );
}
