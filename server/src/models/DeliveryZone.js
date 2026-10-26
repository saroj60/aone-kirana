import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  radiusKm: {
    type: Number,
    required: true
  },
  baseFee: {
    type: Number,
    required: true,
    default: 0
  },
  freeDeliveryThreshold: {
    type: Number,
    required: true,
    default: 500
  },
  estimatedTime: {
    type: String,
    default: '30-45 mins'
  },
  areas: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // GPS/Coordinates placeholder for future map boundary polygon
  coordinates: {
    centerLat: { type: Number, default: 27.6588 },
    centerLng: { type: Number, default: 85.3524 }
  }
}, {
  timestamps: true
});

export const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
