import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';
import { broadcastRealtimeEvent } from '../services/realtimeService.js';
import { assignStore } from '../services/storeAssignmentService.js';

// Fallback in-memory orders (only used if MongoDB is offline)
export let memoryOrders = [];

// Helper to format mongoose order document
const formatOrder = (doc) => {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id ? o._id.toString() : (o.id || `ord-${Date.now()}`),
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail || '',
    deliveryAddress: o.deliveryAddress,
    deliveryNotes: o.deliveryNotes || '',
    deliverySlot: o.deliverySlot || 'express',
    items: (o.items || []).map(item => ({
      productId: item.productId || (item.product ? item.product.toString() : ''),
      name: item.name || (item.product && item.product.name) || 'Product',
      price: item.price || 0,
      unit: item.unit || '1 unit',
      image: item.image || (item.product && item.product.image) || '/placeholder.png',
      quantity: item.quantity || 1,
      product: {
        id: item.productId || (item.product ? item.product.toString() : ''),
        name: item.name || (item.product && item.product.name) || 'Product',
        price: item.price || 0,
        unit: item.unit || '1 unit',
        image: item.image || (item.product && item.product.image) || '/placeholder.png',
        inStock: true
      }
    })),
    subtotal: o.subtotal || 0,
    discount: o.discount || 0,
    deliveryFee: o.deliveryFee || 0,
    total: o.total || 0,
    paymentMethod: o.paymentMethod || 'COD',
    paymentStatus: o.paymentStatus || (o.paymentMethod === 'COD' ? 'Pending' : 'Paid'),
    status: o.status || 'New',
    assignedStore: o.assignedStore || null,
    deliveryPerson: o.deliveryPerson || null,
    riderName: o.riderName || (o.deliveryPerson && o.deliveryPerson.name) || '',
    riderPhone: o.riderPhone || (o.deliveryPerson && o.deliveryPerson.phone) || '',
    cancellationReason: o.cancellationReason || '',
    orderTimeline: o.orderTimeline || [],
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString()
  };
};

