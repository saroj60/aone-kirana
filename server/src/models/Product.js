import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  customId: {
    type: String,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    default: '',
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  stockQuantity: {
    type: Number,
    default: 50
  },
  minStockThreshold: {
    type: Number,
    default: 15
  },
  description: {
    type: String,
    default: ''
  },
  packSizes: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret.customId || ret._id.toString();
      delete ret.__v;
      return ret;
    }
  }
});

export const Product = mongoose.model('Product', productSchema);
