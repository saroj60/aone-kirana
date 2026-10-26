import { DeliveryPerson } from '../models/DeliveryPerson.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import mongoose from 'mongoose';
import { broadcastRealtimeEvent } from '../services/realtimeService.js';

// Initial pre-seeded delivery persons in Tikathali hub
const INITIAL_RIDERS_SEED = [
  {
    id: 'rider-1',
    name: 'Bikash Tamang',
    phone: '9801122334',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'On Delivery',
    vehicle: 'Honda Activa 6G (Ba 2 Cha 4567)',
    rating: 4.9,
    currentAssignedOrders: ['AK-9842'],
    completedDeliveries: 184,
    coordinates: { lat: 27.6592, lng: 85.3530, lastUpdated: new Date().toISOString() },
    createdAt: new Date('2025-06-10').toISOString()
  },
  {
    id: 'rider-2',
    name: 'Suman Shrestha',
    phone: '9841556677',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    status: 'Available',
    vehicle: 'Bajaj Pulsar 150 (Pra 3-02 Pa 7890)',
    rating: 4.8,
    currentAssignedOrders: [],
    completedDeliveries: 242,
    coordinates: { lat: 27.6580, lng: 85.3518, lastUpdated: new Date().toISOString() },
    createdAt: new Date('2025-04-15').toISOString()
  },
  {
    id: 'rider-3',
    name: 'Ramesh Chaudhary',
    phone: '9812998877',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    status: 'On Delivery',
    vehicle: 'Super Soco Electric Scooter (Ba 98 Pa 3321)',
    rating: 4.7,
    currentAssignedOrders: ['AK-9844'],
    completedDeliveries: 96,
    coordinates: { lat: 27.6610, lng: 85.3545, lastUpdated: new Date().toISOString() },
    createdAt: new Date('2025-09-01').toISOString()
  },
  {
    id: 'rider-4',
    name: 'Anil Maharjan',
    phone: '9860334455',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    status: 'Available',
    vehicle: 'Yamaha FZ Version 3 (Ba 88 Pa 1234)',
    rating: 5.0,
    currentAssignedOrders: [],
    completedDeliveries: 310,
    coordinates: { lat: 27.6585, lng: 85.3520, lastUpdated: new Date().toISOString() },
    createdAt: new Date('2025-02-18').toISOString()
  }
];

// Initial delivery zones configured for local delivery
const INITIAL_ZONES_SEED = [
  {
    id: 'zone-1',
    name: 'Zone 1: Tikathali & Mahalaxmi Core',
    radiusKm: 2.0,
    baseFee: 0,
    freeDeliveryThreshold: 350,
    estimatedTime: '20-30 mins',
    isActive: true,
    areas: ['Tikathali Chowk', 'Ward 5', 'Pabitra Nagar', 'Water Tank Area', 'Shiva Mandir'],
    coordinates: { centerLat: 27.6588, centerLng: 85.3524 }
  },
  {
    id: 'zone-2',
    name: 'Zone 2: Imadol & Sanagaun Sector',
    radiusKm: 4.0,
    baseFee: 30,
    freeDeliveryThreshold: 500,
    estimatedTime: '30-45 mins',
    isActive: true,
    areas: ['Sanagaun', 'Siddhipur Road', 'Krishna Mandir Imadol', 'Bhatkeko Pool', 'Boje Pokhari'],
    coordinates: { centerLat: 27.6625, centerLng: 85.3480 }
  },
  {
    id: 'zone-3',
    name: 'Zone 3: Gwarko & Balkumari Ring Road',
    radiusKm: 6.0,
    baseFee: 50,
    freeDeliveryThreshold: 800,
    estimatedTime: '40-55 mins',
    isActive: true,
    areas: ['Gwarko Flyover', 'Balkumari Chowk', 'KMC Hospital Periphery', 'B & B Hospital Area'],
    coordinates: { centerLat: 27.6680, centerLng: 85.3390 }
  },
  {
    id: 'zone-4',
    name: 'Zone 4: Lubhu & Lamatar Foothills',
    radiusKm: 8.0,
    baseFee: 60,
    freeDeliveryThreshold: 1000,
    estimatedTime: '45-60 mins',
    isActive: true,
    areas: ['Lubhu Bus Park', 'Mahalaxmi Ward 7', 'Lamatar Turning', 'Govindpur'],
    coordinates: { centerLat: 27.6510, centerLng: 85.3720 }
  }
];

