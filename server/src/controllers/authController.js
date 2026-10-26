import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { memoryCustomers } from './customerController.js';

// Helper to generate JWT token
const generateToken = (id, role, rememberMe = false) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'aone_kirana_super_secret_jwt_key_2026',
    { expiresIn: rememberMe ? '30d' : '7d' }
  );
};

// Helper to sanitize Nepali mobile number (10 digits)
const sanitizePhone = (phone) => {
  if (!phone) return '';
  return phone.toString().replace(/[^0-9]/g, '').slice(-10);
};

/**
 * @desc    Customer Registration by Name & Phone
 * @route   POST /api/auth/customer/register
 * @access  Public
 */
export const customerRegister = async (req, res) => {
  try {
    const { name, phone, password, address, email } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required to create an account.'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters.'
      });
    }

    const cleanPhone = sanitizePhone(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number (e.g. 98XXXXXXXX).'
      });
    }

    const userAddress = address && address.trim() ? address.trim() : 'Ward 5, Tikathali Chowk, Lalitpur';

    // 2. Check if user already exists
    const isMongoConnected = mongoose.connection.readyState === 1;
    let existingUser = null;

    if (isMongoConnected) {
      existingUser = await User.findOne({ phone: cleanPhone });
    } else {
      existingUser = memoryCustomers.find(c => sanitizePhone(c.phone) === cleanPhone);
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `An account with phone number ${cleanPhone} already exists. Please sign in instead.`
      });
    }

    // 3. Create Customer
    const customerData = {
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : `${cleanPhone}@aonekirana.np`,
      password: password || '123456',
      address: userAddress,
      addresses: [
        {
          label: 'Home',
          address: userAddress,
          landmark: '',
          isDefault: true
        }
      ],
      role: 'customer',
      status: 'Active',
      totalOrders: 0,
      totalSpent: 0,
      activityLog: [
        {
          action: 'Registered',
          details: 'Account created with Name and Phone number',
          timestamp: new Date()
        }
      ]
    };

    let savedUser;
    if (isMongoConnected) {
      const created = await User.create(customerData);
      savedUser = {
        id: created._id.toString(),
        name: created.name,
        phone: created.phone,
        email: created.email,
        address: created.address,
        role: created.role
      };
      memoryCustomers.unshift({
        id: savedUser.id,
        name: savedUser.name,
        phone: savedUser.phone,
        email: savedUser.email,
        address: savedUser.address,
        addresses: customerData.addresses,
        totalOrders: 0,
        totalSpent: 0,
        status: 'Active',
        createdAt: new Date().toISOString(),
        reviews: [],
        activityLog: customerData.activityLog
      });
    } else {
      const newId = `cust-${Date.now().toString().slice(-6)}`;
      savedUser = {
        id: newId,
        ...customerData,
        createdAt: new Date().toISOString()
      };
      memoryCustomers.unshift(savedUser);
    }

    // 4. Generate Token
    const token = generateToken(savedUser.id, 'customer', true);

    return res.status(201).json({
      success: true,
      message: `Welcome to Aone Kirana, ${savedUser.name}! Your account has been registered.`,
      token,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        phone: savedUser.phone,
        address: savedUser.address,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('Customer Register Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while registering customer.'
    });
  }
};

/**
 * @desc    Customer Login by Phone (or Email)
 * @route   POST /api/auth/customer/login
 * @access  Public
 */
export const customerLogin = async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered mobile number.'
      });
    }

    const cleanPhone = phone ? sanitizePhone(phone) : null;
    const isMongoConnected = mongoose.connection.readyState === 1;
    let user = null;

    if (isMongoConnected) {
      if (cleanPhone) {
        user = await User.findOne({ phone: cleanPhone });
      }
      if (!user && email) {
        user = await User.findOne({ email: email.trim().toLowerCase() });
      }
    } else {
      if (cleanPhone) {
        user = memoryCustomers.find(c => sanitizePhone(c.phone) === cleanPhone);
      }
      if (!user && email) {
        user = memoryCustomers.find(c => c.email && c.email.toLowerCase() === email.trim().toLowerCase());
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No account found with number ${cleanPhone || email}. Please register with your name and number.`
      });
    }

    // If password provided and user has matchPassword method, verify it
    if (password && user.matchPassword) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please verify your details.'
        });
      }
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = generateToken(userId, 'customer', true);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: userId,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role || 'customer'
      }
    });
  } catch (error) {
    console.error('Customer Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during customer login.'
    });
  }
};

/**
 * @desc    Get Current Customer Profile
 * @route   GET /api/auth/customer/me
 * @access  Private (Customer)
 */
export const getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const isMongoConnected = mongoose.connection.readyState === 1;
    let user = null;

    if (isMongoConnected) {
      user = await User.findById(userId).select('-password');
    } else {
      user = memoryCustomers.find(c => c.id === userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer profile not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        addresses: user.addresses || [],
        role: user.role || 'customer',
        totalOrders: user.totalOrders || 0,
        totalSpent: user.totalSpent || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update Customer Profile
 * @route   PUT /api/auth/customer/profile
 * @access  Private (Customer)
 */
export const updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;
    const isMongoConnected = mongoose.connection.readyState === 1;

    let updatedUser = null;
    if (isMongoConnected) {
      const updates = {};
      if (name) updates.name = name.trim();
      if (phone) updates.phone = sanitizePhone(phone);
      if (address) updates.address = address.trim();

      updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    } else {
      const user = memoryCustomers.find(c => c.id === userId);
      if (user) {
        if (name) user.name = name.trim();
        if (phone) user.phone = sanitizePhone(phone);
        if (address) user.address = address.trim();
        updatedUser = user;
      }
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id ? updatedUser._id.toString() : updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role || 'customer'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin Login
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // 1. Input Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Find User by Email
    let user = await User.findOne({ email: normalizedEmail });

    // Auto-seed default admin if database is empty and credentials match default
    if (!user && normalizedEmail === 'admin@aonekirana.com' && password === 'admin123') {
      user = await User.create({
        name: 'Aone Kirana Admin',
        email: 'admin@aonekirana.com',
        password: 'admin123',
        phone: '9841234567',
        address: 'Ward 5, Tikathali Hub, Lalitpur',
        role: 'admin'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    // 3. Admin Role Verification
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: This account does not possess administrator privileges.'
      });
    }

    // 4. Password Verification using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    // 5. Generate Signed JWT
    const token = generateToken(user._id, user.role, rememberMe);

    // 6. Return Secure Response (Exclude sensitive password fields)
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      },
      message: 'Admin authentication successful.'
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * @desc    Get Current Admin Profile
 * @route   GET /api/auth/admin/me
 * @access  Private (Admin Only)
 */
export const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator profile not found.' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
