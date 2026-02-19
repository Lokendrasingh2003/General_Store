const express = require('express');
const {
  getAllProducts,
  getProductById,
  getCategories,
  searchProducts,
  getProductsByCategory,
  getProductsByShop
} = require('../controllers/productController');

const router = express.Router();

/**
 * @route   GET /api/products/categories
 * @desc    Get all available product categories with stats (count, price range, etc)
 * @access  Public
 * @example
 * GET /api/products/categories
 * Response: [{ name: 'electronics', count: 45, minPrice: 5000, maxPrice: 500000, avgPrice: 85000 }]
 */
router.get('/categories', getCategories);

/**
 * @route   GET /api/products/search
 * @desc    Search products with advanced filters
 * @access  Public
 * @query   {String} q - Search query (required)
 * @query   {String} category - Filter by category
 * @query   {Number} minPrice - Minimum price
 * @query   {Number} maxPrice - Maximum price
 * @query   {Number} page - Page number
 * @query   {Number} limit - Items per page
 * @example
 * GET /api/products/search?q=laptop&category=electronics&minPrice=50000
 */
router.get('/search', searchProducts);

/**
 * @route   GET /api/products/category/:category
 * @desc    Get products by specific category with pagination and sorting
 * @access  Public
 * @param   {String} category - Category name
 * @query   {Number} page - Page number (default: 1)
 * @query   {Number} limit - Items per page (default: 20, max: 100)
 * @query   {String} sortBy - Sort field (name, price, rating, createdAt)
 * @query   {Number} sortOrder - 1 for ascending, -1 for descending
 * @example
 * GET /api/products/category/electronics?page=1&limit=20&sortBy=price&sortOrder=1
 */
router.get('/category/:category', getProductsByCategory);

/**
 * @route   GET /api/products/shop/:shopId
 * @desc    Get all products from a specific shop
 * @access  Public
 * @param   {String} shopId - Shop MongoDB ObjectId
 * @query   {Number} page - Page number (default: 1)
 * @query   {Number} limit - Items per page (default: 20, max: 100)
 * @query   {String} sortBy - Sort field (name, price, rating, createdAt)
 * @query   {Number} sortOrder - 1 for ascending, -1 for descending
 * @example
 * GET /api/products/shop/60d5ec49c1234567890abcde?page=1&limit=20
 */
router.get('/shop/:shopId', getProductsByShop);

/**
 * @route   GET /api/products
 * @desc    Get all available products with pagination, search, filtering, and sorting
 * @access  Public
 * @query   {Number} page - Page number (default: 1)
 * @query   {Number} limit - Items per page (default: 20, max: 100)
 * @query   {String} search - Search term (name or description)
 * @query   {String} category - Filter by category
 * @query   {Number} minPrice - Minimum price filter
 * @query   {Number} maxPrice - Maximum price filter
 * @query   {String} sortBy - Sort field (name, price, rating, createdAt)
 * @query   {Number} sortOrder - 1 for ascending, -1 for descending (default: -1)
 * @example
 * GET /api/products?page=1&limit=20&search=laptop&category=electronics&minPrice=50000&maxPrice=100000
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product details by ID
 * @access  Public
 * @param   {String} id - Product MongoDB ObjectId
 * @example
 * GET /api/products/60d5ec49c1234567890abcde
 */
router.get('/:id', getProductById);

module.exports = router;
