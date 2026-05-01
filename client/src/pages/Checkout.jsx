import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { MapPin, Clock, CreditCard, CheckCircle2, ChevronRight, AlertCircle, ArrowRight } from 'lucide-react';
import CustomerHeader from '../components/CustomerHeader';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { cartItems, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    deliverySlot: 'morning',
    paymentMethod: 'cod',
    savedAddress: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const addr = user.addresses[0];
      setFormData(prev => ({ 
        ...prev, 
        savedAddress: 0,
        address: addr.text,
        city: 'Bangalore',
        pincode: '560001',
        fullName: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          variantLabel: item.variantLabel || item.variant,
          qty: item.qty || item.quantity
        })),
        deliveryAddress: {
          street: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          fullName: formData.fullName,
          phone: formData.phone
        },
        slot: formData.deliverySlot === 'morning' ? 'Morning 6-9am' : 'Evening 5-7pm',
        paymentMethod: formData.paymentMethod.toUpperCase()
      };

      const token = localStorage.getItem('token');
      const finalTotal = total + (subtotal * 0.05);

      if (formData.paymentMethod === 'upi' || formData.paymentMethod === 'card') {
        const res = await loadRazorpayScript();
        if (!res) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setIsProcessing(false);
          return;
        }

        // 1. Create Razorpay order
        const rzpResponse = await api.post('/orders/razorpay/create', { amount: finalTotal });
        const rzpData = rzpResponse.data;

        // 2. Open Razorpay Checkout
        const options = {
          key: 'rzp_test_SkCDIUdQ6nMUXm', // Replace with live key in production
          amount: rzpData.amount,
          currency: 'INR',
          name: 'DairyFresh',
          description: 'Premium Dairy Products',
          image: 'https://cdn-icons-png.flaticon.com/512/869/869542.png',
          order_id: rzpData.orderId,
          handler: async function (response) {
            // 3. Verify Payment
            try {
              const verifyRes = await api.post('/orders/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              
              if (verifyRes.data.success) {
                // 4. Place Final Order
                await finalizeOrder(orderPayload);
              } else {
                toast.error('Payment verification failed');
                setIsProcessing(false);
              }
            } catch (err) {
              toast.error('Payment verification failed');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: formData.fullName,
            contact: formData.phone
          },
          theme: { color: '#059669' },
          modal: { ondismiss: () => setIsProcessing(false) }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        // Cash on Delivery
        await finalizeOrder(orderPayload);
      }
    } catch (error) {
      setIsProcessing(false);
      toast.error(error?.response?.data?.message || error.message || 'Failed to process order.');
    }
  };

  const finalizeOrder = async (payload) => {
    try {
      await api.post('/orders', payload);
      setIsProcessing(false);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      throw new Error(err?.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0">
      <CustomerHeader />

      <div className="flex-1 flex flex-col md:flex-row max-w-[1200px] mx-auto w-full">
        {/* Left Column - Checkout Form */}
        <div className="flex-1 p-5 md:py-8 lg:pr-10 md:overflow-y-auto no-scrollbar">
          <form onSubmit={handlePlaceOrder} className="space-y-8 max-w-2xl mx-auto md:ml-0 md:mr-auto">
            {/* Saved Addresses */}
            <section>
              <h3 className="text-[13px] font-bold text-gray-900 mb-3">Saved Delivery Addresses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user?.addresses?.length > 0 ? (
                  user.addresses.map((addr, idx) => (
                    <label 
                      key={idx} 
                      onClick={(e) => {
                        e.preventDefault();
                        setFormData(prev => ({ 
                          ...prev, 
                          savedAddress: idx,
                          address: addr.text,
                          city: 'Bangalore',
                          pincode: '560001',
                          fullName: user.name || '',
                          phone: user.phone || ''
                        }));
                      }}
                      className={`cursor-pointer border rounded-xl p-3 flex flex-col transition-all relative ${formData.savedAddress === idx ? 'border-primary ring-1 ring-primary bg-primary-light/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <input type="radio" name="savedAddress" value={idx} checked={formData.savedAddress === idx} readOnly className="sr-only" />
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MapPin size={12} className={formData.savedAddress === idx ? 'text-primary' : 'text-gray-400'} />
                        <span className="text-[11px] font-bold text-gray-900">{addr.type || 'Address'}</span>
                        {formData.savedAddress === idx && <CheckCircle2 size={12} className="text-primary absolute top-3 right-3" />}
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{addr.text}</p>
                    </label>
                  ))
                ) : (
                  <div className="col-span-full p-4 border border-dashed border-gray-300 rounded-xl text-center">
                    <p className="text-sm text-gray-500">No saved addresses found. Please add one in your profile or enter below.</p>
                  </div>
                )}
              </div>
            </section>
            
            {/* New Address Form */}
            <section>
              <h3 className="text-[13px] font-bold text-gray-900 mb-3">New Delivery Address <span className="text-gray-400 font-normal">(Optional)</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-gray-500">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-gray-500">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs" />
                </div>
                <div className="sm:col-span-2 space-y-1 mt-1">
                  <label className="text-[10px] font-medium text-gray-500">Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House No, Building, Street Name" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs" />
                </div>
                <div className="space-y-1 mt-1">
                  <label className="text-[10px] font-medium text-gray-500">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Bangalore" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs" />
                </div>
                <div className="space-y-1 mt-1">
                  <label className="text-[10px] font-medium text-gray-500">Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="560001" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs" />
                </div>
              </div>
            </section>

            {/* Delivery Time Slot */}
            <section>
              <h3 className="text-[13px] font-bold text-gray-900 mb-3">Delivery Time Slot</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${formData.deliverySlot === 'morning' ? 'border-primary ring-1 ring-primary bg-primary-light/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <input type="radio" name="deliverySlot" value="morning" checked={formData.deliverySlot === 'morning'} onChange={handleInputChange} className="sr-only" />
                  <Clock size={16} className={formData.deliverySlot === 'morning' ? 'text-primary' : 'text-gray-400'} />
                  <div>
                    <span className="font-bold text-[11px] text-gray-900 block">Morning Slot</span>
                    <span className="text-[9px] text-gray-500">6:00 AM - 9:00 AM</span>
                  </div>
                </label>
                <label className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${formData.deliverySlot === 'evening' ? 'border-primary ring-1 ring-primary bg-primary-light/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <input type="radio" name="deliverySlot" value="evening" checked={formData.deliverySlot === 'evening'} onChange={handleInputChange} className="sr-only" />
                  <Clock size={16} className={formData.deliverySlot === 'evening' ? 'text-primary' : 'text-gray-400'} />
                  <div>
                    <span className="font-bold text-[11px] text-gray-900 block">Evening Slot</span>
                    <span className="text-[9px] text-gray-500">5:00 PM - 8:00 PM</span>
                  </div>
                </label>
              </div>
            </section>

            {/* Payment Method Section */}
            <section>
              <h3 className="text-[13px] font-bold text-gray-900 mb-3">Payment Method</h3>
              <div className="space-y-2">
                <label className={`cursor-pointer border rounded-xl px-4 py-3 flex items-center justify-between transition-all ${formData.paymentMethod === 'cod' ? 'border-primary ring-1 ring-primary bg-primary-light/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className={formData.paymentMethod === 'cod' ? 'text-primary' : 'text-gray-400'} />
                    <span className="font-bold text-[11px] text-gray-900">Cash on Delivery</span>
                  </div>
                  {formData.paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-white ring-offset-1 border border-primary"></div>}
                </label>
                <label className={`cursor-pointer border rounded-xl px-4 py-3 flex items-center justify-between transition-all ${formData.paymentMethod === 'upi' ? 'border-primary ring-1 ring-primary bg-primary-light/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                       <span className="text-[10px] font-black italic bg-gradient-to-br from-indigo-500 to-purple-500 text-white px-1.5 py-0.5 rounded">UPI</span>
                    </div>
                    <span className="font-bold text-[11px] text-gray-900 ml-1">UPI Payment</span>
                  </div>
                  {formData.paymentMethod === 'upi' && <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-white ring-offset-1 border border-primary"></div>}
                </label>
              </div>
            </section>

            {/* Mobile Submit Button (Visible only on small screens) */}
            <div className="md:hidden pt-4 pb-8">
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing Order...' : `Place Order (₹${total.toFixed(2)})`}
                {!isProcessing && <CheckCircle2 size={20} />}
              </button>
            </div>

            {/* Hidden submit trigger for desktop side-panel logic */}
            <button id="hidden-submit" type="submit" className="hidden" />

          </form>
        </div>

      {/* Right Column - Order Summary (Sticky) */}
      <div className="hidden md:block w-[340px] lg:w-[380px] bg-white border border-gray-100 rounded-2xl m-6 p-6 sticky top-24 self-start shadow-sm">
        <h2 className="text-[13px] font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Order Summary</h2>
        
        {/* Items List */}
        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
          {cartItems.map((item) => (
            <div key={`${item.productId || item.id}-${item.variantLabel || item.variant}`} className="flex gap-3">
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover bg-gray-50 border border-gray-100 shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-bold text-gray-900 text-[11px] truncate">{item.name}</h4>
                <div className="text-[9px] text-gray-500 mt-0.5">{item.qty || item.quantity} x {item.variantLabel || item.variant}</div>
              </div>
              <div className="font-bold text-gray-900 text-[11px] flex items-center">
                ₹{(item.price * (item.qty || item.quantity)).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2.5 text-[11px] py-4 border-t border-b border-gray-100 mb-5">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery Fee</span>
            <span className="font-semibold text-gray-900">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Taxes (GST)</span>
            <span className="font-semibold text-gray-900">₹{(subtotal * 0.05).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-[13px] text-gray-900">Total</span>
          <span className="font-black text-lg text-primary">₹{(total + subtotal * 0.05).toFixed(2)}</span>
        </div>

        <button 
          onClick={() => document.getElementById('hidden-submit').click()}
          disabled={isProcessing}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 text-[12px] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Place Order'}
          {!isProcessing && <ArrowRight size={14} />}
        </button>
        <p className="text-[9px] text-center text-gray-400 mt-4 leading-relaxed">
          By placing this order you agree to DairyFresh's <br /> Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
    </div>
  );
}
