import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, Search, Bell, ShoppingCart, User, Calendar, Wallet, Download, RefreshCcw, HelpCircle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  Pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  Confirmed: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  'Out for Delivery': { icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  Delivered: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/orders/my');
        const fetchedOrders = res.data.orders || [];
        setOrders(fetchedOrders);
        if (fetchedOrders.length > 0) {
          setExpandedId(fetchedOrders[0].id);
        }
      } catch (e) { console.error(e); toast.error('Failed to load orders'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleDownloadInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank');
    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const orderId = order.id?.slice(0, 8).toUpperCase() || `DF-001`;
    
    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || item.variantLabel}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.qty || item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${((item.price) * (item.qty || item.quantity)).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = (order.items || []).reduce((sum, item) => sum + (item.price * (item.qty || item.quantity)), 0);
    const tax = subtotal * 0.05;
    const delivery = Math.max(0, parseFloat(order.total_amount || 0) - subtotal - tax);

    let addressStr = order.delivery_address || 'N/A';
    if (typeof order.delivery_address === 'object') {
      addressStr = `${order.delivery_address.fullName || ''}<br/>${order.delivery_address.street || ''}<br/>${order.delivery_address.city || ''} - ${order.delivery_address.pincode || ''}<br/>Phone: ${order.delivery_address.phone || ''}`;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Invoice #${orderId}</title>
          <style>
            body { font-family: 'Inter', -apple-system, sans-serif; color: #333; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #06724B; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 900; color: #06724B; }
            .invoice-title { font-size: 24px; font-weight: 800; text-transform: uppercase; color: #111; text-align: right; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px; }
            table { border-collapse: collapse; margin-bottom: 30px; width: 100%; }
            th { text-align: left; padding: 12px; background: #f8fafc; font-weight: 700; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .totals { width: 300px; margin-left: auto; border-top: 2px solid #e2e8f0; padding-top: 15px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .totals-row.grand { font-size: 18px; font-weight: 800; color: #06724B; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
            .footer { text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">DairyFresh</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">Premium Milk & Dairy Products<br/>Bangalore, India</div>
            </div>
            <div>
              <div class="invoice-title">Invoice</div>
              <div style="text-align: right; color: #666;">#${orderId}</div>
            </div>
          </div>
          
          <div class="meta">
            <div>
              <strong style="color:#000">Billed To:</strong><br/>
              ${addressStr}
            </div>
            <div style="text-align: right;">
              <strong style="color:#000">Date:</strong> ${orderDate}<br/>
              <strong style="color:#000">Payment:</strong> ${order.payment_method || 'N/A'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row"><span>Subtotal:</span> <span>₹${subtotal.toFixed(2)}</span></div>
            <div class="totals-row"><span>GST (5%):</span> <span>₹${tax.toFixed(2)}</span></div>
            <div class="totals-row"><span>Delivery:</span> <span>₹${delivery.toFixed(2)}</span></div>
            <div class="totals-row grand"><span>Total:</span> <span>₹${parseFloat(order.total_amount || 0).toFixed(2)}</span></div>
          </div>

          <div class="footer">
            Thank you for shopping with DairyFresh!<br/>
            For any queries, please contact support@dairyfresh.com
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    invoiceWindow.document.write(htmlContent);
    invoiceWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24 md:pb-0">
      <CustomerHeader />

      <div className="flex-1 flex flex-col md:flex-row max-w-[1200px] mx-auto w-full p-4 sm:p-5 md:py-8 gap-6 md:gap-8">
        
        {/* Left Column - Orders List */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-black text-gray-900">My Orders</h1>
              <p className="text-[13px] text-gray-500 mt-1">Track and manage your dairy subscriptions and one-time orders.</p>
            </div>
            <div className="relative w-full md:w-72">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input type="text" placeholder="Search orders..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-[15px] font-bold text-gray-900">No orders yet</p>
              <p className="text-[13px] text-gray-500 mt-1">Your order history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, idx) => {
                const isExpanded = expandedId === order.id || (expandedId === null && idx === 0);
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                const Icon = cfg.icon;
                const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                
                if (isExpanded) {
                  return (
                    <div key={order.id} className="bg-white rounded-[20px] border-2 border-emerald-400 shadow-sm overflow-hidden transition-all">
                      {/* Expanded Header */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-[12px] rounded-lg mb-1.5">
                              #{order.id?.slice(0, 8).toUpperCase() || `DF-2024-00${idx+1}`}
                            </span>
                            <p className="text-[13px] text-gray-500 font-medium">{date}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color} ${cfg.border} border mb-1`}>
                              <Icon size={10} /> {order.status}
                            </span>
                            <p className="text-[15px] font-black text-gray-900">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Items Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {order.items?.slice(0, 2).map((item, i) => (
                            <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-medium text-gray-600">
                              {item.name || item.variantLabel} ({item.qty || item.quantity})
                            </span>
                          ))}
                          {order.items?.length > 2 && (
                            <span className="px-3 py-1.5 text-[11px] font-bold text-primary">
                              + {order.items.length - 2} more
                            </span>
                          )}
                        </div>

                        {/* Detailed Tracking Section */}
                        <div className="border-t border-gray-100 pt-5">
                          <div className="flex justify-between items-center mb-5">
                            <h3 className="text-[13px] font-bold text-gray-900">Detailed Tracking</h3>
                            <button onClick={() => handleDownloadInvoice(order)} className="text-[12px] font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1.5"><Download size={14}/> Download Invoice</button>
                          </div>

                          <div className="flex flex-col md:flex-row gap-8">
                            {/* Items Breakdown */}
                            <div className="flex-1 space-y-3">
                              {order.items?.slice(0,2).map((item, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                  <img src={item.image || 'https://placehold.co/100x100/F4F4F5/A1A1AA?text=Item'} alt="Item" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-[12px] font-bold text-gray-900 truncate">{item.name || item.variantLabel}</h4>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{item.qty || item.quantity} x {item.variantLabel}</p>
                                  </div>
                                  <span className="text-[13px] font-bold text-gray-900">₹{(item.price * (item.qty || item.quantity)).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Tracking Timeline & Address */}
                            <div className="flex-1 md:max-w-[240px]">
                              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-4">
                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Estimated Delivery</p>
                                <p className="text-[12px] font-bold text-gray-900">Tomorrow, 6:00 AM - 9:00 AM</p>
                              </div>
                              <div className="mb-6">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery Address</p>
                                <p className="text-[11px] text-gray-600 leading-relaxed">
                                  {typeof order.delivery_address === 'object' ? `${order.delivery_address.street || ''}, ${order.delivery_address.city || ''} - ${order.delivery_address.pincode || ''}` : order.delivery_address || 'Address not found'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tracking Steps */}
                          <div className="mt-8 relative">
                            <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-gray-100"></div>
                            
                            <div className="flex gap-4 mb-5 relative z-10">
                              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm border-2 border-white"><CheckCircle size={12} /></div>
                              <div>
                                <p className="text-[12px] font-bold text-gray-900">Order Placed</p>
                                <p className="text-[10px] text-gray-500">12 May, 08:30 PM</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 mb-5 relative z-10">
                              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm border-2 border-white"><CheckCircle size={12} /></div>
                              <div>
                                <p className="text-[12px] font-bold text-gray-900">Confirmed</p>
                                <p className="text-[10px] text-gray-500">12 May, 09:15 PM</p>
                              </div>
                            </div>

                            <div className="flex gap-4 mb-5 relative z-10">
                              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm border-2 border-white"><Truck size={12} /></div>
                              <div>
                                <p className="text-[12px] font-bold text-orange-600">Out for Delivery</p>
                                <p className="text-[10px] text-gray-500">Leaving Hub: 05:45 AM</p>
                              </div>
                            </div>

                            <div className="flex gap-4 relative z-10">
                              <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 shadow-sm border-2 border-white"><CheckCircle size={12} /></div>
                              <div>
                                <p className="text-[12px] font-bold text-gray-400">Delivered</p>
                                <p className="text-[10px] text-gray-400">Awaiting arrival</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                        <button className="flex-1 bg-[#06724B] text-white font-bold py-3 rounded-xl text-[13px] hover:bg-emerald-800 transition-colors">
                          Reorder Items
                        </button>
                        <button className="px-6 py-3 border border-[#06724B] text-[#06724B] font-bold rounded-xl text-[13px] hover:bg-emerald-50 transition-colors">
                          Help
                        </button>
                      </div>
                    </div>
                  );
                }

                // Collapsed State
                return (
                  <div key={order.id} onClick={() => setExpandedId(order.id)} 
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-gray-900 mb-0.5">#{order.id?.slice(0, 8).toUpperCase() || `DF-2024-00${idx+1}`}</p>
                        <p className="text-[11px] text-gray-500">{date} • {order.items?.length || 1} Items</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[14px] font-black text-gray-900 mb-1">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${cfg.bg} ${cfg.color}`}>
                          {order.status}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-[340px] shrink-0 space-y-6">
          {/* Delivery Dashboard */}
          <div className="bg-[#2A3441] rounded-[20px] p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <h3 className="text-[13px] font-bold text-white mb-2 relative z-10">Delivery Dashboard</h3>
            <p className="text-[11px] text-gray-300 leading-relaxed mb-6 relative z-10">
              You've saved 4kg of plastic this month by using our refillable glass bottle program!
            </p>
            <div className="flex gap-3 relative z-10">
              <div className="flex-1 bg-white/10 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Active Subs</p>
                <p className="text-lg font-black">03</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] text-gray-400 font-medium mb-1">Dairy Coins</p>
                <p className="text-lg font-black">1,240</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm">
            <h3 className="text-[13px] font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex gap-3">
              <button className="flex-1 flex flex-col items-center justify-center gap-2 py-4 border border-gray-100 rounded-xl hover:border-primary hover:bg-emerald-50/30 transition-all group">
                <Calendar size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900">Pause Orders</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center gap-2 py-4 border border-gray-100 rounded-xl hover:border-primary hover:bg-emerald-50/30 transition-all group">
                <Wallet size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900">Add Money</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
