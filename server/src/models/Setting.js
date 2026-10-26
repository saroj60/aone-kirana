import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'store_settings'
    },
    store: {
      name: { type: String, default: 'Aone Kirana Store' },
      logo: { type: String, default: '/logo.png' },
      phone: { type: String, default: '9841234567' },
      email: { type: String, default: 'support@aonekirana.com' },
      address: { type: String, default: 'Ward 5, Tikathali Chowk, Mahalaxmi, Lalitpur' },
      openingHours: { type: String, default: '6:30 AM – 9:30 PM (7 Days a Week)' }
    },
    delivery: {
      radiusKm: { type: Number, default: 5.0 },
      fee: { type: Number, default: 40 },
      freeThreshold: { type: Number, default: 500 },
      estimatedTime: { type: String, default: '30–60 minutes' }
    },
    payment: {
      cod: {
        enabled: { type: Boolean, default: true },
        maxOrderAmount: { type: Number, default: 10000 },
        instructions: { type: String, default: 'Pay with cash upon physical delivery at your door.' }
      },
      esewa: {
        enabled: { type: Boolean, default: true },
        merchantCode: { type: String, default: 'EPAYTEST' },
        serviceChargePercent: { type: Number, default: 0 }
      },
      khalti: {
        enabled: { type: Boolean, default: true },
        publicKey: { type: String, default: 'test_public_key_dc74e0fd574e4d46b8817248e59c22ac' }
      },
      card: {
        enabled: { type: Boolean, default: false },
        provider: { type: String, default: 'Fonepay Visa / Mastercard' }
      }
    },
    business: {
      currency: { type: String, default: 'NPR (Rs.)' },
      taxPercent: { type: Number, default: 0 },
      invoicePrefix: { type: String, default: 'AK-' }
    },
    notifications: {
      orderEmail: { type: Boolean, default: true },
      orderPush: { type: Boolean, default: true },
      orderSms: { type: Boolean, default: false },
      lowStockAlerts: { type: Boolean, default: true },
      lowStockThreshold: { type: Number, default: 10 },
      promotionalBroadcasts: { type: Boolean, default: true }
    },
    sessions: [
      {
        id: String,
        device: String,
        browser: String,
        ipAddress: String,
        location: String,
        loginTime: { type: Date, default: Date.now },
        lastActive: { type: Date, default: Date.now },
        isCurrent: { type: Boolean, default: false }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Setting = mongoose.model('Setting', settingSchema);
