import { Product } from '../models/Product.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to seed catalog into MongoDB if empty
const seedProductsIfEmpty = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const jsonPath = path.join(__dirname, '../data/categoryProducts.json');
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map((item, idx) => ({
            customId: item.id || `prod-${Date.now()}-${idx}`,
            name: item.name,
            unit: item.unit || '1 kg',
            price: Number(item.price),
            originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
            discountPercentage: item.discountPercentage ? Number(item.discountPercentage) : 0,
            category: item.category || 'General',
            subCategory: item.subCategory || '',
            image: item.image,
            rating: item.rating ? Number(item.rating) : 4.8,
            reviewsCount: item.reviewsCount ? Number(item.reviewsCount) : 0,
            inStock: item.inStock !== false,
            isFeatured: Boolean(item.isFeatured),
            description: item.description || '',
            packSizes: item.packSizes || []
          }));
          await Product.insertMany(formatted);
          console.log(`Seeded ${formatted.length} catalog products into MongoDB!`);
        }
      }
    }
  } catch (err) {
    console.warn('Auto-seed products error:', err.message);
  }
};

// Map mongoose doc to frontend-compatible Product object
const formatProduct = (doc) => ({
  id: doc.customId || doc._id.toString(),
  name: doc.name,
  unit: doc.unit,
  price: doc.price,
  originalPrice: doc.originalPrice,
  discountPercentage: doc.discountPercentage || 0,
  category: doc.category,
  subCategory: doc.subCategory || '',
  image: doc.image,
  rating: doc.rating || 4.8,
  reviewsCount: doc.reviewsCount || 0,
  inStock: doc.inStock !== false,
  isFeatured: doc.isFeatured || false,
  description: doc.description || '',
  packSizes: doc.packSizes || [],
  stockQuantity: doc.stockQuantity || 50
});

/**
 * @desc Get all products with optional filters
 * @route GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await seedProductsIfEmpty();

      const { category, search, inStock } = req.query;
      let filter = {};

      if (category && category !== 'all') {
        filter.category = new RegExp(`^${category}$`, 'i');
      }

      if (inStock !== undefined) {
        filter.inStock = inStock === 'true';
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { name: regex },
          { description: regex },
          { category: regex },
          { subCategory: regex }
        ];
      }

      const docs = await Product.find(filter).sort({ createdAt: -1 });
      const products = docs.map(formatProduct);

      return res.json({
        success: true,
        count: products.length,
        data: products
      });
    }

    return res.json({ success: true, count: 0, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get single product by id
 * @route GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let doc = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await Product.findById(id);
    }
    if (!doc) {
      doc = await Product.findOne({ customId: id });
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: formatProduct(doc) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create new product in MongoDB
 * @route POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      unit,
      price,
      originalPrice,
      discountPercentage,
      category,
      subCategory,
      image,
      rating,
      reviewsCount,
      inStock,
      isFeatured,
      description,
      packSizes,
      stockQuantity
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required to create a product.'
      });
    }

    const customId = id || `prod-${Date.now()}`;

    // If a product with the same customId already exists, update it instead
    const existing = await Product.findOne({ customId });
    if (existing) {
      existing.name = name.trim();
      existing.unit = unit || existing.unit;
      existing.price = Number(price);
      if (originalPrice !== undefined) existing.originalPrice = Number(originalPrice);
      if (discountPercentage !== undefined) existing.discountPercentage = Number(discountPercentage);
      existing.category = category.trim();
      if (subCategory !== undefined) existing.subCategory = subCategory.trim();
      if (image) existing.image = image;
      if (rating !== undefined) existing.rating = Number(rating);
      if (reviewsCount !== undefined) existing.reviewsCount = Number(reviewsCount);
      if (inStock !== undefined) existing.inStock = Boolean(inStock);
      if (isFeatured !== undefined) existing.isFeatured = Boolean(isFeatured);
      if (description !== undefined) existing.description = description;
      if (packSizes !== undefined) existing.packSizes = packSizes;
      if (stockQuantity !== undefined) existing.stockQuantity = Number(stockQuantity);

      await existing.save();
      return res.json({
        success: true,
        message: 'Product updated successfully',
        data: formatProduct(existing)
      });
    }

    const newProd = await Product.create({
      customId,
      name: name.trim(),
      unit: unit || '1 kg',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
      category: category.trim(),
      subCategory: subCategory ? subCategory.trim() : '',
      image: image || '/placeholder.png',
      rating: rating ? Number(rating) : 4.8,
      reviewsCount: reviewsCount ? Number(reviewsCount) : 0,
      inStock: inStock !== false,
      isFeatured: Boolean(isFeatured),
      description: description || '',
      packSizes: Array.isArray(packSizes) ? packSizes : [],
      stockQuantity: stockQuantity ? Number(stockQuantity) : 50
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: formatProduct(newProd)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update product in MongoDB
 * @route PUT /api/products/:id or PATCH /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let doc = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await Product.findById(id);
    }
    if (!doc) {
      doc = await Product.findOne({ customId: id });
    }

    if (!doc) {
      // Upsert
      req.body.id = id;
      return createProduct(req, res);
    }

    const fields = [
      'name',
      'unit',
      'price',
      'originalPrice',
      'discountPercentage',
      'category',
      'subCategory',
      'image',
      'rating',
      'reviewsCount',
      'inStock',
      'isFeatured',
      'description',
      'packSizes',
      'stockQuantity'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        doc[f] = req.body[f];
      }
    });

    await doc.save();

    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: formatProduct(doc)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete product from MongoDB
 * @route DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Product.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Product.findOneAndDelete({ customId: id });
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found to delete' });
    }

    return res.json({
      success: true,
      message: `Product "${deleted.name}" deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
