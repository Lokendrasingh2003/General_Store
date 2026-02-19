const express = require('express');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validation');
const Joi = require('joi');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} = require('../controllers/cartController');

const router = express.Router();

/**
 * Validation schemas
 */
const addToCartSchema = Joi.object({
  productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  quantity: Joi.number().integer().min(1).required()
}).required();

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
}).required();

/**
 * Middleware: Verify user is authenticated for all cart routes
 */
router.use(verifyToken);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private - Authenticated users only
 * @headers {String} Authorization - Bearer token
 */
router.get('/', getCart);

/**
 * @route   GET /api/cart/summary
 * @desc    Get cart summary (item count, total)
 * @access  Private - Authenticated users only
 * @headers {String} Authorization - Bearer token
 */
router.get('/summary', getCartSummary);

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Private - Authenticated users only
 * @headers {String} Authorization - Bearer token
 * @body    {String} productId - Product MongoDB ID (required)
 * @body    {Number} quantity - Quantity to add (required, minimum 1)
 * @example
 * {
 *   "productId": "60d5ec49c1234567890abcde",
 *   "quantity": 2
 * }
 */
router.post('/', validate(addToCartSchema), addToCart);

/**
 * @route   PUT /api/cart/:itemId
 * @desc    Update cart item quantity
 * @access  Private - Authenticated users only
 * @headers {String} Authorization - Bearer token
 * @param   {String} itemId - Cart item ID
 * @body    {Number} quantity - New quantity (required, minimum 1)
 * @example
 * {
 *   "quantity": 5
 * }
 */
router.put('/:itemId', validate(updateCartItemSchema), updateCartItem);

/**
 * @route   DELETE /api/cart/:itemId
 * @desc    Remove item from cart
 * @access  Private - Authenticated users only
 * @headers {String} Authorization - Bearer token
 * @param   {String} itemId - Cart item ID to remove
 */
router.delete('/:itemId', removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private - Authenticated users only
 * @headers {String} Authorization - Bearer token
 */
router.delete('/', clearCart);

module.exports = router;
