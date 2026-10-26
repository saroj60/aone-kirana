import { Banner } from '../models/Banner.js';

// Pre-seeded initial banners with desktop & mobile support
let MEMORY_BANNERS = [
  {
    _id: 'banner-001',
    id: 'banner-001',
    title: 'Daily Groceries Delivered to Your Door',
    subtitle: 'Fresh, affordable and fast delivery across Lalitpur',
    image: '/hero_banner.jpg',
    mobileImage: '/hero_banner.jpg',
    discountText: 'UP TO 20% OFF',
    ctaText: 'Shop Now',
    ctaDestination: '/category/all',
    badgeText: 'Fresh | Affordable | Fast Delivery',
    deliveryTime: 'Delivery in 30–60 mins',
    deliveryRadius: '3 km Radius (Tikathali & Nearby)',
    qualityText: 'Quality Products Everyday',
    stampText: 'Fresh Healthy Affordable',
    bgColor: 'from-purple-50 via-purple-100/70 to-fuchsia-50/50',
    borderColor: 'border-purple-200/80',
    startDate: new Date('2025-01-01').toISOString(),
    endDate: new Date('2026-12-31').toISOString(),
    displayOrder: 1,
    status: 'active',
    clickCount: 524,
    createdAt: new Date('2025-01-01').toISOString()
  }
];

const isDbConnected = () => {
  try {
    return Banner.db && Banner.db.readyState === 1;
  } catch (e) {
    return false;
  }
};

/**
 * 1. GET ACTIVE BANNERS FOR CUSTOMER HOMEPAGE
 * Public endpoint: GET /api/banners/active
 * Returns currently active, scheduled-valid banners sorted by displayOrder
 */
export const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();

    if (isDbConnected()) {
      const activeBanners = await Banner.find({
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).sort({ displayOrder: 1, createdAt: -1 });

      if (activeBanners.length > 0) {
        return res.json({
          success: true,
          count: activeBanners.length,
          data: activeBanners
        });
      }
    }

    // In-memory fallback
    const activeBanners = MEMORY_BANNERS.filter(b => {
      if (b.status !== 'active') return false;
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return now >= start && now <= end;
    }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return res.json({
      success: true,
      count: activeBanners.length,
      data: activeBanners
    });
  } catch (error) {
    console.error('getActiveBanners error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active banners' });
  }
};

/**
 * 2. GET ALL BANNERS FOR ADMIN
 * Admin endpoint: GET /api/banners
 */
export const getAllBanners = async (req, res) => {
  try {
    const { search, status } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { subtitle: { $regex: search, $options: 'i' } },
          { discountText: { $regex: search, $options: 'i' } }
        ];
      }
      if (status && status !== 'all') {
        query.status = status;
      }

      const banners = await Banner.find(query).sort({ displayOrder: 1, createdAt: -1 });
      return res.json({ success: true, count: banners.length, data: banners });
    }

    // In-memory fallback
    let results = [...MEMORY_BANNERS];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.subtitle.toLowerCase().includes(q) ||
          b.discountText.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'all') {
      results = results.filter(b => b.status === status);
    }

    results.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('getAllBanners error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all banners' });
  }
};

/**
 * 3. GET SINGLE BANNER
 */
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const banner = await Banner.findById(id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      return res.json({ success: true, data: banner });
    }

    const banner = MEMORY_BANNERS.find(b => b._id === id || b.id === id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    res.json({ success: true, data: banner });
  } catch (error) {
    console.error('getBannerById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banner' });
  }
};

/**
 * 4. CREATE BANNER
 */
