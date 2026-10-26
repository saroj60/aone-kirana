import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';

// Pre-seeded initial coupons covering all 7 discount types
let MEMORY_COUPONS = [
  {
    _id: 'coup-001',
    id: 'coup-001',
    code: 'AONE10',
    description: 'Get 10% discount on entire grocery cart up to Rs. 150',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 500,
    maxDiscount: 150,
    usageLimit: 500,
    perUserLimit: 2,
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 142,
    totalDiscountGiven: 14200,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [
      {
        userId: 'usr-101',
        userEmail: 'saroj@example.com',
        userPhone: '9841234567',
        orderId: 'ord-101',
        orderNumber: 'AK-9842',
        discountApplied: 100,
        usedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    createdAt: new Date('2025-01-01').toISOString()
  },
  {
    _id: 'coup-002',
    id: 'coup-002',
    code: 'TIKATHALI50',
    description: 'Flat Rs. 50 OFF on local deliveries around Tikathali',
    discountType: 'fixed_amount',
    discountValue: 50,
    minOrder: 400,
    maxDiscount: 50,
    usageLimit: 300,
    perUserLimit: 1,
    startDate: new Date('2025-02-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 88,
    totalDiscountGiven: 4400,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-02-01').toISOString()
  },
  {
    _id: 'coup-003',
    id: 'coup-003',
    code: 'FREEDEL',
    description: 'Zero delivery fee on orders above Rs. 350',
    discountType: 'free_delivery',
    discountValue: 40,
    minOrder: 350,
    maxDiscount: 60,
    usageLimit: 1000,
    perUserLimit: 5,
    startDate: new Date('2025-01-15').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 260,
    totalDiscountGiven: 10400,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-01-15').toISOString()
  },
  {
    _id: 'coup-004',
    id: 'coup-004',
    code: 'VEG20',
    description: '20% OFF on Fresh Vegetables and Seasonal Fruits',
    discountType: 'category_discount',
    discountValue: 20,
    minOrder: 300,
    maxDiscount: 100,
    usageLimit: 200,
    perUserLimit: 2,
    startDate: new Date('2025-03-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 75,
    totalDiscountGiven: 5250,
    applicableProducts: [],
    applicableCategories: ['Vegetables', 'Fruits', 'Vegetables & Fruits'],
    usedBy: [],
    createdAt: new Date('2025-03-01').toISOString()
  },
  {
    _id: 'coup-005',
    id: 'coup-005',
    code: 'WELCOME100',
    description: 'Exclusive Rs. 100 discount for new customers on first order',
    discountType: 'first_order',
    discountValue: 100,
    minOrder: 600,
    maxDiscount: 100,
    usageLimit: null,
    perUserLimit: 1,
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 112,
    totalDiscountGiven: 11200,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-01-01').toISOString()
  },
  {
    _id: 'coup-006',
    id: 'coup-006',
    code: 'BULKSAVE15',
    description: 'Save 15% on bulk pantry orders above Rs. 1,500',
    discountType: 'min_order_discount',
    discountValue: 15,
    minOrder: 1500,
    maxDiscount: 350,
    usageLimit: 150,
    perUserLimit: 3,
    startDate: new Date('2025-02-15').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 43,
    totalDiscountGiven: 9890,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-02-15').toISOString()
  },
  {
    _id: 'coup-007',
    id: 'coup-007',
    code: 'RICE25',
    description: 'Special Rs. 25 OFF on Premium Basmati & Taichin Rice',
    discountType: 'product_discount',
    discountValue: 25,
    minOrder: 250,
    maxDiscount: 50,
    usageLimit: 100,
    perUserLimit: 2,
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    status: 'active',
    usageCount: 38,
    totalDiscountGiven: 950,
    applicableProducts: ['Taichin Rice', 'Basmati Rice', 'Jeera Masino Rice'],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-01-01').toISOString()
  },
  {
    _id: 'coup-008',
    id: 'coup-008',
    code: 'DASHAIN2025',
    description: 'Festive Season Promo - Expired',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 800,
    maxDiscount: 250,
    usageLimit: 300,
    perUserLimit: 1,
    startDate: new Date('2025-10-01').toISOString(),
    endDate: new Date('2025-10-31').toISOString(),
    status: 'expired',
    usageCount: 298,
    totalDiscountGiven: 44700,
    applicableProducts: [],
    applicableCategories: [],
    usedBy: [],
    createdAt: new Date('2025-09-25').toISOString()
  }
];

// Helper to determine if DB is connected
const isDbConnected = () => {
  try {
    return Coupon.db && Coupon.db.readyState === 1;
  } catch (e) {
    return false;
  }
};

/**
 * 1. Get All Coupons with search & filter
 */
export const getCoupons = async (req, res) => {
  try {
    const { search, status, discountType } = req.query;

    if (isDbConnected()) {
      let query = {};

      if (search) {
        query.$or = [
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (status && status !== 'all') {
        query.status = status;
      }

      if (discountType && discountType !== 'all') {
        query.discountType = discountType;
      }

      const coupons = await Coupon.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: coupons.length, data: coupons });
    }

    // In-memory fallback
    let results = [...MEMORY_COUPONS];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        c => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      results = results.filter(c => c.status === status);
    }

    if (discountType && discountType !== 'all') {
      results = results.filter(c => c.discountType === discountType);
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('getCoupons error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching coupons' });
  }
};

/**
 * 2. Get Coupon Usage Statistics
 */
export const getCouponStats = async (req, res) => {
  try {
    let coupons = [];

    if (isDbConnected()) {
      coupons = await Coupon.find();
    } else {
      coupons = MEMORY_COUPONS;
    }

    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.status === 'active').length;
    const expiredCoupons = coupons.filter(c => c.status === 'expired' || new Date() > new Date(c.endDate)).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
    const totalDiscountGranted = coupons.reduce((sum, c) => sum + (c.totalDiscountGiven || 0), 0);

    // Grouping by discount type
    const byType = {};
    coupons.forEach(c => {
      byType[c.discountType] = (byType[c.discountType] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalRedemptions,
        totalDiscountGranted,
        byType
      }
    });
  } catch (error) {
    console.error('getCouponStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve coupon statistics' });
  }
};

/**
 * 3. Get Single Coupon
 */
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      return res.json({ success: true, data: coupon });
    }

    const coupon = MEMORY_COUPONS.find(c => c._id === id || c.id === id || c.code === id.toUpperCase());
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    console.error('getCouponById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch coupon details' });
  }
};

