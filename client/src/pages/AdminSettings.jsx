import { useState } from 'react';
import { Search, Bell, Store, Shield, Clock, Palette, Bell as BellIcon, Save, CheckCircle2 } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('store');

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'DairyFresh',
    storeEmail: 'support@dairyfresh.com',
    storePhone: '+91 98765 43210',
    storeAddress: '123 Dairy Lane, Sector 5, Bengaluru - 560001',
    deliveryRadius: '15',
    minOrderAmount: '100',
    deliveryFee: '50',
    freeDeliveryAbove: '500',
  });

  const [slots, setSlots] = useState({
    morningStart: '06:00', morningEnd: '09:00',
    eveningStart: '17:00', eveningEnd: '19:00',
  });

  const [notifications, setNotifications] = useState({
    orderPlaced: true, orderDelivered: true, lowStock: true,
    newUser: false, subscriptionChange: true,
  });

  const sections = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'delivery', label: 'Delivery Slots', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Settings saved successfully'); }, 800);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 px-8 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search settings..." className="w-full bg-gray-50 border-none pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
          </div>
          <div className="flex items-center gap-4">
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

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Configure your store preferences and delivery options</p>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar Nav */}
              <div className="lg:w-56 shrink-0">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 space-y-1">
                  {sections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeSection === s.id ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <s.icon size={18} /> {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {activeSection === 'store' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-4">Store Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        { label: 'Store Name', key: 'storeName', placeholder: 'DairyFresh' },
                        { label: 'Contact Email', key: 'storeEmail', placeholder: 'support@...' },
                        { label: 'Contact Phone', key: 'storePhone', placeholder: '+91...' },
                        { label: 'Delivery Radius (km)', key: 'deliveryRadius', placeholder: '15' },
                        { label: 'Min Order Amount (₹)', key: 'minOrderAmount', placeholder: '100' },
                        { label: 'Delivery Fee (₹)', key: 'deliveryFee', placeholder: '50' },
                        { label: 'Free Delivery Above (₹)', key: 'freeDeliveryAbove', placeholder: '500' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                          <input type="text" value={storeSettings[field.key]} onChange={e => setStoreSettings({...storeSettings, [field.key]: e.target.value})}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" />
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                        <textarea value={storeSettings.storeAddress} onChange={e => setStoreSettings({...storeSettings, storeAddress: e.target.value})}
                          rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none" />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'delivery' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-4">Delivery Slot Configuration</h2>
                    {[
                      { label: 'Morning Slot', startKey: 'morningStart', endKey: 'morningEnd', color: 'bg-amber-50 border-amber-200' },
                      { label: 'Evening Slot', startKey: 'eveningStart', endKey: 'eveningEnd', color: 'bg-blue-50 border-blue-200' },
                    ].map(slot => (
                      <div key={slot.label} className={`p-5 rounded-xl border ${slot.color}`}>
                        <h3 className="font-bold text-gray-900 mb-4">{slot.label}</h3>
                        <div className="flex gap-4 items-center">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                            <input type="time" value={slots[slot.startKey]} onChange={e => setSlots({...slots, [slot.startKey]: e.target.value})}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" />
                          </div>
                          <span className="text-gray-400 font-bold mt-5">→</span>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                            <input type="time" value={slots[slot.endKey]} onChange={e => setSlots({...slots, [slot.endKey]: e.target.value})}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-4">Notification Preferences</h2>
                    <div className="space-y-4">
                      {[
                        { key: 'orderPlaced', label: 'New Order Placed', desc: 'Receive alert when a customer places a new order' },
                        { key: 'orderDelivered', label: 'Order Delivered', desc: 'Get notified when an order is marked as delivered' },
                        { key: 'lowStock', label: 'Low Stock Alert', desc: 'Alert when product stock drops below threshold' },
                        { key: 'newUser', label: 'New User Registration', desc: 'Notification when a new customer registers' },
                        { key: 'subscriptionChange', label: 'Subscription Changes', desc: 'Alert on subscription create, pause, or cancel' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                          </div>
                          <button onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key]})}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${notifications[item.key] ? 'bg-primary' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${notifications[item.key] ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
