import { useState } from 'react';
import { 
  Search, Bell, HelpCircle, UploadCloud, Trash2, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api/axios';

export default function AdminProductAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
  });
  const [variants, setVariants] = useState([{ label: '500ml', price: '60' }]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [errors, setErrors] = useState({});

  const categories = ['Milk', 'Paneer', 'Ghee', 'Curd', 'Butter', 'Cream', 'Other'];

  const handleAddVariant = () => {
    setVariants([...variants, { label: '', price: '' }]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSave = async () => {
    if (!formData.name) {
      setErrors({ name: 'Product name is required' });
      return;
    }
    
    try {
      await api.post('/products', {
        name: formData.name,
        category: formData.category || 'Other',
        description: formData.description,
        variants: variants.map(v => ({ label: v.label, price: Number(v.price), stock: 100 })),
        images: [],
        available: isAvailable
      });

      toast.success('Product saved successfully');
      navigate('/admin/inventory');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to save product');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
      
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50">
        
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between bg-white shrink-0 border-b border-gray-100 shadow-sm z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders, products..." 
              className="w-full bg-gray-50 border-none pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
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
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            
            {/* Form Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the details below to list a new dairy product in your inventory.</p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => navigate('/admin/products')}
                  className="px-4 py-2 text-primary font-medium hover:bg-primary-light rounded-lg transition-colors flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex-1 sm:flex-none"
                >
                  Save Product
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Column */}
              <div className="space-y-6">
                
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Pure Cow Milk" 
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      if(e.target.value) setErrors({...errors, name: null});
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
                      errors.name ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-600 bg-white appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity & Pricing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity & Pricing</label>
                  
                  <div className="space-y-3">
                    {variants.map((variant, index) => (
                      <div key={index} className="flex gap-3 items-center relative group">
                        <input 
                          type="text" 
                          placeholder="e.g. 500ml" 
                          value={variant.label}
                          onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                          className="w-1/2 px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <div className="relative w-1/3">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input 
                            type="text" 
                            placeholder="60" 
                            value={variant.price}
                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                        <button 
                          onClick={() => handleRemoveVariant(index)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleAddVariant}
                    className="w-full mt-3 py-2.5 border border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:bg-gray-50 hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Option
                  </button>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <div className="border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-xl h-72 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <div className="w-12 h-12 bg-white flex items-center justify-center rounded-full shadow-sm mb-3">
                      <UploadCloud className="text-primary w-6 h-6" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">Upload Image</p>
                    <p className="text-xs text-gray-500 text-center px-4">
                      Drag and drop or click to browse. PNG, JPG up to 5MB.
                    </p>
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/png, image/jpeg" />
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Availability Status</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Currently listed as "{isAvailable ? 'In Stock' : 'Out of Stock'}"</p>
                  </div>
                  <button 
                    onClick={() => setIsAvailable(!isAvailable)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${isAvailable ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${isAvailable ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row - Full width */}
            <div className="mt-8 border-t border-gray-100 pt-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 resize-none"
                placeholder="Briefly describe the product source, nutritional benefits, and storage instructions..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

          </div>

          <div className="text-center mt-8 text-[10px] text-gray-400 font-medium pb-4">
            DairyFresh Admin Dashboard • Version 2.4.0 • Built with Care for Freshness
          </div>

        </div>
      </main>
    </div>
  );
}