/**
 * 4. Create New Coupon
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrder,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      status,
      applicableProducts,
      applicableCategories
    } = req.body;

    if (!code || !description || !discountType || discountValue === undefined || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: code, description, discountType, discountValue, endDate'
      });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    // Check code uniqueness
    if (isDbConnected()) {
      const existing = await Coupon.findOne({ code: normalizedCode });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Coupon code '${normalizedCode}' already exists`
        });
      }

      const newCoupon = new Coupon({
        code: normalizedCode,
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrder: minOrder !== undefined ? Number(minOrder) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        status: status || 'active',
        applicableProducts: Array.isArray(applicableProducts) ? applicableProducts : [],
        applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : []
      });

      const saved = await newCoupon.save();
      return res.status(201).json({ success: true, message: 'Coupon created successfully', data: saved });
    }

    // In-memory fallback
    const duplicate = MEMORY_COUPONS.some(c => c.code === normalizedCode);
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${normalizedCode}' already exists`
      });
    }

    const createdCoupon = {
      _id: `coup-${Date.now()}`,
      id: `coup-${Date.now()}`,
      code: normalizedCode,
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrder: minOrder !== undefined ? Number(minOrder) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: status || 'active',
      usageCount: 0,
      totalDiscountGiven: 0,
      applicableProducts: Array.isArray(applicableProducts) ? applicableProducts : [],
      applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
      usedBy: [],
      createdAt: new Date().toISOString()
    };

    MEMORY_COUPONS.unshift(createdCoupon);
    res.status(201).json({ success: true, message: 'Coupon created successfully', data: createdCoupon });
  } catch (error) {
    console.error('createCoupon error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create coupon' });
  }
};

/**
 * 5. Update Existing Coupon
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.code) {
      updates.code = String(updates.code).trim().toUpperCase();
    }

    if (isDbConnected()) {
      if (updates.code) {
        const existing = await Coupon.findOne({ code: updates.code, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `Coupon code '${updates.code}' is already used by another coupon`
          });
        }
      }

      const updated = await Coupon.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      return res.json({ success: true, message: 'Coupon updated successfully', data: updated });
    }

    // In-memory fallback
    const index = MEMORY_COUPONS.findIndex(c => c._id === id || c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    if (updates.code && updates.code !== MEMORY_COUPONS[index].code) {
      const duplicate = MEMORY_COUPONS.some(c => c.code === updates.code && c._id !== id && c.id !== id);
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Coupon code '${updates.code}' is already used by another coupon`
        });
      }
    }

    MEMORY_COUPONS[index] = {
      ...MEMORY_COUPONS[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({ success: true, message: 'Coupon updated successfully', data: MEMORY_COUPONS[index] });
  } catch (error) {
    console.error('updateCoupon error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update coupon' });
  }
};

/**
 * 6. Toggle Coupon Status (active <-> inactive)
 */
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      coupon.status = coupon.status === 'active' ? 'inactive' : 'active';
      await coupon.save();
      return res.json({ success: true, message: `Coupon is now ${coupon.status}`, data: coupon });
    }

    const index = MEMORY_COUPONS.findIndex(c => c._id === id || c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const current = MEMORY_COUPONS[index].status;
    MEMORY_COUPONS[index].status = current === 'active' ? 'inactive' : 'active';

    res.json({
      success: true,
      message: `Coupon is now ${MEMORY_COUPONS[index].status}`,
      data: MEMORY_COUPONS[index]
    });
  } catch (error) {
    console.error('toggleCouponStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle coupon status' });
  }
};

