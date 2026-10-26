import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true
    },
    subtitle: {
      type: String,
      required: [true, 'Banner subtitle is required'],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Desktop banner image is required'],
      trim: true
    },
    mobileImage: {
      type: String,
      default: '',
      trim: true
    },
    discountText: {
      type: String,
      default: 'UP TO 20% OFF',
      trim: true
    },
    ctaText: {
      type: String,
      default: 'Shop Now',
      trim: true
    },
    ctaDestination: {
      type: String,
      default: '/category/all',
      trim: true
    },
    badgeText: {
      type: String,
      default: 'Fresh | Affordable | Fast Delivery',
      trim: true
    },
    deliveryTime: {
      type: String,
      default: 'Delivery in 30–60 mins',
      trim: true
    },
    deliveryRadius: {
      type: String,
      default: '3 km Radius (Tikathali & Nearby)',
      trim: true
    },
    qualityText: {
      type: String,
      default: 'Quality Products Everyday',
      trim: true
    },
    stampText: {
      type: String,
      default: 'Fresh Healthy Affordable',
      trim: true
    },
    bgColor: {
      type: String,
      default: 'from-emerald-50 via-green-50/80 to-lime-50/50'
    },
    borderColor: {
      type: String,
      default: 'border-emerald-200/80'
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
    displayOrder: {
      type: Number,
      default: 1,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'scheduled', 'expired'],
      default: 'active'
    },
    clickCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Virtual to determine if banner is currently active according to dates and status
bannerSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  if (this.status !== 'active') return false;
  return now >= new Date(this.startDate) && now <= new Date(this.endDate);
};

export const Banner = mongoose.model('Banner', bannerSchema);
