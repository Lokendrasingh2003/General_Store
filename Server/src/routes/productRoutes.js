const express = require('express');
const {
  getCategories,
  getProducts,
  getProductsByCategory,
  getProductSuggestions,
  getProductById,
} = require('../controllers/productController');

const router = express.Router();

router.get('/categories', getCategories);
router.get('/category/:category', getProductsByCategory);
router.get('/suggestions', getProductSuggestions);
router.get('/:id', getProductById);
router.get('/', getProducts);

module.exports = router;
