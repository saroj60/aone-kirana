import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const customerAddressSchema = new mongoose.Schema({
  label: {
    type: String,
    default: 'Home'
  },
  address: {
    type: String,
    required: true
  },
  landmark: {
    type: String,
    default: ''
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const customerReviewSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    default: 'Tikathali, Lalitpur'
  },
  addresses: [customerAddressSchema],
  role: {
    type: String,
    enum: ['customer', 'admin', 'rider'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['Active', 'Disabled', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date
  },
  reviews: [customerReviewSchema],
  activityLog: [{
    action: String,
    details: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
