import { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Star, ChevronRight, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';

const MOCK_REVIEWS = [
  {
    id: 1,
    productName: 'Farm-Fresh Whole Milk',
    image: 'https://placehold.co/100x100/E1F5EE/1D9E75?text=M',
    date: 'Oct 12, 2023',
    rating: 5,
    text: 'Absolutely the freshest milk I\'ve had in years. Reminds me of the dairy farms from my childhood. The packaging is excellent too!',
  },
  {
    id: 2,
    productName: 'Artisanal Malai Paneer',
    image: 'https://placehold.co/100x100/E1F5EE/1D9E75?text=P',
    date: 'Sept 28, 2023',
    rating: 4,
    text: 'Very soft and creamy texture. It didn\'t get rubbery after cooking. Giving it 4 stars only because it was slightly delayed in delivery.',
  },
  {
    id: 3,
    productName: 'Traditional Cow Ghee',
    image: 'https://placehold.co/100x100/E1F5EE/1D9E75?text=G',
    date: 'Aug 15, 2023',
    rating: 5,
    text: 'The aroma is incredible. You can tell it\'s made the traditional way. Will definitely be ordering the 1L pack next time.',
  }
];

export default function CustomerReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ productName: 'Farm-Fresh Whole Milk', rating: 5, text: '' });

  const handleDelete = (id) => {
    // Mock delete
    setReviews(reviews.filter(r => r.id !== id));
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    const review = {
      id: Date.now(),
      productName: newReview.productName,
      image: `https://placehold.co/100x100/E1F5EE/1D9E75?text=${newReview.productName.charAt(0).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      rating: newReview.rating,
      text: newReview.text,
    };
    setReviews([review, ...reviews]);
    setIsModalOpen(false);
    setNewReview({ productName: 'Farm-Fresh Whole Milk', rating: 5, text: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-32 md:pb-20 font-sans">
      <CustomerHeader />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-5 py-6 md:py-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/profile')} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-200"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-[22px] font-black text-gray-900">My Reviews</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-[13px] font-bold tracking-wide">
              Total: {reviews.length} Reviews
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#06724B] text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-emerald-800 transition-colors shadow-md"
            >
              <Plus size={16} /> Write Review
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={review.id} className={`pb-8 ${index !== reviews.length - 1 ? 'border-b border-gray-100' : 'pb-0'}`}>
                <div className="flex gap-5">
                  {/* Product Image */}
                  <img 
                    src={review.image} 
                    alt={review.productName} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-gray-50 border border-gray-100 shrink-0" 
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
                      <h3 className="font-bold text-gray-900 text-[15px] sm:text-[16px] truncate pr-4">
                        {review.productName}
                      </h3>
                      <span className="text-[12px] font-medium text-gray-400 shrink-0">
                        {review.date}
                      </span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'} 
                        />
                      ))}
                    </div>

                    <p className="text-[14px] text-gray-600 leading-relaxed mb-4 italic">
                      "{review.text}"
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-[13px] font-bold text-primary hover:text-emerald-700 transition-colors">
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="flex items-center gap-2 text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-gray-300" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900">No reviews yet</h3>
              <p className="text-[14px] text-gray-500 mt-1">You haven't reviewed any products.</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => navigate('/shop')}
            className="px-8 py-3.5 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all active:scale-95 text-[14px]"
          >
            Browse More Products
          </button>
        </div>

        {/* Add Review Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-[20px] font-black text-gray-900 mb-6">Write a Review</h2>
              
              <form onSubmit={handleAddReview} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Select Product</label>
                  <select 
                    value={newReview.productName}
                    onChange={(e) => setNewReview({...newReview, productName: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Farm-Fresh Whole Milk">Farm-Fresh Whole Milk</option>
                    <option value="Artisanal Malai Paneer">Artisanal Malai Paneer</option>
                    <option value="Traditional Cow Ghee">Traditional Cow Ghee</option>
                    <option value="Organic Buffalo Milk">Organic Buffalo Milk</option>
                    <option value="Probiotic Dahi">Probiotic Dahi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          size={24} 
                          className={star <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Review Details</label>
                  <textarea 
                    value={newReview.text}
                    onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                    placeholder="Tell us what you liked about the product..."
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 h-32 resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#06724B] text-white font-bold py-3.5 rounded-xl hover:bg-emerald-800 transition-colors shadow-lg shadow-primary/20 mt-4"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
