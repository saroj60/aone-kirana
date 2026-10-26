/**
 * Single Store Fulfillment & Serviceability Engine
 * Configured for single store operations: Aone Kirana Central Store (Tikathali, Lalitpur).
 * 
 * Features:
 * 1. Single Store Anchoring: All incoming orders are processed at the central store.
 * 2. Serviceability & Radius Check: Verifies if the customer location falls within the store's 6 km delivery radius.
 * 3. Distance & Dynamic ETA: Calculates direct distance in km and accurate estimated delivery time.
 * 4. Central Inventory Pool Validation: Checks MongoDB single store stock for cart items.
 */

import { Product } from '../models/Product.js';
import { DeliveryPerson } from '../models/DeliveryPerson.js';
import mongoose from 'mongoose';

// Central Store Configuration for Aone Kirana
export const CENTRAL_STORE_CONFIG = {
  id: 'aone-central-tikathali',
  name: 'Aone Kirana Central Store',
  hubType: 'Central Fulfillment Store',
  address: 'Tikathali Chowk, Ward 5, Mahalaxmi, Lalitpur',
  city: 'Lalitpur',
  phone: '9841234567',
  operatingHours: '6:30 AM – 9:30 PM (7 Days a Week)',
  coordinates: {
    lat: 27.6588,
    lng: 85.3524
  },
  deliveryRadiusKm: 6.0,
  baseDeliveryFee: 40,
  freeDeliveryThreshold: 500,
  basePreparationMins: 15,
  minsPerKm: 5,
  isOpen: true
};

/**
 * Calculate distance in kilometers between two geo coordinates (Haversine formula)
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Assign and evaluate the Single Store for an order
 * @param {object} params
 * @param {Array} params.items - Cart items with productId/id and quantity
 * @param {object} [params.customerCoordinates] - { lat, lng }
 * @param {string} [params.deliveryAddress] - text address fallback
 * @param {number} [params.subtotal] - Order subtotal for free delivery check
 */
export const assignStore = async ({ items = [], customerCoordinates, deliveryAddress = '', subtotal = 0 }) => {
  let targetLat = 27.6588;
  let targetLng = 85.3524;

  if (customerCoordinates && customerCoordinates.lat && customerCoordinates.lng) {
    targetLat = Number(customerCoordinates.lat);
    targetLng = Number(customerCoordinates.lng);
  } else {
    // Address heuristic fallback for Lalitpur / Kathmandu areas
    const addr = (deliveryAddress || '').toLowerCase();
    if (addr.includes('gwarko') || addr.includes('balkumari')) {
      targetLat = 27.6680; targetLng = 85.3390;
    } else if (addr.includes('imadol') || addr.includes('sanagaun')) {
      targetLat = 27.6625; targetLng = 85.3480;
    } else if (addr.includes('lubhu') || addr.includes('lamatar')) {
      targetLat = 27.6510; targetLng = 85.3720;
    } else {
      targetLat = 27.6588; targetLng = 85.3524; // Default Tikathali Central
    }
  }

  // 1. Distance Calculation from Central Store
  const distanceKm = calculateDistanceKm(
    CENTRAL_STORE_CONFIG.coordinates.lat,
    CENTRAL_STORE_CONFIG.coordinates.lng,
    targetLat,
    targetLng
  );

  const isServiceable = distanceKm <= CENTRAL_STORE_CONFIG.deliveryRadiusKm;

  // 2. Dynamic ETA calculation
  const estimatedMinutes = Math.max(
    20,
    Math.round(CENTRAL_STORE_CONFIG.basePreparationMins + distanceKm * CENTRAL_STORE_CONFIG.minsPerKm)
  );

  // 3. Central Inventory Pool Validation
  let stockFeasibility = true;
  let outOfStockItems = [];
  const itemIds = (items || []).map(i => i.productId || i.id).filter(Boolean);

  if (itemIds.length > 0 && mongoose.connection.readyState === 1) {
    try {
      const dbProducts = await Product.find({ _id: { $in: itemIds } });
      for (const item of items) {
        const prod = dbProducts.find(p => p._id.toString() === (item.productId || item.id));
        if (prod) {
          if (typeof prod.stockCount === 'number' && prod.stockCount < (item.quantity || 1)) {
            stockFeasibility = false;
            outOfStockItems.push({
              name: prod.name,
              available: prod.stockCount,
              requested: item.quantity || 1
            });
          }
        }
      }
    } catch (e) {
      // Non-fatal if DB check is bypassed in mock mode
    }
  }

  // 4. Central Store Active Rider Capacity
  let availableRidersCount = 2;
  if (mongoose.connection.readyState === 1) {
    try {
      const freeRiders = await DeliveryPerson.countDocuments({ status: 'Available' });
      if (freeRiders > 0) availableRidersCount = freeRiders;
    } catch (e) {}
  }

  // 5. Calculate Delivery Fee
  const deliveryFee = (subtotal >= CENTRAL_STORE_CONFIG.freeDeliveryThreshold) 
    ? 0 
    : CENTRAL_STORE_CONFIG.baseDeliveryFee;

  const assignedStore = {
    storeId: CENTRAL_STORE_CONFIG.id,
    storeName: CENTRAL_STORE_CONFIG.name,
    storeAddress: CENTRAL_STORE_CONFIG.address,
    storeCoordinates: CENTRAL_STORE_CONFIG.coordinates,
    storePhone: CENTRAL_STORE_CONFIG.phone,
    distanceKm,
    deliveryRadiusKm: CENTRAL_STORE_CONFIG.deliveryRadiusKm,
    isServiceable,
    estimatedMinutes,
    estimatedTimeFormatted: `${estimatedMinutes - 5}–${estimatedMinutes + 5} mins`,
    deliveryFee,
    stockFeasible: stockFeasibility,
    outOfStockItems,
    availableRiders: availableRidersCount
  };

  return {
    isSingleStore: true,
    assignedStore,
    serviceabilityNotice: isServiceable 
      ? `Within ${CENTRAL_STORE_CONFIG.name} delivery zone (${distanceKm} km)`
      : `Location is ${distanceKm} km away (outside standard ${CENTRAL_STORE_CONFIG.deliveryRadiusKm} km coverage)`,
    timestamp: new Date().toISOString()
  };
};