/**
 * @desc Create a new real order from checkout
 * @route POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      customerPhone,
      customerName,
      paymentMethod = 'COD',
      deliverySlot = 'express',
      userId
    } = req.body;

    if (!items || !items.length || !customerPhone || !customerName || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Items, customer name, mobile number, and delivery address are required.'
      });
    }

    const cleanPhone = customerPhone.toString().replace(/[^0-9]/g, '').slice(-10);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AK-${randomNum}`;

    // Map items cleanly to schema
    const formattedItems = items.map(item => {
      const prod = item.product || item;
      return {
        productId: prod.id || item.productId || 'prod-item',
        name: prod.name || item.name || 'Product',
        price: Number(prod.price || item.price || 0),
        unit: prod.unit || item.unit || '1 unit',
        image: prod.image || item.image || '/placeholder.png',
        quantity: Number(item.quantity || 1)
      };
    });

    // Automated Store Assignment (Distance + Stock + Capacity)
    let assignedStore = null;
    try {
      const assignmentResult = await assignStore({
        items: formattedItems,
        customerCoordinates: req.body.customerCoordinates || null,
        deliveryAddress
      });
      assignedStore = assignmentResult.assignedStore;
    } catch (assignErr) {
      console.warn('Store assignment error:', assignErr.message);
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    let savedOrderDoc = null;

    if (isMongoConnected) {
      // Find or link customer
      let user = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      }
      if (!user && cleanPhone) {
        user = await User.findOne({ phone: cleanPhone });
      }

      // If user doesn't exist yet, automatically register them as a customer!
      if (!user && cleanPhone) {
        try {
          user = await User.create({
            name: customerName.trim(),
            phone: cleanPhone,
            email: `${cleanPhone}@aonekirana.np`,
            password: 'password123',
            address: deliveryAddress,
            addresses: [{ label: 'Home', address: deliveryAddress, isDefault: true }],
            role: 'customer',
            status: 'Active',
            totalOrders: 1,
            totalSpent: Number(total || 0),
            activityLog: [
              { action: 'Order Placed', details: `First order placed (${orderNumber})`, timestamp: new Date() }
            ]
          });
        } catch (e) {
          console.warn('Could not auto-create user on order:', e.message);
        }
      } else if (user) {
        user.totalOrders = (user.totalOrders || 0) + 1;
        user.totalSpent = (user.totalSpent || 0) + Number(total || 0);
        user.lastOrderDate = new Date();
        if (!user.activityLog) user.activityLog = [];
        user.activityLog.unshift({
          action: 'Order Placed',
          details: `Order #${orderNumber} placed (Rs. ${total})`,
          timestamp: new Date()
        });
        await user.save();
      }

      const initialTimeline = [
        {
          status: 'New',
          timestamp: new Date(),
          note: `Order placed by ${customerName.trim()} via ${paymentMethod}`
        },
        ...(assignedStore ? [{
          status: 'Assigned',
          timestamp: new Date(),
          note: `Fulfillment assigned to ${assignedStore.storeName} (${assignedStore.distanceKm} km away)`
        }] : [])
      ];

      savedOrderDoc = await Order.create({
        orderNumber,
        customer: user ? user._id : undefined,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: user ? user.email : `${cleanPhone}@aonekirana.np`,
        deliveryAddress: deliveryAddress.trim(),
        assignedStore: assignedStore || undefined,
        items: formattedItems,
        subtotal: Number(subtotal || 0),
        deliveryFee: Number(deliveryFee || 0),
        total: Number(total || 0),
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        status: 'New',
        deliverySlot,
        orderTimeline: initialTimeline
      });
    }

    if (assignedStore) {
      if (savedOrderDoc) {
        savedOrderDoc.assignedStore = assignedStore;
        savedOrderDoc.orderTimeline.push({
          status: 'Assigned',
          timestamp: new Date(),
          note: `Auto-assigned to ${assignedStore.storeName} (${assignedStore.distanceKm} km away)`
        });
        await savedOrderDoc.save();
      }
    }

    const orderObj = savedOrderDoc ? formatOrder(savedOrderDoc) : {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: `${cleanPhone}@aonekirana.np`,
      deliveryAddress: deliveryAddress.trim(),
      assignedStore: assignedStore,
      items: formattedItems,
      subtotal: Number(subtotal || 0),
      deliveryFee: Number(deliveryFee || 0),
      total: Number(total || 0),
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      status: 'New',
      createdAt: new Date().toISOString(),
      orderTimeline: [
        { status: 'New', timestamp: new Date().toISOString(), note: 'Order placed' },
        ...(assignedStore ? [{ status: 'Assigned', timestamp: new Date().toISOString(), note: `Auto-assigned to ${assignedStore.storeName}` }] : [])
      ]
    };

    if (assignedStore && !orderObj.assignedStore) {
      orderObj.assignedStore = assignedStore;
    }

    memoryOrders.unshift(orderObj);

    // Broadcast realtime event to Store Dashboard, Rider App, and Customer
    broadcastRealtimeEvent('ORDER_CREATED', orderObj);

    return res.status(201).json({
      success: true,
      message: `Order #${orderNumber} placed successfully!`,
      data: orderObj
    });
  } catch (error) {
    console.error('Error creating order in MongoDB:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get all real orders with filtering and search
 * @route GET /api/orders
 */
