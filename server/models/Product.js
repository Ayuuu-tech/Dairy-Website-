const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 50, min: 0 }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Milk', 'Paneer', 'Ghee', 'Curd', 'Butter', 'Cream', 'Other'],
    required: [true, 'Category is required']
  },
  variants: {
    type: [variantSchema],
    validate: {
      validator: function(v) { return v.length > 0; },
      message: 'At least one variant is required'
    }
  },
  images: {
    type: [String],
    default: []
  },
  available: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  ratings: [ratingSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for average rating
productSchema.virtual('avgRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.stars, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