// Live dispatch orders with delivery status
const INITIAL_DELIVERY_ORDERS_SEED = [
  {
    id: 'del-001',
    orderNumber: 'AK-9842',
    customerName: 'Saroj Shrestha',
    customerPhone: '9841234567',
    deliveryAddress: 'Ward 5, Tikathali Chowk, Lalitpur',
    zone: 'Zone 1: Tikathali & Mahalaxmi Core',
    itemsCount: 3,
    total: 400,
    deliveryFee: 0,
    paymentMethod: 'eSewa',
    deliveryStatus: 'Out for Delivery',
    assignedRiderId: 'rider-1',
    riderName: 'Bikash Tamang',
    riderPhone: '9801122334',
    assignedAt: new Date(Date.now() - 3600000).toISOString(),
    pickedUpAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: 'del-002',
    orderNumber: 'AK-9843',
    customerName: 'Sunita Maharjan',
    customerPhone: '9851098765',
    deliveryAddress: 'Sanagaun, Ward 4, Siddhipur Road, Lalitpur',
    zone: 'Zone 2: Imadol & Sanagaun Sector',
    itemsCount: 3,
    total: 1250,
    deliveryFee: 0,
    paymentMethod: 'COD',
    deliveryStatus: 'Waiting',
    assignedRiderId: null,
    riderName: null,
    riderPhone: null,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'del-003',
    orderNumber: 'AK-9844',
    customerName: 'Anil Karki',
    customerPhone: '9861234987',
    deliveryAddress: 'Near Krishna Mandir, Imadol, Lalitpur',
    zone: 'Zone 2: Imadol & Sanagaun Sector',
    itemsCount: 5,
    total: 310,
    deliveryFee: 40,
    paymentMethod: 'Khalti',
    deliveryStatus: 'Assigned',
    assignedRiderId: 'rider-3',
    riderName: 'Ramesh Chaudhary',
    riderPhone: '9812998877',
    assignedAt: new Date(Date.now() - 2400000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'del-004',
    orderNumber: 'AK-9847',
    customerName: 'Pooja Baral',
    customerPhone: '9843221100',
    deliveryAddress: 'Balkumari Ring Road, Near Apex College',
    zone: 'Zone 3: Gwarko & Balkumari Ring Road',
    itemsCount: 2,
    total: 820,
    deliveryFee: 0,
    paymentMethod: 'Fonepay',
    deliveryStatus: 'Picked Up',
    assignedRiderId: 'rider-1',
    riderName: 'Bikash Tamang',
    riderPhone: '9801122334',
    assignedAt: new Date(Date.now() - 2700000).toISOString(),
    pickedUpAt: new Date(Date.now() - 900000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Delivery history logs
const INITIAL_DELIVERY_HISTORY_SEED = [
  {
    id: 'trip-101',
    orderNumber: 'AK-9845',
    customerName: 'Pratima Thapa',
    customerPhone: '9813456789',
    deliveryAddress: 'Gwarko Flyover Chowk, Lalitpur',
    zone: 'Zone 3: Gwarko & Balkumari Ring Road',
    riderName: 'Bikash Tamang',
    vehicle: 'Honda Activa 6G',
    deliveryStatus: 'Delivered',
    durationMins: 28,
    deliveryFee: 30,
    totalAmount: 250,
    deliveredAt: new Date(Date.now() - 72000000).toISOString()
  },
  {
    id: 'trip-102',
    orderNumber: 'AK-9840',
    customerName: 'Bina Shakya',
    customerPhone: '9841889900',
    deliveryAddress: 'Mangalbazar, Patan Heritage Zone',
    zone: 'Zone 3: Gwarko & Balkumari Ring Road',
    riderName: 'Anil Maharjan',
    vehicle: 'Yamaha FZ',
    deliveryStatus: 'Delivered',
    durationMins: 34,
    deliveryFee: 50,
    totalAmount: 1840,
    deliveredAt: new Date(Date.now() - 115200000).toISOString()
  },
  {
    id: 'trip-103',
    orderNumber: 'AK-9846',
    customerName: 'Deepak Joshi',
    customerPhone: '9802345678',
    deliveryAddress: 'Lubhu Bus Park, Mahalaxmi Ward 7',
    zone: 'Zone 4: Lubhu & Lamatar Foothills',
    riderName: 'Suman Shrestha',
    vehicle: 'Bajaj Pulsar 150',
    deliveryStatus: 'Failed',
    durationMins: 45,
    deliveryFee: 60,
    totalAmount: 130,
    deliveredAt: new Date(Date.now() - 169200000).toISOString(),
    failureReason: 'Customer phone switched off after 3 arrival calls'
  }
];

let memoryRiders = [...INITIAL_RIDERS_SEED];
let memoryZones = [...INITIAL_ZONES_SEED];
let memoryDeliveries = [...INITIAL_DELIVERY_ORDERS_SEED];
let memoryHistory = [...INITIAL_DELIVERY_HISTORY_SEED];

/**
 * @desc Get Delivery Dashboard stats, active deliveries, riders, and zones
 * @route GET /api/delivery/dashboard
 */
export const getDeliveryDashboard = async (req, res) => {
  try {
    const pendingDeliveries = memoryDeliveries.filter(d => d.deliveryStatus === 'Waiting' || d.deliveryStatus === 'Assigned').length;
    const activeDeliveries = memoryDeliveries.filter(d => d.deliveryStatus === 'Picked Up' || d.deliveryStatus === 'Out for Delivery').length;
    const completedToday = memoryHistory.filter(h => {
      const isDelivered = h.deliveryStatus === 'Delivered';
      const isToday = new Date(h.deliveredAt).toDateString() === new Date().toDateString();
      return isDelivered && isToday;
    }).length || 3; // fallback seed count
    const availableRiders = memoryRiders.filter(r => r.status === 'Available').length;

    res.json({
      success: true,
      stats: {
        pendingDeliveries,
        activeDeliveries,
        completedToday,
        availableRiders,
        totalRiders: memoryRiders.length,
        totalZones: memoryZones.length
      },
      deliveries: memoryDeliveries,
      riders: memoryRiders,
      zones: memoryZones
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get all delivery riders
 * @route GET /api/delivery/riders
 */
export const getDeliveryPersons = async (req, res) => {
  try {
    res.json({ success: true, data: memoryRiders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Add new delivery person
 * @route POST /api/delivery/riders
 */
export const createDeliveryPerson = async (req, res) => {
  try {
    const { name, phone, vehicle, avatar } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const newRider = {
      id: `rider-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      vehicle: vehicle?.trim() || 'Motorcycle',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'Available',
      rating: 5.0,
      currentAssignedOrders: [],
      completedDeliveries: 0,
      coordinates: { lat: 27.6588, lng: 85.3524, lastUpdated: new Date().toISOString() },
      createdAt: new Date().toISOString()
    };

    memoryRiders.push(newRider);
    res.status(201).json({ success: true, data: newRider, message: 'Rider added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update delivery person status or details
 * @route PATCH /api/delivery/riders/:id
 */
export const updateDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const riderIndex = memoryRiders.findIndex(r => r.id === id);
    if (riderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Delivery person not found' });
    }

    memoryRiders[riderIndex] = { ...memoryRiders[riderIndex], ...updates };
    res.json({ success: true, data: memoryRiders[riderIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Assign delivery person to an order
 * @route POST /api/delivery/assign
 */
export const assignDeliveryPerson = async (req, res) => {
  try {
    const { deliveryId, riderId } = req.body;

    const deliveryIndex = memoryDeliveries.findIndex(d => d.id === deliveryId || d.orderNumber === deliveryId);
    if (deliveryIndex === -1) {
      return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }

    const rider = memoryRiders.find(r => r.id === riderId);
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Delivery person not found' });
    }

    const delivery = memoryDeliveries[deliveryIndex];
    delivery.assignedRiderId = rider.id;
    delivery.riderName = rider.name;
    delivery.riderPhone = rider.phone;
    delivery.deliveryStatus = 'Assigned';
    delivery.assignedAt = new Date().toISOString();

    // Update rider active orders and status
    if (!rider.currentAssignedOrders.includes(delivery.orderNumber)) {
      rider.currentAssignedOrders.push(delivery.orderNumber);
    }
    rider.status = 'On Delivery';

    delivery.pickupAddress = 'Aone Kirana Central Store, Tikathali Chowk, Lalitpur';
    delivery.pickupCoordinates = { lat: 27.6588, lng: 85.3524 };

    memoryDeliveries[deliveryIndex] = delivery;

    // Realtime notification broadcast to Customer, Store Dashboard, Rider App
    broadcastRealtimeEvent('DELIVERY_STATUS_CHANGED', {
      deliveryId: delivery.id,
      orderNumber: delivery.orderNumber,
      status: 'Assigned',
      delivery
    });

    res.json({
      success: true,
      message: `Assigned ${rider.name} to order #${delivery.orderNumber}`,
      data: delivery,
      rider
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update order delivery status (Waiting -> Assigned -> Picked Up -> Out for Delivery -> Delivered / Failed)
 * @route PATCH /api/delivery/orders/:id/status
 */
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, failureReason } = req.body;

    const validStatuses = ['Waiting', 'Assigned', 'Picked Up', 'Out for Delivery', 'Delivered', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Choose from: ${validStatuses.join(', ')}` });
    }

    const deliveryIndex = memoryDeliveries.findIndex(d => d.id === id || d.orderNumber === id);
    if (deliveryIndex === -1) {
      return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }

    const delivery = memoryDeliveries[deliveryIndex];
    delivery.deliveryStatus = status;

    if (status === 'Picked Up') {
      delivery.pickedUpAt = new Date().toISOString();
    } else if (status === 'Delivered' || status === 'Failed') {
      delivery.completedAt = new Date().toISOString();

      // Log into delivery history
      const historyEntry = {
        id: `trip-${Date.now()}`,
        orderNumber: delivery.orderNumber,
        customerName: delivery.customerName,
        customerPhone: delivery.customerPhone,
        deliveryAddress: delivery.deliveryAddress,
        zone: delivery.zone,
        riderName: delivery.riderName || 'Unassigned',
        vehicle: 'Express Partner Bike',
        deliveryStatus: status,
        durationMins: Math.floor(20 + Math.random() * 25),
        deliveryFee: delivery.deliveryFee || 0,
        totalAmount: delivery.total,
        deliveredAt: new Date().toISOString(),
        failureReason: failureReason || ''
      };
      memoryHistory.unshift(historyEntry);

      // Free rider if completed
      if (delivery.assignedRiderId) {
        const rider = memoryRiders.find(r => r.id === delivery.assignedRiderId);
        if (rider) {
          rider.currentAssignedOrders = rider.currentAssignedOrders.filter(o => o !== delivery.orderNumber);
          if (status === 'Delivered') rider.completedDeliveries += 1;
          if (rider.currentAssignedOrders.length === 0) rider.status = 'Available';
        }
      }
    }

    delivery.pickupAddress = 'Aone Kirana Central Store, Tikathali Chowk, Lalitpur';
    delivery.pickupCoordinates = { lat: 27.6588, lng: 85.3524 };

    memoryDeliveries[deliveryIndex] = delivery;

    // Realtime notification broadcast to Customer, Store Dashboard, Rider App
    broadcastRealtimeEvent('DELIVERY_STATUS_CHANGED', {
      deliveryId: delivery.id,
      orderNumber: delivery.orderNumber,
      status: 'Assigned',
      delivery
    });

    res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get Delivery History
 * @route GET /api/delivery/history
 */
export const getDeliveryHistory = async (req, res) => {
  try {
    res.json({ success: true, data: memoryHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get Delivery Zones
 * @route GET /api/delivery/zones
 */
export const getDeliveryZones = async (req, res) => {
  try {
    res.json({ success: true, data: memoryZones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update Delivery Zone settings (radius, fee, free delivery threshold)
 * @route PUT /api/delivery/zones/:id
 */
export const updateDeliveryZone = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const zoneIndex = memoryZones.findIndex(z => z.id === id);
    if (zoneIndex === -1) {
      return res.status(404).json({ success: false, message: 'Delivery zone not found' });
    }

    memoryZones[zoneIndex] = { ...memoryZones[zoneIndex], ...updates };
    res.json({ success: true, data: memoryZones[zoneIndex], message: 'Zone settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
