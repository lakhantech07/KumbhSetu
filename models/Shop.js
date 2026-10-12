const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  ownerName: { type: String, default: 'Shop Owner' },
  type: {
    type: String,
    enum: ['Food', 'Lodging', 'Transport'],
    default: 'Food'
  },
  item: { type: String, required: true }, // e.g., "Vada Pav", "AC Double Room", "Auto-rickshaw"
  area: { type: String, required: true }, // e.g., "Panchavati", "Ramkund"
  address: { type: String, required: true },
  price: { type: Number, required: true, min: 0 }, // Genuine / Reference Price
  unit: { type: String, default: 'per piece' },
  max_price: { type: Number }, // System-calculated guardrail
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  rating: { type: String, default: '4.0/5' },
  reviewsCount: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

// Middleware: Automatically calculate max_price = ceil(price * 1.5) before saving
// This guarantees that neither owners nor admins can enter an arbitrary max_price
shopSchema.pre('save', function (next) {
  if (this.isModified('price') || !this.max_price) {
    this.max_price = Math.ceil(this.price * 1.5);
  }
  next();
});

module.exports = mongoose.model('Shop', shopSchema);
