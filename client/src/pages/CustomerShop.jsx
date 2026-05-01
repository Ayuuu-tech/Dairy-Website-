import { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, Plus, ChevronDown, Bell, Sparkles, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CustomerHeader from '../components/CustomerHeader';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { name: 'All', emoji: '🧺' },
  { name: 'Milk', emoji: '🥛' },
  { name: 'Paneer', emoji: '🧀' },
  { name: 'Ghee', emoji: '🫕' },
  { name: 'Curd', emoji: '🍶' },
  { name: 'Butter', emoji: '🧈' },
  { name: 'Cream', emoji: '🍦' },
];

export default function CustomerShop() {
  const { user } = useAuth();
  const { cartItems, addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [addedAnimation, setAddedAnimation] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/products');
        const prods = (res.data.products || []).map(p => {
          let parsedVariants = p.variants;
          if (typeof parsedVariants === 'string') {
            try { parsedVariants = JSON.parse(parsedVariants); } catch(e) { parsedVariants = []; }
          }
          return { ...p, variants: parsedVariants || [] };
        });
        setProducts(prods);
        const defaults = {};
        prods.forEach(p => { if (p.variants?.length) defaults[p.id] = 0; });
        setSelectedVariants(defaults);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => products.filter(p => {
    const ms = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const mc = activeCategory === 'All' || p.category === activeCategory;
    return ms && mc && p.available;
  }), [products, searchQuery, activeCategory]);

  const totalCartItems = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleAddToCart = (product) => {
    const vIdx = selectedVariants[product.id] || 0;
    const variant = product.variants[vIdx];
    if (!variant || variant.stock <= 0) return toast.error('Out of stock');
    const imgSrc = getImgSrc(product);
    addToCart({ productId: product.id, name: product.name, image: imgSrc, variantLabel: variant.label, price: variant.price, qty: 1 });
    setAddedAnimation(product.id);
    setTimeout(() => setAddedAnimation(null), 800);
    toast('Added to cart!', { icon: '✅', style: { background: '#1D9E75', color: '#fff', fontWeight: 700, borderRadius: '12px', fontSize: '13px' } });
  };

  const getImgSrc = (p) => {
    if (!p.images?.[0]) return `https://placehold.co/400x300/E1F5EE/1D9E75?text=${encodeURIComponent(p.name.split(' ')[0])}`;
    return p.images[0].startsWith('/uploads') ? `http://localhost:5000${p.images[0]}` : p.images[0];
  };

  const getStockInfo = (variant) => {
    if (!variant || variant.stock <= 0) return { text: 'Out of Stock', cls: 'from-gray-700 to-gray-900 text-white', out: true };
    if (variant.stock <= 10) return { text: `Only ${variant.stock} left`, cls: 'from-amber-400 to-orange-500 text-white', out: false };
    return { text: 'In Stock', cls: 'from-emerald-400 to-green-600 text-white', out: false };
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-6 font-sans">
      {/* ── Sticky Header ── */}
      <CustomerHeader />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-4">
        {/* ── Greeting + Search ── */}
        <div className="pt-2 md:pt-4 pb-2">
          <p className="text-[14px] md:text-[15px] text-gray-500 font-medium">{greeting}, {user?.name?.split(' ')[0] || 'there'} 👋</p>
          <h2 className="text-[22px] md:text-[26px] font-black text-gray-900 mt-1">What would you like today?</h2>
        </div>

        <div className="relative mt-4 mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
          <input type="text" placeholder="Search fresh milk, ghee, paneer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200/80 pl-12 pr-5 py-3.5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none text-sm shadow-sm placeholder:text-gray-400 transition-all" />
        </div>

        {/* ── Category Pills ── */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
          {CATEGORIES.map(cat => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 shrink-0 ${
                activeCategory === cat.name
                  ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/25 scale-[1.02]'
                  : 'bg-white text-gray-600 border border-gray-200/80 hover:border-primary/30 hover:shadow-sm'
              }`}>
              <span className="text-base">{cat.emoji}</span> {cat.name}
            </button>
          ))}
        </div>

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Sparkles size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Loading fresh products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl font-bold text-gray-900">No products found</p>
            <p className="text-sm text-gray-500 mt-2">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6 mt-6">
            {filtered.map((product, idx) => {
              const vIdx = selectedVariants[product.id] || 0;
              const variant = product.variants?.[vIdx];
              const stock = getStockInfo(variant);
              const isAdded = addedAnimation === product.id;

              return (
                <div key={product.id}
                  className={`group bg-white rounded-2xl border border-gray-100/80 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/40 hover:-translate-y-0.5 ${isAdded ? 'ring-2 ring-primary/40 scale-[0.97]' : ''}`}>

                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img src={getImgSrc(product)} alt={product.name} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-gradient-to-r ${stock.cls} shadow-sm`}>
                      {stock.text}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-2.5 flex-1 flex flex-col">
                    <h3 className="font-bold text-[12px] text-gray-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{product.description || `Fresh ${product.category.toLowerCase()}`}</p>

                    <div className="mt-auto pt-2 space-y-1.5">
                      {/* Variant + Price Row */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === product.id ? null : product.id); }}
                            className="flex items-center gap-0.5 px-2 py-1 bg-gray-50 border border-gray-200/80 rounded-lg text-[10px] font-semibold text-gray-600 hover:border-primary/40 transition-all">
                            {variant?.label || '—'} <ChevronDown size={10} className={`transition-transform ${openDropdown === product.id ? 'rotate-180' : ''}`} />
                          </button>
                          {openDropdown === product.id && product.variants?.length > 1 && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200/80 rounded-xl shadow-xl z-30 min-w-[110px] py-1 backdrop-blur-xl">
                              {product.variants.map((v, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedVariants({ ...selectedVariants, [product.id]: i }); setOpenDropdown(null); }}
                                  className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-50 transition-colors ${i === vIdx ? 'font-bold text-primary bg-primary-light/40' : 'text-gray-600'}`}>
                                  {v.label} · ₹{v.price}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-black text-gray-900">₹{variant?.price || '—'}</p>
                      </div>

                      {/* Add to Cart */}
                      {stock.out ? (
                        <button className="w-full py-1.5 bg-gray-100 text-gray-400 font-semibold text-[10px] rounded-lg cursor-not-allowed flex items-center justify-center gap-1">
                          <Bell size={11} /> Notify me
                        </button>
                      ) : (
                        <button onClick={() => handleAddToCart(product)}
                          className={`w-full py-1.5 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-[10px] rounded-lg hover:shadow-md hover:shadow-primary/20 active:scale-[0.96] transition-all duration-200 flex items-center justify-center gap-1 ${isAdded ? 'from-emerald-500 to-green-600' : ''}`}>
                          {isAdded ? (
                            <><span className="text-xs">✓</span> Added!</>
                          ) : (
                            <><ShoppingCart size={11} /> Add to cart</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-6" />
      </div>

      {openDropdown && <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)} />}
    </div>
  );
}