export const getOrders = async (req, res) => {
  try {
    const { status, paymentMethod, paymentStatus, dateRange, search } = req.query;

    let allOrders = [];
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      try {
        const docs = await Order.find().sort({ createdAt: -1 });
        allOrders = docs.map(formatOrder);

        // Also include memory-only orders if any were placed while DB was offline
        for (const mo of memoryOrders) {
          if (!allOrders.some(o => o.orderNumber === mo.orderNumber || o.id === mo.id)) {
            allOrders.push(mo);
          }
        }
      } catch (err) {
        console.warn('Error reading orders from MongoDB, falling back to memory:', err.message);
        allOrders = [...memoryOrders];
      }
    } else {
      allOrders = [...memoryOrders];
    }

    let orders = [...allOrders];

    // Status Filter
    if (status && status !== 'all') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    // Payment Method Filter
    if (paymentMethod && paymentMethod !== 'all') {
      orders = orders.filter(o => o.paymentMethod.toLowerCase() === paymentMethod.toLowerCase());
    }

    // Payment Status Filter
    if (paymentStatus && paymentStatus !== 'all') {
      orders = orders.filter(o => o.paymentStatus?.toLowerCase() === paymentStatus.toLowerCase());
    }

    // Date Range Filter
    if (dateRange && dateRange !== 'all') {
      const now = Date.now();
      if (dateRange === 'today') {
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        orders = orders.filter(o => new Date(o.createdAt).getTime() >= startOfDay);
      } else if (dateRange === 'yesterday') {
        const startOfYesterday = new Date(now - 86400000).setHours(0, 0, 0, 0);
        const endOfYesterday = new Date(now - 86400000).setHours(23, 59, 59, 999);
        orders = orders.filter(o => {
          const t = new Date(o.createdAt).getTime();
          return t >= startOfYesterday && t <= endOfYesterday;
        });
      } else if (dateRange === 'week') {
        const weekAgo = now - 7 * 86400000;
        orders = orders.filter(o => new Date(o.createdAt).getTime() >= weekAgo);
      } else if (dateRange === 'month') {
        const monthAgo = now - 30 * 86400000;
        orders = orders.filter(o => new Date(o.createdAt).getTime() >= monthAgo);
      }
    }

    // Search Filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      orders = orders.filter(o =>
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Stats calculated dynamically from real orders
    const stats = {
      totalOrders: allOrders.length,
      newOrders: allOrders.filter(o => o.status === 'New').length,
      confirmedOrders: allOrders.filter(o => o.status === 'Confirmed').length,
      preparingOrders: allOrders.filter(o => o.status === 'Preparing').length,
      readyOrders: allOrders.filter(o => o.status === 'Ready for Delivery').length,
      outForDeliveryOrders: allOrders.filter(o => o.status === 'Out for Delivery').length,
      deliveredOrders: allOrders.filter(o => o.status === 'Delivered').length,
      cancelledOrders: allOrders.filter(o => o.status === 'Cancelled').length
    };

    res.json({
      success: true,
      stats,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get single order by ID or orderNumber
 * @route GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await Order.findById(id);
        if (doc) order = formatOrder(doc);
      }
      if (!order) {
        const doc = await Order.findOne({ orderNumber: id });
        if (doc) order = formatOrder(doc);
      }
    }

    if (!order) {
      order = memoryOrders.find(o => o.id === id || o.orderNumber === id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update order status with lifecycle flow
 * @route PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, cancellationReason } = req.body;

    const validStatuses = [
      'New',
      'Confirmed',
      'Preparing',
      'Ready for Delivery',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    let orderDoc = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        orderDoc = await Order.findById(id);
      }
      if (!orderDoc) {
        orderDoc = await Order.findOne({ orderNumber: id });
      }
    }

    const orderIndex = memoryOrders.findIndex(o => o.id === id || o.orderNumber === id);
    let targetOrder = orderDoc ? formatOrder(orderDoc) : (orderIndex !== -1 ? memoryOrders[orderIndex] : null);

    if (!targetOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    targetOrder.status = status;
    if (status === 'Cancelled' && cancellationReason) {
      targetOrder.cancellationReason = cancellationReason;
    }
    if (status === 'Delivered' && targetOrder.paymentMethod === 'COD') {
      targetOrder.paymentStatus = 'Paid';
    }

    const timelineEntry = {
      status,
      timestamp: new Date().toISOString(),
      note: note || (status === 'Cancelled' ? cancellationReason || 'Order cancelled' : `Status updated to ${status}`)
    };

    if (!targetOrder.orderTimeline) targetOrder.orderTimeline = [];
    targetOrder.orderTimeline.push(timelineEntry);

    if (orderDoc) {
      orderDoc.status = status;
      orderDoc.paymentStatus = targetOrder.paymentStatus;
      if (cancellationReason) orderDoc.cancellationReason = cancellationReason;
      orderDoc.orderTimeline.push(timelineEntry);
      await orderDoc.save();
    }

    if (orderIndex !== -1) {
      memoryOrders[orderIndex] = targetOrder;
    }

    // Realtime notification broadcast to Customer, Store Dashboard, Rider App
    broadcastRealtimeEvent('ORDER_STATUS_CHANGED', {
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      status: targetOrder.status,
      paymentStatus: targetOrder.paymentStatus,
      order: targetOrder
    });

    res.json({
      success: true,
      message: `Order #${targetOrder.orderNumber} status updated to ${status}`,
      data: targetOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Assign delivery person to an order
 * @route PATCH /api/orders/:id/assign-rider
 */
export const assignDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPerson } = req.body;

    if (!deliveryPerson || !deliveryPerson.name) {
      return res.status(400).json({ success: false, message: 'Delivery person details required' });
    }

    let orderDoc = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        orderDoc = await Order.findById(id);
      }
      if (!orderDoc) {
        orderDoc = await Order.findOne({ orderNumber: id });
      }
    }

    const orderIndex = memoryOrders.findIndex(o => o.id === id || o.orderNumber === id);
    let targetOrder = orderDoc ? formatOrder(orderDoc) : (orderIndex !== -1 ? memoryOrders[orderIndex] : null);

    if (!targetOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    targetOrder.deliveryPerson = deliveryPerson;
    targetOrder.riderName = deliveryPerson.name;
    targetOrder.riderPhone = deliveryPerson.phone;

    const timelineEntry = {
      status: targetOrder.status,
      timestamp: new Date().toISOString(),
      note: `Assigned to delivery partner ${deliveryPerson.name} (${deliveryPerson.vehicle || 'Bike'})`
    };

    if (!targetOrder.orderTimeline) targetOrder.orderTimeline = [];
    targetOrder.orderTimeline.push(timelineEntry);

    if (orderDoc) {
      orderDoc.deliveryPerson = deliveryPerson;
      orderDoc.riderName = deliveryPerson.name;
      orderDoc.riderPhone = deliveryPerson.phone;
      orderDoc.orderTimeline.push(timelineEntry);
      await orderDoc.save();
    }

    if (orderIndex !== -1) {
      memoryOrders[orderIndex] = targetOrder;
    }

    // Realtime notification broadcast to Customer, Store Dashboard, Rider App
    broadcastRealtimeEvent('RIDER_ASSIGNED', {
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      rider: deliveryPerson,
      order: targetOrder
    });

    res.json({
      success: true,
      message: `Assigned rider ${deliveryPerson.name} to order #${targetOrder.orderNumber}`,
      data: targetOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update payment status of an order
 * @route PATCH /api/orders/:id/payment
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const valid = ['Paid', 'Pending', 'Failed', 'Refunded'];
    if (!valid.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    let orderDoc = null;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        orderDoc = await Order.findById(id);
      }
      if (!orderDoc) {
        orderDoc = await Order.findOne({ orderNumber: id });
      }
    }

    const orderIndex = memoryOrders.findIndex(o => o.id === id || o.orderNumber === id);
    let targetOrder = orderDoc ? formatOrder(orderDoc) : (orderIndex !== -1 ? memoryOrders[orderIndex] : null);

    if (!targetOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    targetOrder.paymentStatus = paymentStatus;

    if (orderDoc) {
      orderDoc.paymentStatus = paymentStatus;
      await orderDoc.save();
    }

    if (orderIndex !== -1) {
      memoryOrders[orderIndex] = targetOrder;
    }

    res.json({
      success: true,
      message: `Payment status updated to ${paymentStatus} for order #${targetOrder.orderNumber}`,
      data: targetOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Evaluate store assignment (Distance + Stock + Capacity)
 * @route POST /api/orders/store-assignment
 */
export const evaluateStoreAssignment = async (req, res) => {
  try {
    const { items, customerCoordinates, deliveryAddress } = req.body;
    const assignment = await assignStore({
      items: items || [],
      customerCoordinates: customerCoordinates || null,
      deliveryAddress: deliveryAddress || ''
    });
    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
