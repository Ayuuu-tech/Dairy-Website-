import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BottomNav from './BottomNav';

export default function CustomerHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems } = useCart();
  const totalCartItems = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <>
    <header className="sticky top-0 w-full z-40 backdrop-blur-xl bg-white/90 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1 cursor-pointer" onClick={() => navigate('/shop')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md shadow-primary/20">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">DairyFresh</span>
        </div>

        {/* Navigation */}
        <div className="flex-none hidden md:block">
          <BottomNav />
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button onClick={() => navigate('/cart')}
            className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all active:scale-95">
            <ShoppingCart size={21} strokeWidth={2} />
            {totalCartItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-gradient-to-r from-primary to-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-primary/30 animate-bounce"
                style={{ animationDuration: '2s' }}>
                {totalCartItems}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20 hover:shadow-lg transition-shadow">
            {user?.name?.charAt(0) || 'U'}
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Bottom Navigation */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      <BottomNav />
    </div>
    </>
  );
}