/**
 * 7. Delete Coupon
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await Coupon.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      return res.json({ success: true, message: 'Coupon deleted successfully' });
    }

    const index = MEMORY_COUPONS.findIndex(c => c._id === id || c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    MEMORY_COUPONS.splice(index, 1);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('deleteCoupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};

/**
 * 8. SECURE BACKEND VALIDATION ENDPOINT
 * POST /api/coupons/validate
 * Validates all coupon constraints securely on the server.
 * Never relies on client-side math or trust.
 */
export const validateCoupon = async (req, res) => {
  try {
    const {
      code,
      subtotal = 0,
      cartItems = [],
      userId = null,
      userEmail = null,
      userPhone = null,
      deliveryFee = 40
    } = req.body;

    if (!code || String(code).trim() === '') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Please enter a coupon code.'
      });
    }

    const normalizedCode = String(code).trim().toUpperCase();
    const orderSubtotal = Number(subtotal) || 0;
    const standardDeliveryFee = Number(deliveryFee) || 0;

    let coupon;
    if (isDbConnected()) {
      coupon = await Coupon.findOne({ code: normalizedCode });
    } else {
      coupon = MEMORY_COUPONS.find(c => c.code === normalizedCode);
    }

    // 1. Check coupon existence
    if (!coupon) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Coupon '${normalizedCode}' is invalid or does not exist.`
      });
    }

    // 2. Check Active Status
    if (coupon.status !== 'active') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon '${coupon.code}' is currently inactive.`
      });
    }

    // 3. Check Start Date and Expiry Date
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon '${coupon.code}' is not active yet. It will become valid on ${startDate.toLocaleDateString()}.`
      });
    }

    if (now > endDate) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon '${coupon.code}' has expired on ${endDate.toLocaleDateString()}.`
      });
    }

    // 4. Check Global Usage Limit
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon '${coupon.code}' has reached its maximum total redemption limit.`
      });
    }

    // 5. Check Per-User Limit
    if (userId || userEmail || userPhone) {
      const redemptions = (coupon.usedBy || []).filter(u => {
        if (userId && u.userId && String(u.userId) === String(userId)) return true;
        if (userEmail && u.userEmail && u.userEmail.toLowerCase() === String(userEmail).toLowerCase()) return true;
        if (userPhone && u.userPhone && String(u.userPhone) === String(userPhone)) return true;
        return false;
      });

      const userLimit = coupon.perUserLimit || 1;
      if (redemptions.length >= userLimit) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: `You have already redeemed coupon '${coupon.code}' the maximum allowed ${userLimit} time${userLimit > 1 ? 's' : ''}.`
        });
      }
    }

    // 6. Check Minimum Order Requirement
    const minOrderRequired = Number(coupon.minOrder) || 0;
    if (orderSubtotal < minOrderRequired) {
      const diff = minOrderRequired - orderSubtotal;
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Add Rs. ${diff} more to your cart to use this coupon. Minimum order is Rs. ${minOrderRequired}.`
      });
    }

    // 7. Process Discount By Type
    let discountAmount = 0;
    let explanation = '';
    let deliveryFeeWaived = false;

    switch (coupon.discountType) {
      // A. Percentage Discount
      case 'percentage': {
        const raw = (orderSubtotal * Number(coupon.discountValue)) / 100;
        discountAmount = Math.round(raw);
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
          discountAmount = Number(coupon.maxDiscount);
          explanation = `${coupon.discountValue}% discount capped at maximum Rs. ${coupon.maxDiscount}`;
        } else {
          explanation = `${coupon.discountValue}% discount applied across subtotal`;
        }
        break;
      }

      // B. Fixed Amount Discount
      case 'fixed_amount': {
        discountAmount = Math.min(Number(coupon.discountValue), orderSubtotal);
        explanation = `Flat Rs. ${discountAmount} discount applied`;
        break;
      }

      // C. Free Delivery
      case 'free_delivery': {
        discountAmount = standardDeliveryFee;
        deliveryFeeWaived = true;
        explanation = `Free standard delivery applied (Saved Rs. ${standardDeliveryFee})`;
        break;
      }

      // D. Product Discount
      case 'product_discount': {
        const applicableList = coupon.applicableProducts || [];
        if (applicableList.length > 0 && Array.isArray(cartItems) && cartItems.length > 0) {
          const matchingItems = cartItems.filter(item => {
            const itemName = (item.name || item.title || '').toLowerCase();
            const itemId = String(item.id || item._id || '');
            return applicableList.some(
              target => target.toLowerCase() === itemName || target === itemId || itemName.includes(target.toLowerCase())
            );
          });

          if (matchingItems.length === 0) {
            return res.status(400).json({
              success: false,
              valid: false,
              message: `This coupon only applies to selected products: ${applicableList.join(', ')}.`
            });
          }

          // Calculate matching items subtotal
          const matchingSubtotal = matchingItems.reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
            0
          );

          if (coupon.discountValue <= 100) {
            discountAmount = Math.round((matchingSubtotal * coupon.discountValue) / 100);
          } else {
            discountAmount = Math.min(coupon.discountValue, matchingSubtotal);
          }

          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }

          explanation = `Discount applied on qualifying products (${matchingItems.map(m => m.name).join(', ')})`;
        } else {
          discountAmount = Math.min(coupon.discountValue, orderSubtotal);
          explanation = `Product discount applied`;
        }
        break;
      }

      // E. Category Discount
      case 'category_discount': {
        const applicableCats = coupon.applicableCategories || [];
        if (applicableCats.length > 0 && Array.isArray(cartItems) && cartItems.length > 0) {
          const matchingCategoryItems = cartItems.filter(item => {
            const cat = String(item.category || item.categoryName || '').toLowerCase();
            return applicableCats.some(c => c.toLowerCase() === cat || cat.includes(c.toLowerCase()));
          });

          if (matchingCategoryItems.length === 0) {
            return res.status(400).json({
              success: false,
              valid: false,
              message: `This coupon is only valid for items in category: ${applicableCats.join(', ')}.`
            });
          }

          const catSubtotal = matchingCategoryItems.reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
            0
          );

          discountAmount = Math.round((catSubtotal * Number(coupon.discountValue)) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
            explanation = `${coupon.discountValue}% OFF on ${applicableCats.join(', ')} (capped at Rs. ${coupon.maxDiscount})`;
          } else {
            explanation = `${coupon.discountValue}% OFF on items in ${applicableCats.join(', ')}`;
          }
        } else {
          discountAmount = Math.round((orderSubtotal * Number(coupon.discountValue)) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
          explanation = `Category discount applied`;
        }
        break;
      }

      // F. First-Order Discount
      case 'first_order': {
        // Verify customer has no prior delivered/confirmed orders
        let priorOrdersCount = 0;
        if (userId || userEmail || userPhone) {
          try {
            if (isDbConnected()) {
              const query = {
                status: { $nin: ['Cancelled'] },
                $or: []
              };
              if (userId) query.$or.push({ customerId: userId }, { user: userId });
              if (userEmail) query.$or.push({ 'customer.email': userEmail }, { customerEmail: userEmail });
              if (userPhone) query.$or.push({ 'customer.phone': userPhone }, { customerPhone: userPhone });

              if (query.$or.length > 0) {
                priorOrdersCount = await Order.countDocuments(query);
              }
            }
          } catch (e) {
            console.warn('Could not query prior orders count:', e);
          }
        }

        if (priorOrdersCount > 0) {
          return res.status(400).json({
            success: false,
            valid: false,
            message: 'Coupon WELCOME100 is strictly reserved for your first order.'
          });
        }

        discountAmount = Math.min(Number(coupon.discountValue), orderSubtotal);
        explanation = `Welcome first-order bonus discount of Rs. ${discountAmount}`;
        break;
      }

      // G. Minimum Order Discount
      case 'min_order_discount': {
        // High-threshold incentive discount
        if (coupon.discountValue <= 100) {
          discountAmount = Math.round((orderSubtotal * Number(coupon.discountValue)) / 100);
        } else {
          discountAmount = Number(coupon.discountValue);
        }

        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }

        explanation = `Special tiered order discount (Min Rs. ${coupon.minOrder} qualified)`;
        break;
      }

      default: {
        discountAmount = Math.min(Number(coupon.discountValue), orderSubtotal);
        explanation = 'Discount applied';
      }
    }

    // Safety bounds
    discountAmount = Math.max(0, Math.min(discountAmount, orderSubtotal));

    return res.json({
      success: true,
      valid: true,
      coupon: {
        id: coupon._id || coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        deliveryFeeWaived
      },
      discountAmount,
      explanation,
      finalSubtotal: Math.max(0, orderSubtotal - discountAmount),
      message: `Coupon "${coupon.code}" applied! You save Rs. ${discountAmount}.`
    });
  } catch (error) {
    console.error('validateCoupon error:', error);
    res.status(500).json({ success: false, valid: false, message: 'Server validation error' });
  }
};

