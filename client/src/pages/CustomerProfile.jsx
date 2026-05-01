import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  MapPin, 
  Home, 
  Building2, 
  Edit2, 
  Trash2, 
  Plus,
  Shield,
  Bell,
  Smartphone,
  X
} from 'lucide-react';
import CustomerHeader from '../components/CustomerHeader';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function CustomerProfile() {
  const { user, logout, checkAuth } = useAuth();
  
  const [notifications, setNotifications] = useState({
    orderEmail: true,
    orderWhatsapp: false,
    subEmail: true,
    subWhatsapp: true,
    promoEmail: false,
    promoWhatsapp: false
  });

  // Profile Edit State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', phone: '' });

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressData, setAddressData] = useState({ type: 'Home', street: '', city: '', pincode: '' });
  const [editingAddressIdx, setEditingAddressIdx] = useState(-1);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', { name: profileData.name, phone: profileData.phone });
      toast.success('Profile updated successfully');
      setIsEditProfileOpen(false);
      await checkAuth();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressData.street || !addressData.city || !addressData.pincode) return toast.error('All address fields are required');
    
    try {
      const currentAddresses = Array.isArray(user?.addresses) ? [...user.addresses] : [];
      const text = `${addressData.street}, ${addressData.city} - ${addressData.pincode}`;
      const payloadAddr = { id: addressData.id || Date.now(), type: addressData.type, text };

      if (editingAddressIdx >= 0) {
        currentAddresses[editingAddressIdx] = payloadAddr;
      } else {
        currentAddresses.push(payloadAddr);
      }

      await api.put('/auth/profile', { addresses: currentAddresses });
      toast.success('Address saved successfully');
      setIsAddressModalOpen(false);
      await checkAuth();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (idx) => {
    try {
      const currentAddresses = Array.isArray(user?.addresses) ? [...user.addresses] : [];
      currentAddresses.splice(idx, 1);
      await api.put('/auth/profile', { addresses: currentAddresses });
      toast.success('Address deleted');
      await checkAuth();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete address');
    }
  };

  const openAddressModal = (addr = null, idx = -1) => {
    if (addr) {
      let street = addr.text || '';
      let city = '';
      let pincode = '';
      
      if (addr.text && addr.text.includes(' - ')) {
        const parts = addr.text.split(' - ');
        pincode = parts[1];
        const cityIndex = parts[0].lastIndexOf(', ');
        if (cityIndex > -1) {
          city = parts[0].substring(cityIndex + 2);
          street = parts[0].substring(0, cityIndex);
        }
      }
      
      setAddressData({ ...addr, street, city, pincode });
      setEditingAddressIdx(idx);
    } else {
      setAddressData({ type: 'Home', street: '', city: '', pincode: '' });
      setEditingAddressIdx(-1);
    }
    setIsAddressModalOpen(true);
  };

  const userAddresses = Array.isArray(user?.addresses) ? user.addresses : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-32 md:pb-20 font-sans relative">
      <CustomerHeader />

      {/* Profile Edit Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-black text-gray-900">Edit Profile</h2>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  value={profileData.phone} 
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  required
                />
              </div>
              <button type="submit" className="w-full mt-4 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-primary/20">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Address Edit Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-black text-gray-900">{editingAddressIdx >= 0 ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Address Type</label>
                <select 
                  value={addressData.type}
                  onChange={(e) => setAddressData({...addressData, type: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Street Address</label>
                <input 
                  type="text"
                  value={addressData.street} 
                  onChange={(e) => setAddressData({...addressData, street: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  placeholder="e.g. 123 Green Meadows, Sector 45"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">City</label>
                  <input 
                    type="text"
                    value={addressData.city} 
                    onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="e.g. Chandigarh"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Pincode</label>
                  <input 
                    type="text"
                    value={addressData.pincode} 
                    onChange={(e) => setAddressData({...addressData, pincode: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="e.g. 160047"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-primary/20">
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-[24px] md:text-[28px] font-black text-gray-900 tracking-tight">Profile Settings</h1>
          <p className="text-[14px] md:text-[15px] text-gray-500 mt-1 md:mt-2 font-medium">Manage your personal information, addresses, and security preferences.</p>
        </div>

        <div className="space-y-10">
          {/* 1. Profile Info Card */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/60 p-8 sm:p-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-[22px] font-black shadow-md shadow-primary/20">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'JD'}
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-gray-900">{user?.name || 'John Doe'}</h2>
                  <p className="text-[13px] font-medium text-gray-500 mt-0.5">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Jan 12, 2024'}</p>
                </div>
              </div>
              <button onClick={() => setIsEditProfileOpen(true)} className="text-[13px] font-bold text-primary hover:text-emerald-700 transition-colors">
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
              <div>
                <p className="text-[12px] font-medium text-gray-400 mb-1">Full Name</p>
                <p className="text-[14px] font-bold text-gray-900">{user?.name || 'John Doe'}</p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-gray-400 mb-1">Email Address</p>
                <p className="text-[14px] font-bold text-gray-900">{user?.email || 'john.doe@example.com'}</p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-gray-400 mb-1">Phone Number</p>
                <p className="text-[14px] font-bold text-gray-900">{user?.phone || '+91 98765 43210'}</p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-gray-400 mb-1">Date Joined</p>
                <p className="text-[14px] font-bold text-gray-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Jan 12, 2024'}</p>
              </div>
            </div>
          </div>

          {/* 2. Saved Addresses */}
          <div>
            <div className="flex items-center justify-between mb-5 px-2">
              <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Saved Addresses</h3>
              <button onClick={() => openAddressModal()} className="flex items-center gap-1.5 text-[14px] font-bold text-primary hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-all hover:bg-emerald-100">
                <Plus size={16} /> Add New
              </button>
            </div>
            {userAddresses.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-gray-200/60 p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <MapPin size={24} className="text-primary" />
                </div>
                <p className="text-gray-900 font-bold mb-1">No Saved Addresses</p>
                <p className="text-gray-500 text-[14px] mb-6">Add an address for faster checkout</p>
                <button onClick={() => openAddressModal()} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-[14px] shadow-lg shadow-primary/20 hover:bg-emerald-700 transition-colors">Add Address</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userAddresses.map((addr, idx) => (
                  <div key={addr.id || idx} className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/60 p-7 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-900">
                          {addr.type === 'Home' ? <Home size={18} className="text-primary" /> : <Building2 size={18} className="text-primary" />}
                          <span className="font-bold text-[14px]">{addr.type}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <button onClick={() => openAddressModal(addr, idx)} className="hover:text-primary transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteAddress(idx)} className="hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <p className="text-[14px] text-gray-500 leading-relaxed pr-8">
                        {addr.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Notification Preferences */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/60 overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="p-7 sm:p-8 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Notification Preferences</h3>
            </div>
            <div className="p-7 sm:p-8 space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-50">
                <div>
                  <p className="text-[14px] font-bold text-gray-900">Order Updates</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">Status changes and delivery trackers</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-gray-400">EMAIL</span>
                    <button onClick={() => toggleNotification('orderEmail')} className={`w-11 h-6 rounded-full transition-colors relative ${notifications.orderEmail ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications.orderEmail ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-gray-400">WHATSAPP</span>
                    <button onClick={() => toggleNotification('orderWhatsapp')} className={`w-11 h-6 rounded-full transition-colors relative ${notifications.orderWhatsapp ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications.orderWhatsapp ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-50">
                <div>
                  <p className="text-[14px] font-bold text-gray-900">Subscription Reminders</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">Renewal notices and milk delivery schedules</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-gray-400">EMAIL</span>
                    <button onClick={() => toggleNotification('subEmail')} className={`w-11 h-6 rounded-full transition-colors relative ${notifications.subEmail ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications.subEmail ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-gray-400">WHATSAPP</span>
                    <button onClick={() => toggleNotification('subWhatsapp')} className={`w-11 h-6 rounded-full transition-colors relative ${notifications.subWhatsapp ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications.subWhatsapp ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-bold text-gray-900">Offers & Promos</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">Exclusive discounts and seasonal fresh products</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-gray-400">EMAIL</span>
                    <button onClick={() => toggleNotification('promoEmail')} className={`w-11 h-6 rounded-full transition-colors relative ${notifications.promoEmail ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications.promoEmail ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-gray-400">WHATSAPP</span>
                    <button onClick={() => toggleNotification('promoWhatsapp')} className={`w-11 h-6 rounded-full transition-colors relative ${notifications.promoWhatsapp ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications.promoWhatsapp ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 4. Security */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/60 overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="p-7 sm:p-8 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Security</h3>
            </div>
            <div className="p-7 sm:p-8 space-y-6">
              <div className="w-full">
                <label className="block text-[13px] font-bold text-gray-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  value="********" 
                  readOnly
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-3.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    value="********" 
                    readOnly
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-3.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value="********" 
                    readOnly
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-3.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
                <button className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary to-emerald-600 text-white text-[14px] font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                  Update Password
                </button>
                <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3.5 border border-gray-200 rounded-xl text-[14px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all">
                  <LogOut size={18} /> Log Out Everywhere
                </button>
              </div>
            </div>
          </div>

          {/* Sign Out Entire Account */}
          <div className="flex justify-center pt-10">
            <button 
              onClick={logout}
              className="group flex items-center gap-2 text-[15px] font-black text-gray-400 hover:text-red-500 transition-colors bg-white px-8 py-4 rounded-full border border-gray-200/60 shadow-sm hover:shadow-md hover:border-red-100"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" /> Sign Out From Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
