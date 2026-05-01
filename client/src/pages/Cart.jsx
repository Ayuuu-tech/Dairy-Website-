import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, Truck } from 'lucide-react';
import CustomerHeader from '../components/CustomerHeader';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, deliveryFee, total, addToCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex flex-col items-center justify-center">
        <CustomerHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
        <div className="bg-white p-10 rounded-3xl border border-gray-100/80 shadow-sm flex flex-col items-center text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center mb-5">
            <ShoppingBag className="text-primary w-9 h-9" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6 text-sm">Add some fresh dairy products to get started!</p>
          <button onClick={() => navigate('/shop')}
            className="px-8 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all w-full text-sm">
            Start Shopping
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 md:pb-6 font-sans">
      <CustomerHeader />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/shop')} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100 hover:shadow-sm">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-[20px] font-black text-gray-900">Your Cart</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items Container */}
          <div className="flex-1 space-y-4">
            {cartItems.map(item => (
              <div key={`${item.productId}-${item.variantLabel}`}
                className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 flex items-start gap-4">
                <img src={item.image || 'https://placehold.co/100x100/E1F5EE/1D9E75?text=P'} alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-[13px] leading-snug truncate">{item.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.variantLabel}</p>
                    </div>
                    <p className="text-[13px] font-black text-gray-900 min-w-[60px] text-right">₹{item.price * item.qty}</p>
                  </div>
                  
                  <div className="flex justify-between items-end mt-auto">
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-0.5 w-fit">
                      <button onClick={() => item.qty > 1 ? updateQuantity(item.productId, item.variantLabel, -1) : removeFromCart(item.productId, item.variantLabel)}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-400 hover:text-red-500 transition-all">
                        {item.qty === 1 ? <Trash2 size={12} /> : <Minus size={12} strokeWidth={2.5} />}
                      </button>
                      <span className="w-4 text-center text-[12px] font-bold text-gray-700">{item.qty}</span>
                      <button onClick={() => updateQuantity(item.productId, item.variantLabel, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-400 hover:text-primary transition-all">
                        <Plus size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Frequently Bought Together (Mock) */}
            <div className="pt-8">
              <h3 className="text-[13px] font-bold text-gray-600 mb-4">Frequently bought with these</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {[1, 2].map((i) => (
                  <div key={i} className="w-32 shrink-0 bg-white border border-gray-100 rounded-[16px] p-2 hover:shadow-md transition-shadow flex flex-col h-full">
                    <img src={`https://placehold.co/120x100/${i===1?'FFF8E1/FFA000':'E8F5E9/2E7D32'}?text=Item`} alt="Add-on" className="w-full h-20 object-cover rounded-xl mb-2" />
                    <h4 className="text-[10px] font-bold text-gray-900 line-clamp-1">{i===1?'Farm Butter':'Organic Eggs 6pcs'}</h4>
                    <p className="text-[10px] font-bold text-primary mt-1 mb-2">₹{i===1?'55':'80'}</p>
                    <button 
                      onClick={() => {
                        addToCart({
                          productId: `mock-${i}`,
                          name: i === 1 ? 'Farm Butter' : 'Organic Eggs 6pcs',
                          price: i === 1 ? 55 : 80,
                          image: `https://placehold.co/120x100/${i===1?'FFF8E1/FFA000':'E8F5E9/2E7D32'}?text=Item`,
                          qty: 1,
                          variantLabel: '1 pack'
                        });
                        toast.success('Added to cart');
                      }}
                      className="mt-auto w-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-[10px] font-bold py-1 rounded-lg">
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-5 sticky top-20">
              <h2 className="text-base font-black text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-4 text-[13px] mb-6">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{parseFloat(subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 pb-5 border-b border-gray-100">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900">₹{parseFloat(deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-black text-gray-900 text-sm">Total</span>
                  <span className="font-black text-primary text-lg">₹{parseFloat(total).toFixed(2)}</span>
                </div>
              </div>

              <button onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-colors text-[13px] mb-4">
                Proceed to Checkout
              </button>

              <div className="flex items-start gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 mb-5">
                <Truck size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Estimated Delivery</p>
                  <p className="text-[10px] text-gray-500">Tomorrow, 6:00 AM - 9:00 AM</p>
                </div>
              </div>

              <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 text-gray-600 font-semibold text-[12px] rounded-xl hover:bg-gray-50 transition-colors">
                Apply Promo Code <ArrowRight size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