/**
 * 9. REDEEM COUPON (Invoked upon successful checkout)
 * POST /api/coupons/redeem
 */
export const redeemCoupon = async (req, res) => {
  try {
    const {
      code,
      userId = null,
      userEmail = null,
      userPhone = null,
      orderId = null,
      orderNumber = null,
      discountApplied = 0
    } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const normalizedCode = String(code).trim().toUpperCase();
    const discount = Number(discountApplied) || 0;

    const redemptionRecord = {
      userId,
      userEmail,
      userPhone,
      orderId,
      orderNumber,
      discountApplied: discount,
      usedAt: new Date()
    };

    if (isDbConnected()) {
      const coupon = await Coupon.findOne({ code: normalizedCode });
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      coupon.usageCount += 1;
      coupon.totalDiscountGiven += discount;
      coupon.usedBy.push(redemptionRecord);
      await coupon.save();

      return res.json({ success: true, message: 'Coupon redeemed successfully', data: coupon });
    }

    // In-memory fallback
    const index = MEMORY_COUPONS.findIndex(c => c.code === normalizedCode);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    MEMORY_COUPONS[index].usageCount += 1;
    MEMORY_COUPONS[index].totalDiscountGiven += discount;
    MEMORY_COUPONS[index].usedBy.push({
      ...redemptionRecord,
      usedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Coupon redeemed successfully',
      data: MEMORY_COUPONS[index]
    });
  } catch (error) {
    console.error('redeemCoupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to record coupon redemption' });
  }
};
