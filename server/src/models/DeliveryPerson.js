import mongoose from 'mongoose';

const deliveryPersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  status: {
    type: String,
    enum: ['Available', 'On Delivery', 'Busy', 'Off Duty'],
    default: 'Available'
  },
  vehicle: {
    type: String,
    default: 'Motorcycle'
  },
  rating: {
    type: Number,
    default: 4.8
  },
  currentAssignedOrders: [{
    type: String
  }],
  completedDeliveries: {
    type: Number,
    default: 0
  },
  // Architecture ready for future GPS tracking
  coordinates: {
    lat: { type: Number, default: 27.6588 },
    lng: { type: Number, default: 85.3524 },
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

export const DeliveryPerson = mongoose.model('DeliveryPerson', deliveryPersonSchema);