export const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      image,
      mobileImage,
      discountText,
      ctaText,
      ctaDestination,
      badgeText,
      deliveryTime,
      deliveryRadius,
      qualityText,
      stampText,
      bgColor,
      borderColor,
      startDate,
      endDate,
      displayOrder,
      status
    } = req.body;

    if (!title || !subtitle || !image || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, subtitle, desktop image, and end date'
      });
    }

    const orderNumber =
      displayOrder !== undefined && displayOrder !== null && displayOrder !== ''
        ? Number(displayOrder)
        : (MEMORY_BANNERS.length + 1);

    if (isDbConnected()) {
      const newBanner = new Banner({
        title: title.trim(),
        subtitle: subtitle.trim(),
        image: image.trim(),
        mobileImage: mobileImage ? mobileImage.trim() : image.trim(),
        discountText: discountText ? discountText.trim() : 'UP TO 20% OFF',
        ctaText: ctaText ? ctaText.trim() : 'Shop Now',
        ctaDestination: ctaDestination ? ctaDestination.trim() : '/category/all',
        badgeText: badgeText ? badgeText.trim() : 'Fresh | Affordable | Fast Delivery',
        deliveryTime: deliveryTime ? deliveryTime.trim() : 'Delivery in 30–60 mins',
        deliveryRadius: deliveryRadius ? deliveryRadius.trim() : '3 km Radius (Tikathali & Nearby)',
        qualityText: qualityText ? qualityText.trim() : 'Quality Products Everyday',
        stampText: stampText ? stampText.trim() : 'Fresh Healthy Affordable',
        bgColor: bgColor || 'from-emerald-50 via-green-50/80 to-lime-50/50',
        borderColor: borderColor || 'border-emerald-200/80',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        displayOrder: orderNumber,
        status: status || 'active',
        clickCount: 0
      });

      const saved = await newBanner.save();
      return res.status(201).json({ success: true, message: 'Banner created successfully', data: saved });
    }

    // In-memory fallback
    const createdBanner = {
      _id: `banner-${Date.now()}`,
      id: `banner-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      image: image.trim(),
      mobileImage: mobileImage ? mobileImage.trim() : image.trim(),
      discountText: discountText ? discountText.trim() : 'UP TO 20% OFF',
      ctaText: ctaText ? ctaText.trim() : 'Shop Now',
      ctaDestination: ctaDestination ? ctaDestination.trim() : '/category/all',
      badgeText: badgeText ? badgeText.trim() : 'Fresh | Affordable | Fast Delivery',
      deliveryTime: deliveryTime ? deliveryTime.trim() : 'Delivery in 30–60 mins',
      deliveryRadius: deliveryRadius ? deliveryRadius.trim() : '3 km Radius (Tikathali & Nearby)',
      qualityText: qualityText ? qualityText.trim() : 'Quality Products Everyday',
      stampText: stampText ? stampText.trim() : 'Fresh Healthy Affordable',
      bgColor: bgColor || 'from-emerald-50 via-green-50/80 to-lime-50/50',
      borderColor: borderColor || 'border-emerald-200/80',
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: new Date(endDate).toISOString(),
      displayOrder: orderNumber,
      status: status || 'active',
      clickCount: 0,
      createdAt: new Date().toISOString()
    };

    MEMORY_BANNERS.push(createdBanner);
    res.status(201).json({ success: true, message: 'Banner created successfully', data: createdBanner });
  } catch (error) {
    console.error('createBanner error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create banner' });
  }
};

/**
 * 5. UPDATE BANNER
 */
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDbConnected()) {
      const updated = await Banner.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Banner not found' });
      return res.json({ success: true, message: 'Banner updated successfully', data: updated });
    }

    const idx = MEMORY_BANNERS.findIndex(b => b._id === id || b.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Banner not found' });

    MEMORY_BANNERS[idx] = {
      ...MEMORY_BANNERS[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({ success: true, message: 'Banner updated successfully', data: MEMORY_BANNERS[idx] });
  } catch (error) {
    console.error('updateBanner error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update banner' });
  }
};

/**
 * 6. TOGGLE BANNER STATUS (active <-> inactive)
 */
export const toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const banner = await Banner.findById(id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

      banner.status = banner.status === 'active' ? 'inactive' : 'active';
      await banner.save();
      return res.json({ success: true, message: `Banner is now ${banner.status}`, data: banner });
    }

    const idx = MEMORY_BANNERS.findIndex(b => b._id === id || b.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Banner not found' });

    MEMORY_BANNERS[idx].status = MEMORY_BANNERS[idx].status === 'active' ? 'inactive' : 'active';
    res.json({
      success: true,
      message: `Banner is now ${MEMORY_BANNERS[idx].status}`,
      data: MEMORY_BANNERS[idx]
    });
  } catch (error) {
    console.error('toggleBannerStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle banner status' });
  }
};

/**
 * 7. REORDER BANNERS
 * PUT /api/banners/reorder
 * Body: { orders: [ { id: 'banner-001', displayOrder: 1 }, { id: 'banner-002', displayOrder: 2 } ] }
 */
export const reorderBanners = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: 'Expected array of orders' });
    }

    if (isDbConnected()) {
      for (const item of orders) {
        await Banner.findByIdAndUpdate(item.id, { displayOrder: Number(item.displayOrder) });
      }
      const updatedList = await Banner.find().sort({ displayOrder: 1 });
      return res.json({ success: true, message: 'Banners reordered successfully', data: updatedList });
    }

    orders.forEach(item => {
      const b = MEMORY_BANNERS.find(x => x._id === item.id || x.id === item.id);
      if (b) b.displayOrder = Number(item.displayOrder);
    });

    MEMORY_BANNERS.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    res.json({ success: true, message: 'Banners reordered successfully', data: MEMORY_BANNERS });
  } catch (error) {
    console.error('reorderBanners error:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder banners' });
  }
};

/**
 * 8. DELETE BANNER
 */
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await Banner.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Banner not found' });
      return res.json({ success: true, message: 'Banner deleted successfully' });
    }

    const idx = MEMORY_BANNERS.findIndex(b => b._id === id || b.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Banner not found' });

    MEMORY_BANNERS.splice(idx, 1);
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('deleteBanner error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete banner' });
  }
};

/**
 * 9. TRACK BANNER CLICK
 * POST /api/banners/:id/click
 */
export const recordBannerClick = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await Banner.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
      return res.json({ success: true });
    }

    const b = MEMORY_BANNERS.find(x => x._id === id || x.id === id);
    if (b) b.clickCount = (b.clickCount || 0) + 1;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
