import { User } from '../models/User.js';
import mongoose from 'mongoose';

// In-memory customer storage (only used if MongoDB is offline)
export let memoryCustomers = [];

/**
 * @desc Get all real registered customers with search, status filter, and pagination
 * @route GET /api/customers
 * @security Password strictly omitted
 */
export const getCustomers = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    let allCustomers = [];
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      try {
        const dbUsers = await User.find({ role: { $ne: 'admin' } })
          .select('-password')
          .sort({ createdAt: -1 });

        const mappedDb = dbUsers.map(u => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email || `${u.phone}@aonekirana.np`,
          phone: u.phone,
          address: u.address || 'Ward 5, Tikathali Chowk, Lalitpur',
          addresses: u.addresses && u.addresses.length > 0 ? u.addresses : [
            { label: 'Home', address: u.address || 'Ward 5, Tikathali Chowk, Lalitpur', isDefault: true }
          ],
          totalOrders: u.totalOrders || 0,
          totalSpent: u.totalSpent || 0,
          lastOrderDate: u.lastOrderDate ? new Date(u.lastOrderDate).toISOString() : new Date(u.createdAt || Date.now()).toISOString(),
          status: u.status || 'Active',
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          reviews: u.reviews || [],
          activityLog: u.activityLog || []
        }));

        allCustomers = [...mappedDb];

        // Also merge any memory customers registered when MongoDB was offline
        for (const mc of memoryCustomers) {
          if (!allCustomers.some(c => c.phone === mc.phone || c.id === mc.id)) {
            allCustomers.push(mc);
          }
        }
      } catch (dbErr) {
        console.warn('Error reading users from MongoDB, falling back to memory:', dbErr.message);
        allCustomers = [...memoryCustomers];
      }
    } else {
      allCustomers = [...memoryCustomers];
    }

    let filtered = [...allCustomers];

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }

    // Search query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'totalSpent') {
        return order === 'asc' ? (a.totalSpent || 0) - (b.totalSpent || 0) : (b.totalSpent || 0) - (a.totalSpent || 0);
      }
      if (sortBy === 'totalOrders') {
        return order === 'asc' ? (a.totalOrders || 0) - (b.totalOrders || 0) : (b.totalOrders || 0) - (a.totalOrders || 0);
      }
      return order === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const totalCount = filtered.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    // Summary stats
    const all = allCustomers;
    const totalCustomers = all.length;
    const activeCount = all.filter(c => c.status === 'Active').length;
    const disabledCount = all.filter(c => c.status === 'Disabled').length;
    const totalSpentSum = all.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

    // Ensure password is never exposed
    const sanitized = paginated.map(c => {
      const { password, ...safe } = c;
      return safe;
    });

    res.json({
      success: true,
      stats: {
        totalCustomers,
        activeCustomers: activeCount,
        disabledCustomers: disabledCount,
        totalCustomerSpend: totalSpentSum,
        averageCustomerValue: totalCustomers > 0 ? Math.round(totalSpentSum / totalCustomers) : 0
      },
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(totalCount / limitNum))
      },
      data: sanitized
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get customer by ID (Profile, Addresses, Order history, Reviews, Activity)
 * @route GET /api/customers/:id
 * @security Password strictly omitted
 */
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    let customer = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const u = await User.findById(id).select('-password');
      if (u) {
        customer = {
          id: u._id.toString(),
          name: u.name,
          email: u.email || `${u.phone}@aonekirana.np`,
          phone: u.phone,
          address: u.address || 'Ward 5, Tikathali Chowk, Lalitpur',
          addresses: u.addresses && u.addresses.length > 0 ? u.addresses : [
            { label: 'Home', address: u.address || 'Ward 5, Tikathali Chowk, Lalitpur', isDefault: true }
          ],
          totalOrders: u.totalOrders || 0,
          totalSpent: u.totalSpent || 0,
          lastOrderDate: u.lastOrderDate ? new Date(u.lastOrderDate).toISOString() : new Date(u.createdAt || Date.now()).toISOString(),
          status: u.status || 'Active',
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          reviews: u.reviews || [],
          activityLog: u.activityLog || []
        };
      }
    }

    if (!customer) {
      customer = memoryCustomers.find(c => c.id === id || c.email === id || c.phone === id);
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found' });
    }

    const { password, ...safeCustomer } = customer;

    res.json({
      success: true,
      data: safeCustomer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Enable / Disable customer account
 * @route PATCH /api/customers/:id/status
 */
export const toggleCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Active' or 'Disabled'

    let customer = null;
    let newStatus = status;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const u = await User.findById(id);
      if (u) {
        newStatus = status || (u.status === 'Active' ? 'Disabled' : 'Active');
        u.status = newStatus;
        if (!u.activityLog) u.activityLog = [];
        u.activityLog.unshift({
          action: `Account ${newStatus}`,
          details: `Account status updated to ${newStatus} by admin`,
          timestamp: new Date()
        });
        await u.save();
        customer = {
          id: u._id.toString(),
          name: u.name,
          email: u.email || `${u.phone}@aonekirana.np`,
          phone: u.phone,
          address: u.address,
          status: u.status,
          activityLog: u.activityLog
        };
      }
    }

    const customerIndex = memoryCustomers.findIndex(c => c.id === id);
    if (customerIndex !== -1) {
      const memCust = memoryCustomers[customerIndex];
      newStatus = status || (memCust.status === 'Active' ? 'Disabled' : 'Active');
      memCust.status = newStatus;
      customer = memCust;
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { password, ...safe } = customer;

    res.json({
      success: true,
      message: `Customer account is now ${newStatus}`,
      data: safe
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create or sync customer from checkout / admin
 * @route POST /api/customers
 */
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, landmark, status = 'Active', password = 'password123' } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    const cleanPhone = phone.toString().replace(/[^0-9]/g, '').slice(-10);
    const userAddress = address && address.trim() ? address.trim() : 'Ward 5, Tikathali Chowk, Lalitpur';

    let user = null;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      user = await User.findOne({ phone: cleanPhone });
      if (user) {
        user.name = name.trim();
        if (address) user.address = userAddress;
        if (email) user.email = email.trim();
        if (status) user.status = status;
        await user.save();
      } else {
        user = await User.create({
          name: name.trim(),
          phone: cleanPhone,
          email: email ? email.trim().toLowerCase() : `${cleanPhone}@aonekirana.np`,
          password,
          address: userAddress,
          addresses: [
            { label: 'Home', address: userAddress, landmark: landmark || '', isDefault: true }
          ],
          role: 'customer',
          status: status || 'Active',
          totalOrders: 0,
          totalSpent: 0,
          activityLog: [
            { action: 'Registered', details: 'Customer details saved from app or admin table', timestamp: new Date() }
          ]
        });
      }
    }

    const customerObj = {
      id: user ? user._id.toString() : `cust-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      phone: cleanPhone,
      email: email || `${cleanPhone}@aonekirana.np`,
      address: userAddress,
      addresses: [{ label: 'Home', address: userAddress, landmark: landmark || '', isDefault: true }],
      totalOrders: user ? user.totalOrders || 0 : 0,
      totalSpent: user ? user.totalSpent || 0 : 0,
      status: (user && user.status) || status || 'Active',
      createdAt: user ? user.createdAt.toISOString() : new Date().toISOString(),
      reviews: [],
      activityLog: [{ action: 'Registered', details: 'Registered on storefront or admin console', timestamp: new Date().toISOString() }]
    };

    const existingIdx = memoryCustomers.findIndex(c => c.phone === cleanPhone);
    if (existingIdx !== -1) {
      memoryCustomers[existingIdx] = customerObj;
    } else {
      memoryCustomers.unshift(customerObj);
    }

    res.status(201).json({ success: true, data: customerObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
