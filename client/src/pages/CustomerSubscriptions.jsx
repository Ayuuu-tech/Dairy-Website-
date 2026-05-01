import { useState, useEffect } from 'react';
import { Calendar, Clock, RotateCcw, Search, Bell, ShoppingCart, User, CalendarDays, CheckCircle2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function CustomerSubscriptions() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('alternate');
  const [isHovered, setIsHovered] = useState(null);
  
  const [subs, setSubs] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, prodsRes] = await Promise.all([
        api.get('/subscriptions/my'),
        api.get('/products')
      ]);
      setSubs(subsRes.data || []);
      const productsList = prodsRes.data?.products || prodsRes.data || [];
      setProducts(productsList);
      if (productsList.length > 0) {
        setSelectedProductId(productsList[0].id);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    if (!selectedProductId) return toast.error('Please select a product first');
    try {
      await api.post('/subscriptions', {
        product_id: selectedProductId,
        plan_type: planType,
        quantity: 1
      });
      toast.success('Successfully subscribed!');
      fetchData(); // Refresh list
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to subscribe');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/subscriptions/${id}/status`, { status });
      toast.success(`Subscription ${status}`);
      fetchData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const activeSubs = subs.filter(s => s.status === 'active');
  const pastSubs = subs.filter(s => s.status !== 'active');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0">
      {/* Header */}
      <CustomerHeader />

      {/* Main Content */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 pt-8 md:pt-12 pb-10 md:pb-20 space-y-12 md:space-y-16">
        
        {/* Active Subscription Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-black text-gray-900">Active Subscriptions</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : activeSubs.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center text-gray-500">
              No active subscriptions. Choose a plan below!
            </div>
          ) : (
            <div className="space-y-6">
              {activeSubs.map(sub => (
                <div key={sub.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4 md:gap-8">
                    <img src={sub.image_url ? `http://localhost:5000${sub.image_url}` : "https://placehold.co/120x120/F4F4F5/A1A1AA?text=Milk"} alt={sub.product_name} className="w-16 h-16 md:w-24 md:h-24 rounded-2xl object-cover border border-gray-100 shrink-0 shadow-sm" />
                    <div className="space-y-2 md:space-y-3">
                      <h3 className="text-[15px] md:text-[18px] font-black text-gray-900 tracking-tight">{sub.product_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 md:gap-6 text-[12px] md:text-[13px] text-gray-500">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="p-1 bg-gray-50 rounded-lg border border-gray-200 inline-block shadow-sm"><PackageIcon /></span>
                          {sub.plan_type.toUpperCase()} - {sub.quantity} units
                        </span>
                        <span className="flex items-center gap-1.5 font-medium bg-emerald-50 text-emerald-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-emerald-100 whitespace-nowrap text-[11px] md:text-[13px]">
                          <Clock size={14} className="text-emerald-500 shrink-0" /> {new Date(sub.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto justify-end">
                    <button onClick={() => handleStatusUpdate(sub.id, 'paused')} className="text-[12px] font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-lg transition-colors">Pause</button>
                    <button onClick={() => handleStatusUpdate(sub.id, 'cancelled')} className="text-[12px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Choose a Plan Section */}
        <section id="plans" className="scroll-mt-32 pt-8">
          <div className="mb-6 md:mb-8 max-w-full md:max-w-sm">
            <label className="block text-[13px] font-bold text-gray-700 mb-2">Select Product to Subscribe to:</label>
            <select 
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - ₹{p.variants?.[0]?.price || 0}</option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <h2 className="text-[20px] font-black text-gray-900">Choose a Plan</h2>
            <p className="text-[14px] text-gray-500 mt-2">Flexible options for your daily dairy needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 lg:gap-10 pt-4">
            {/* Daily Plan */}
            <div 
              onClick={() => setSelectedPlan('daily')}
              onMouseEnter={() => setIsHovered('daily')}
              onMouseLeave={() => setIsHovered(null)}
              className={`bg-white rounded-3xl border-2 cursor-pointer transition-all duration-300 p-6 md:p-8 flex flex-col items-center
                ${selectedPlan === 'daily' ? 'border-[#06724B] ring-4 ring-emerald-50 shadow-xl md:scale-105 z-10' : 'border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-lg hover:-translate-y-2'}
              `}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${selectedPlan === 'daily' ? 'bg-[#06724B] text-white shadow-md' : 'bg-emerald-50 text-[#06724B]'}`}>
                <CalendarDays size={24} />
              </div>
              <h3 className="text-[18px] font-black text-gray-900">Daily</h3>
              <p className="text-[13px] text-gray-500 mt-1 mb-6">Every Day Delivery</p>
              
              <ul className="text-[14px] text-gray-500 space-y-4 mb-10 w-full px-2">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#06724B] shrink-0"/> <span className="font-medium">30 Deliveries per month</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#06724B] shrink-0"/> <span className="font-medium">Priority morning slot</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#06724B] shrink-0"/> <span className="font-medium">Free door-step delivery</span></li>
              </ul>
              <button onClick={() => handleSubscribe('daily')} className={`w-full py-4 text-[14px] font-bold rounded-xl mt-auto transition-all ${selectedPlan === 'daily' ? 'bg-[#06724B] text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-50 text-[#06724B] hover:bg-[#06724B] hover:text-white hover:shadow-lg'}`}>
                {selectedPlan === 'daily' ? 'Subscribe Daily' : 'Select Plan'}
              </button>
            </div>

            {/* Alternate Days Plan */}
            <div 
              onClick={() => setSelectedPlan('alternate')}
              onMouseEnter={() => setIsHovered('alternate')}
              onMouseLeave={() => setIsHovered(null)}
              className={`bg-white rounded-3xl border-2 cursor-pointer transition-all duration-300 p-6 md:p-8 flex flex-col items-center relative
                ${selectedPlan === 'alternate' ? 'border-[#06724B] ring-4 ring-emerald-50 shadow-xl md:scale-105 z-10' : 'border-emerald-200 shadow-lg hover:border-[#06724B] hover:-translate-y-2'}
              `}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#06724B] text-white text-[11px] font-black px-5 py-2 rounded-full tracking-widest uppercase shadow-md flex items-center gap-2 z-20">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span> MOST POPULAR
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mt-3 transition-colors ${selectedPlan === 'alternate' ? 'bg-[#06724B] text-white shadow-md' : 'bg-emerald-50 text-[#06724B]'}`}>
                <Calendar size={24} />
              </div>
              <h3 className="text-[18px] font-black text-gray-900">Alternate Days</h3>
              <p className="text-[13px] text-gray-500 mt-1 mb-6">15 Deliveries monthly</p>
              
              <ul className="text-[14px] text-gray-500 space-y-4 mb-10 w-full px-2">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#06724B] shrink-0"/> <span className="font-medium">Flexible schedule toggle</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#06724B] shrink-0"/> <span className="font-medium">Perfect for small families</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#06724B] shrink-0"/> <span className="font-medium">Zero cancellation fee</span></li>
              </ul>
              <button onClick={() => handleSubscribe('alternate')} className={`w-full py-4 text-[14px] font-bold rounded-xl mt-auto transition-all ${selectedPlan === 'alternate' ? 'bg-[#06724B] text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-50 text-[#06724B] hover:bg-[#06724B] hover:text-white hover:shadow-lg'}`}>
                {selectedPlan === 'alternate' ? 'Subscribe Alternate' : 'Select Plan'}
              </button>
            </div>

            {/* Weekends Plan */}
            <div 
              onClick={() => setSelectedPlan('weekends')}
              onMouseEnter={() => setIsHovered('weekends')}
              onMouseLeave={() => setIsHovered(null)}
              className={`bg-white rounded-3xl border-2 cursor-pointer transition-all duration-300 p-6 md:p-8 flex flex-col items-center
                ${selectedPlan === 'weekends' ? 'border-[#06724B] ring-4 ring-emerald-50 shadow-xl md:scale-105 z-10' : 'border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-lg hover:-translate-y-2'}
              `}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${selectedPlan === 'weekends' ? 'bg-[#06724B] text-white shadow-md' : 'bg-emerald-50 text-[#06724B]'}`}>
                <CalendarDays size={24} />
              </div>
              <h3 className="text-[18px] font-black text-gray-900">Weekends</h3>
              <p className="text-[13px] text-gray-500 mt-1 mb-6">Saturday & Sunday</p>
              
              <ul className="text-[14px] text-gray-500 space-y-4 mb-10 w-full px-2">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#06724B] shrink-0"/> <span className="font-medium">Custom day selection</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#06724B] shrink-0"/> <span className="font-medium">Ideal for office usage</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#06724B] shrink-0"/> <span className="font-medium">Manage via calendar</span></li>
              </ul>
              <button onClick={() => handleSubscribe('weekends')} className={`w-full py-4 text-[14px] font-bold rounded-xl mt-auto transition-all ${selectedPlan === 'weekends' ? 'bg-[#06724B] text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-50 text-[#06724B] hover:bg-[#06724B] hover:text-white hover:shadow-lg'}`}>
                {selectedPlan === 'weekends' ? 'Subscribe Weekends' : 'Select Plan'}
              </button>
            </div>
          </div>
        </section>

        {/* Subscription History Section */}
        {pastSubs.length > 0 && (
          <section className="pt-12">
            <div className="mb-10">
              <h2 className="text-[20px] font-black text-gray-900">Subscription History</h2>
            </div>
            
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest w-2/5">Plan Details</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest">Started</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pastSubs.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                              <RotateCcw size={18} />
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-gray-900">{s.product_name}</p>
                              <p className="text-[12px] text-gray-500 mt-0.5">{s.plan_type.toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-[13px] font-medium text-gray-600">{new Date(s.start_date).toLocaleDateString()}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-widest border ${s.status === 'paused' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {pastSubs.map(s => (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                        <RotateCcw size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{s.product_name}</p>
                        <p className="text-[11px] text-gray-400">{s.plan_type.toUpperCase()} · {new Date(s.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase border ${s.status === 'paused' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

const PackageIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);
