import { useState } from 'react';
import { Heart } from 'lucide-react';
import CustomerHeader from '../components/CustomerHeader';

export default function CustomerFavourites() {
  return (
    <div className="min-h-screen bg-slate-50 pb-32 md:pb-6 font-sans">
      <CustomerHeader />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Favourites</h1>
          <p className="text-[14px] text-gray-500 mt-1">Your saved products</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-red-300" />
          </div>
          <p className="text-lg font-bold text-gray-900">No favourites yet</p>
          <p className="text-sm text-gray-500 mt-1">Products you love will appear here</p>
        </div>
      </div>
    </div>
  );
}
