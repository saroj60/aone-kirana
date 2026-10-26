import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productId: String,
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  unit: String,
  image: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    default: ''
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  deliveryNotes: {
    type: String,
    default: ''
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'eSewa', 'Khalti', 'Fonepay', 'Bank Transfer'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: [
      'New',
      'Confirmed',
      'Preparing',
      'Ready for Delivery',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Placed',
      'Packed'
    ],
    default: 'New'
  },
  deliveryPerson: {
    id: String,
    name: String,
    phone: String,
    vehicle: String
  },
  riderName: {
    type: String,
    default: ''
  },
  riderPhone: {
    type: String,
    default: ''
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  assignedStore: {
    storeId: String,
    storeName: String,
    storeAddress: String,
    storePhone: String,
    distanceKm: Number,
    isServiceable: Boolean,
    estimatedMinutes: Number
  },
  orderTimeline: [orderTimelineSchema]
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);
