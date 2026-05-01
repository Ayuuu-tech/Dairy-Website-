import { useState, useEffect } from 'react';
import { Search, Bell, Package, AlertTriangle, Plus, Minus, Save, Loader2, BarChart3, Trash2, X, Upload, ImageIcon } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const emptyProduct = { name: '', category: 'Milk', description: '', variants: [{ label: '', price: '', stock: '' }] };
const categories = ['Milk', 'Paneer', 'Ghee', 'Curd', 'Butter', 'Cream', 'Other'];

export default function AdminInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [editingStock, setEditingStock] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ ...emptyProduct });
  const [addingProduct, setAddingProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try { setLoading(true); const res = await api.get('/products'); setProducts(res.data.products || []); }
    catch (e) { console.error(e); toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  const handleStockChange = (productId, variantIdx, delta) => {
    const key = `${productId}-${variantIdx}`;
    const product = products.find(p => p.id === productId);
    const cur = editingStock[key] !== undefined ? editingStock[key] : product.variants[variantIdx].stock;
    setEditingStock({ ...editingStock, [key]: Math.max(0, cur + delta) });
  };

  const handleStockInput = (productId, variantIdx, value) => {
    const key = `${productId}-${variantIdx}`;
    setEditingStock({ ...editingStock, [key]: Math.max(0, parseInt(value) || 0) });
  };

  const saveStock = async (productId) => {
    try {
      setSaving(productId);
      const product = products.find(p => p.id === productId);
      const updatedVariants = product.variants.map((v, idx) => {
        const key = `${productId}-${idx}`;
        return { ...v, stock: editingStock[key] !== undefined ? editingStock[key] : v.stock };
      });
      await api.put(`/products/${productId}`, { variants: updatedVariants });
      toast.success('Stock updated');
      const ne = { ...editingStock };
      product.variants.forEach((_, idx) => { delete ne[`${productId}-${idx}`]; });
      setEditingStock(ne);
      await fetchProducts();
    } catch (e) { console.error(e); toast.error('Failed to update stock'); }
    finally { setSaving(null); }
  };

  const hasEdits = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.variants.some((v, idx) => {
      const key = `${productId}-${idx}`;
      return editingStock[key] !== undefined && editingStock[key] !== v.stock;
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) return toast.error('Product name is required');
    const validVariants = newProduct.variants.filter(v => v.label && v.price);
    if (validVariants.length === 0) return toast.error('At least one variant with label & price is required');
    try {
      setAddingProduct(true);
      let imageUrl = '';
      // Upload image if selected
      if (imageFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = uploadRes.data.imageUrl;
        setUploading(false);
      }
      await api.post('/products', {
        name: newProduct.name, category: newProduct.category, description: newProduct.description,
        variants: validVariants.map(v => ({ label: v.label, price: Number(v.price), stock: Number(v.stock) || 50 })),
        images: imageUrl ? [imageUrl] : [],
      });
      toast.success('Product added!');
      setShowAddModal(false);
      setNewProduct({ ...emptyProduct });
      setImageFile(null);
      setImagePreview(null);
      await fetchProducts();
    } catch (e) { console.error(e); toast.error(e.response?.data?.message || 'Failed to add product'); }
    finally { setAddingProduct(false); setUploading(false); }
  };

  const handleDeleteProduct = async (id) => {
    try {
      setDeleting(id);
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      await fetchProducts();
    } catch (e) { console.error(e); toast.error('Failed to delete product'); }
    finally { setDeleting(null); }
  };

  const updateVariant = (idx, field, value) => {
    const v = [...newProduct.variants];
    v[idx] = { ...v[idx], [field]: value };
    setNewProduct({ ...newProduct, variants: v });
  };

  const getStockLevel = (s) => {
    if (s === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
    if (s <= 10) return { label: 'Critical', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
    if (s <= 25) return { label: 'Low', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' };
    return { label: 'In Stock', color: 'bg-green-50 text-green-600', dot: 'bg-green-500' };
  };

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const mc = categoryFilter === 'All' || p.category === categoryFilter;
    if (stockFilter === 'Low') return ms && mc && p.variants.some(v => v.stock <= 25 && v.stock > 0);
    if (stockFilter === 'Out') return ms && mc && p.variants.some(v => v.stock === 0);
    return ms && mc;
  });

  const totalVariants = products.reduce((s, p) => s + p.variants.length, 0);
  const lowStockCount = products.reduce((s, p) => s + p.variants.filter(v => v.stock <= 15 && v.stock > 0).length, 0);
  const outOfStockCount = products.reduce((s, p) => s + p.variants.filter(v => v.stock === 0).length, 0);
  const totalUnits = products.reduce((s, p) => s + p.variants.reduce((a, v) => a + v.stock, 0), 0);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 md:h-16 px-4 md:px-8 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
          <div className="relative flex-1 max-w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" />
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-3">
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

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
            {/* Title + Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-500 text-sm mt-1">Track and update stock levels across all products</p>
              </div>
              <button onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 text-sm">
                <Plus size={18} /> Add Product
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total SKUs', value: totalVariants, icon: <Package size={20} />, color: 'text-primary', bg: 'bg-primary-light' },
                { label: 'Total Units', value: totalUnits.toLocaleString(), icon: <BarChart3 size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Low Stock', value: lowStockCount, icon: <AlertTriangle size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Out of Stock', value: outOfStockCount, icon: <AlertTriangle size={20} />, color: 'text-red-600', bg: 'bg-red-50' },
              ].map(card => (
                <div key={card.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                    <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>{card.icon}</div>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Filters & Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-wrap gap-3 items-center">
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 md:px-4 py-2 md:py-2.5 outline-none focus:border-primary text-gray-700 font-medium">
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 md:px-4 py-2 md:py-2.5 outline-none focus:border-primary text-gray-700 font-medium">
                  <option value="All">All Stock Levels</option>
                  <option value="Low">Low Stock (≤25)</option>
                  <option value="Out">Out of Stock</option>
                </select>
                <span className="ml-auto text-sm text-gray-500">{filtered.length} products</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-4 py-4">Category</th>
                          <th className="px-4 py-4">Variant</th>
                          <th className="px-4 py-4">Price</th>
                          <th className="px-4 py-4 text-center">Stock</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filtered.map(product => (
                          product.variants.map((variant, vIdx) => {
                            const key = `${product.id}-${vIdx}`;
                            const curStock = editingStock[key] !== undefined ? editingStock[key] : variant.stock;
                            const level = getStockLevel(curStock);
                            const isEdited = editingStock[key] !== undefined && editingStock[key] !== variant.stock;
                            return (
                              <tr key={key} className={`hover:bg-gray-50/50 transition-colors ${curStock <= 10 ? 'bg-red-50/20' : ''}`}>
                                {vIdx === 0 && (
                                  <td className="px-6 py-4" rowSpan={product.variants.length}>
                                    <div className="flex items-center gap-3">
                                      <img src={product.images?.[0] ? (product.images[0].startsWith('/uploads') ? `http://localhost:5000${product.images[0]}` : product.images[0]) : 'https://placehold.co/40x40/e2e8f0/94a3b8?text=P'} alt=""
                                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                                      <div>
                                        <p className="font-bold text-gray-900">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.available ? 'Active' : 'Disabled'}</p>
                                      </div>
                                    </div>
                                  </td>
                                )}
                                {vIdx === 0 && (
                                  <td className="px-4 py-4" rowSpan={product.variants.length}>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{product.category}</span>
                                  </td>
                                )}
                                <td className="px-4 py-4 font-medium text-gray-800">{variant.label}</td>
                                <td className="px-4 py-4 font-semibold text-gray-900">₹{variant.price}</td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => handleStockChange(product.id, vIdx, -1)}
                                      className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 transition-colors">
                                      <Minus size={14} />
                                    </button>
                                    <input type="number" value={curStock} onChange={e => handleStockInput(product.id, vIdx, e.target.value)}
                                      className={`w-16 text-center py-1 border rounded-lg text-sm font-bold outline-none transition-colors ${isEdited ? 'border-primary bg-primary-light/30 text-primary' : 'border-gray-200 text-gray-900'}`} />
                                    <button onClick={() => handleStockChange(product.id, vIdx, 1)}
                                      className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600 text-gray-500 transition-colors">
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${level.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${level.dot}`}></span>{level.label}
                                  </span>
                                </td>
                                {vIdx === 0 && (
                                  <td className="px-6 py-4 text-right" rowSpan={product.variants.length}>
                                    <div className="flex flex-col items-end gap-2">
                                      <button onClick={() => saveStock(product.id)} disabled={!hasEdits(product.id) || saving === product.id}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${hasEdits(product.id) ? 'bg-primary text-white hover:bg-primary/90 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                        {saving === product.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                                      </button>
                                      <button onClick={() => setDeleteConfirm(product.id)}
                                        className="px-4 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all flex items-center gap-1.5">
                                        <Trash2 size={14} /> Delete
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        ))}
                        {filtered.length === 0 && (
                          <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-lg font-medium text-gray-900">No products found</p>
                            <p className="text-sm mt-1">Try adjusting your filters or add a new product.</p>
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <div className="px-6 py-12 text-center text-gray-500">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-lg font-medium text-gray-900">No products found</p>
                        <p className="text-sm mt-1">Try adjusting your filters.</p>
                      </div>
                    ) : filtered.map(product => (
                      <div key={product.id} className="p-4 space-y-3">
                        {/* Product Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={product.images?.[0] ? (product.images[0].startsWith('/uploads') ? `http://localhost:5000${product.images[0]}` : product.images[0]) : 'https://placehold.co/40x40/e2e8f0/94a3b8?text=P'} alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">{product.category}</span>
                                <span className={`text-[10px] font-medium ${product.available ? 'text-green-600' : 'text-gray-400'}`}>{product.available ? 'Active' : 'Disabled'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => saveStock(product.id)} disabled={!hasEdits(product.id) || saving === product.id}
                              className={`p-2 rounded-lg transition-all ${hasEdits(product.id) ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-300'}`}>
                              {saving === product.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            </button>
                            <button onClick={() => setDeleteConfirm(product.id)}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Variants */}
                        <div className="space-y-2">
                          {product.variants.map((variant, vIdx) => {
                            const key = `${product.id}-${vIdx}`;
                            const curStock = editingStock[key] !== undefined ? editingStock[key] : variant.stock;
                            const level = getStockLevel(curStock);
                            const isEdited = editingStock[key] !== undefined && editingStock[key] !== variant.stock;
                            return (
                              <div key={key} className={`flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 ${curStock <= 10 ? 'bg-red-50/50' : ''}`}>
                                <div className="flex items-center gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">{variant.label || '—'}</p>
                                    <p className="text-xs font-bold text-gray-900">₹{variant.price}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${level.color}`}>
                                    <span className={`w-1 h-1 rounded-full ${level.dot}`}></span>{level.label}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleStockChange(product.id, vIdx, -1)}
                                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 active:bg-red-50">
                                      <Minus size={12} />
                                    </button>
                                    <input type="number" value={curStock} onChange={e => handleStockInput(product.id, vIdx, e.target.value)}
                                      className={`w-12 text-center py-0.5 border rounded-md text-xs font-bold outline-none ${isEdited ? 'border-primary bg-primary-light/30 text-primary' : 'border-gray-200 text-gray-900'}`} />
                                    <button onClick={() => handleStockChange(product.id, vIdx, 1)}
                                      className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 active:bg-green-50">
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Add Product Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Farm Fresh Whole Milk" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-primary text-sm" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-primary text-sm">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image</label>
                {imagePreview ? (
                  <div className="relative w-full h-36 rounded-xl border border-gray-200 overflow-hidden group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-red-600 flex items-center gap-1.5"><Trash2 size={14} /> Remove</button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary-light/20 transition-colors">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">Click to upload</span>
                    <span className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product description..." rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-primary text-sm resize-none" />
              </div>

              {/* Variants */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Variants *</label>
                  <button onClick={() => setNewProduct({ ...newProduct, variants: [...newProduct.variants, { label: '', price: '', stock: '' }] })}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"><Plus size={14} /> Add Variant</button>
                </div>
                <div className="space-y-3">
                  {newProduct.variants.map((v, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <input type="text" placeholder="Label (e.g. 500ml)" value={v.label} onChange={e => updateVariant(idx, 'label', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" />
                      <input type="number" placeholder="Price" value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" />
                      <input type="number" placeholder="Stock" value={v.stock} onChange={e => updateVariant(idx, 'stock', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary" />
                      {newProduct.variants.length > 1 && (
                        <button onClick={() => setNewProduct({ ...newProduct, variants: newProduct.variants.filter((_, i) => i !== idx) })}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddProduct} disabled={addingProduct}
                className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 flex items-center gap-2 disabled:opacity-70">
                {addingProduct ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently remove <strong>{products.find(p => p.id === deleteConfirm)?.name}</strong> and all its variants. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDeleteProduct(deleteConfirm)} disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 flex items-center justify-center gap-2 disabled:opacity-70">
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
