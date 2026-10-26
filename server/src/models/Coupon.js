import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: [
        'percentage',
        'fixed_amount',
        'free_delivery',
        'product_discount',
        'category_discount',
        'first_order',
        'min_order_discount'
      ],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative']
    },
    minOrder: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order cannot be negative']
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount cap cannot be negative']
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1']
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [1, 'Per user limit must be at least 1']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active'
    },
    usageCount: {
      type: Number,
      default: 0
    },
    totalDiscountGiven: {
      type: Number,
      default: 0
    },
    applicableProducts: {
      type: [String],
      default: []
    },
    applicableCategories: {
      type: [String],
      default: []
    },
    usedBy: [
      {
        userId: { type: String, default: null },
        userEmail: { type: String, default: null },
        userPhone: { type: String, default: null },
        orderId: { type: String, default: null },
        orderNumber: { type: String, default: null },
        discountApplied: { type: Number, required: true },
        usedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Virtual to determine if coupon is currently expired based on date
couponSchema.methods.isExpired = function () {
  return new Date() > new Date(this.endDate);
};

export const Coupon = mongoose.model('Coupon', couponSchema);
