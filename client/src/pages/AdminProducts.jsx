import { useState, useEffect } from 'react';
import { 
  Search, Bell, HelpCircle, Trash2, Edit2, AlertTriangle, Plus
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(2); // Previewing the delete modal on the 2nd item by default for the mockup

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      const prods = (res.data.products || []).map(p => {
        let v = p.variants;
        if (typeof v === 'string') {
          try { v = JSON.parse(v); } catch(e) { v = []; }
        }
        return { ...p, variants: v || [] };
      });
      setProducts(prods);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== id));
      setDeleteId(null);
    } catch (e) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden relative">
      
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white sm:bg-gray-50">
        
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between bg-white shrink-0 border-b border-gray-100 z-10 w-full">
          <div className="relative w-96 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products, orders, categories..." 
              className="w-full bg-gray-50/50 border border-gray-100 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <HelpCircle size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Product Management</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your inventory, pricing, and product availability.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-white border border-gray-200 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm">
                List View
              </button>
              <button 
                onClick={() => navigate('/admin/products/add')}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
              >
                Add Product
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {products.map((product) => {
              const variants = product.variants || [];
              const firstVariant = variants.length > 0 ? variants[0] : { price: 0 };
              const priceNum = Number(firstVariant.price) || 0;
              const displayPrice = `₹${priceNum.toFixed(2)}`;
              const imageUrl = product.images && product.images.length > 0 ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`) : 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=400&auto=format&fit=crop';
              
              return (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group flex flex-col">
                
                {/* Product Image & Badge */}
                <div className="relative h-48 bg-gray-100 shrink-0">
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=400&auto=format&fit=crop'; // Default fallback 
                    }}
                  />
                  <div className={`absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow-sm ${product.available ? 'bg-primary text-white' : 'bg-red-500 text-white'}`}>
                    {product.available ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 leading-tight pr-2">{product.name}</h3>
                    <span className="font-bold text-primary whitespace-nowrap">{displayPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                    {product.description || 'No description available.'}
                  </p>

                  {/* Variants */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {variants.map((v, i) => v.label && (
                      <span 
                        key={i} 
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          i === 0 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-white text-gray-500 border-gray-200'
                        }`}
                      >
                        {v.label}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 mt-auto">
                    <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5">
                      Edit
                    </button>
                    <button 
                      onClick={() => setDeleteId(product.id)}
                      className="text-red-500 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Delete Modal Overlay (Matches the middle item in mockup) */}
                {deleteId === product.id && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-20">
                    <div className="bg-white rounded-xl shadow-xl w-full p-6 text-center animate-in fade-in zoom-in duration-200">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-red-500 w-6 h-6" />
                      </div>
                      <h4 className="text-gray-900 font-bold mb-2">Delete Product?</h4>
                      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                        This action cannot be undone. All related order history will be archived.
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setDeleteId(null)}
                          className="flex-1 py-2 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleDeleteConfirm(product.id)}
                          className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm shadow-sm"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>

        </div>

        {/* Floating Action Button */}
        <button 
          onClick={() => navigate('/admin/products/add')}
          className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 z-50 focus:outline-none focus:ring-4 focus:ring-primary/20"
        >
          <Plus size={24} />
        </button>

      </main>
    </div>
  );
}
