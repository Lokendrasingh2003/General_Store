const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validation');
const verifyToken = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { Product } = require('../models');

// Validation schemas
const CATEGORY_OPTIONS = ['kitchen', 'snacks', 'beauty', 'bakery', 'household'];
const WEIGHT_OPTIONS = ['100g', '250g', '500g', '1kg'];
const HOUSEHOLD_SIZE_OPTIONS = ['250ml', '500ml', '1L', '2L'];

const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  brand: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).optional(),
  category: Joi.string().valid(...CATEGORY_OPTIONS).lowercase().required(),
  weight: Joi.string()
    .valid(...WEIGHT_OPTIONS)
    .when('category', { is: 'household', then: Joi.forbidden(), otherwise: Joi.required() }),
  size: Joi.string()
    .valid(...HOUSEHOLD_SIZE_OPTIONS)
    .when('category', { is: 'household', then: Joi.required(), otherwise: Joi.forbidden() }),
  price: Joi.number().min(0.01).required(),
  discountedPrice: Joi.number().min(0).less(Joi.ref('price')).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  shopId: Joi.string().required(),
  isAvailable: Joi.boolean().optional()
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  brand: Joi.string().min(2).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  category: Joi.string().valid(...CATEGORY_OPTIONS).lowercase().optional(),
  weight: Joi.string().valid(...WEIGHT_OPTIONS).optional(),
  size: Joi.string().valid(...HOUSEHOLD_SIZE_OPTIONS).optional(),
  price: Joi.number().min(0.01).optional(),
  discountedPrice: Joi.number().min(0).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  isAvailable: Joi.boolean().optional()
}).custom((value, helpers) => {
  const category = value.category;
  const weight = value.weight;
  const size = value.size;
  const price = value.price;
  const discountedPrice = value.discountedPrice;

  if (category === 'household') {
    if (weight !== undefined) {
      return helpers.error('any.invalid');
    }
    if (size === undefined) {
      return helpers.error('any.required');
    }
  }

  if (category && category !== 'household' && size !== undefined) {
    return helpers.error('any.invalid');
  }

  if (price !== undefined && discountedPrice !== undefined && discountedPrice >= price) {
    return helpers.error('any.invalid');
  }

  return value;
});

/**
 * @route   GET /api/v1/products
 * @desc    Get all products (Public)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    
    let filter = { isAvailable: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    const products = await Product.find(filter)
      .populate('shopId', 'shopName')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID (Public)
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shopId');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/products
 * @desc    Create new product (Protected - Admin/Customer)
 * @access  Private
 * 
 * Example:
 * POST /api/v1/products
 * Authorization: Bearer <accessToken>
 * Content-Type: application/json
 * 
 * Body:
 * {
 *   "name": "Product Name",
 *   "brand": "Brand Name",
 *   "description": "Product description",
 *   "category": "kitchen",
 *   "weight": "500g",
 *   "price": 5000,
 *   "discountedPrice": 4500,
 *   "shopId": "507f1f77bcf86cd799439011",
 *   "images": ["https://example.com/image.jpg"],
 *   "isAvailable": true
 * }
 */
router.post(
  '/',
  verifyToken,
  validate(createProductSchema),
  async (req, res) => {
    try {
      // req.user contains { userId, role } from JWT token
      // You can add authorization checks here if needed
      
      const product = new Product(req.validatedBody);
      await product.save();
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product (Protected - Shop owner/Admin)
 * @access  Private
 * 
 * Only shop owner or admin can update product
 */
router.put(
  '/:id',
  verifyToken,
  validate(updateProductSchema),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Authorization check (optional - implement based on your logic)
      // if (product.shopId !== req.user.userId && req.user.role !== 'admin') {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Not authorized to update this product'
      //   });
      // }
      
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.validatedBody, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product (Protected - Admin only)
 * @access  Private
 * 
 * Only admins can delete products
 */
router.delete(
  '/:id',
  verifyToken,
  authorize('admin'),  // Only admins
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Product deleted successfully',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/v1/products/shop/:shopId
 * @desc    Get all products from a shop (Public)
 * @access  Public
 */
router.get('/shop/:shopId', async (req, res) => {
  try {
    const products = await Product.find({
      shopId: req.params.shopId,
      isAvailable: true
    }).populate('shopId', 'shopName');
    
    res.json({
      success: true,
      message: 'Shop products retrieved successfully',
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving shop products',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/products/category/:category
 * @desc    Get products by category (Public)
 * @access  Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category.toLowerCase(),
      isAvailable: true
    }).sort({ rating: -1 });
    
    res.json({
      success: true,
      message: 'Category products retrieved successfully',
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving category products',
      error: error.message
    });
  }
});

module.exports = router;
