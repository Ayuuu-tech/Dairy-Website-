const mongoose = require('mongoose');

const subscriptionItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantLabel: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 }
});

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['Daily', 'Alternate Days', 'Weekly'],
    required: true
  },
  items: {
    type: [subscriptionItemSchema],
    validate: {
      validator: function(v) { return v.length > 0; },
      message: 'At least one item is required'
    }
  },
  slot: {
    type: String,
    enum: ['Morning 6-9am', 'Evening 5-7pm'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Paused', 'Cancelled'],
    default: 'Active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  nextDelivery: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
