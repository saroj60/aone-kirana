import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  }
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  cardImage: {
    type: String,
    required: true
  },
  prodImage: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'Grid'
  },
  bgColor: {
    type: String,
    default: 'bg-[#eaf8ee]'
  },
  badgeColor: {
    type: String,
    default: 'bg-emerald-100 text-emerald-800'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  itemCount: {
    type: String,
    default: '0+ Items'
  },
  filterKey: {
    type: String,
    default: 'Vegetables'
  },
  subcategories: [subcategorySchema]
}, {
  timestamps: true
});

// Index for fast ordering and queries
categorySchema.index({ displayOrder: 1, isActive: 1 });

export const Category = mongoose.model('Category', categorySchema);
