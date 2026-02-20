const express = require('express');
const {
  adminAddProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminGetAllUsers,
  adminToggleUserStatus,
  adminPromoteToAdmin
} = require('../controllers/adminController');

const router = express.Router();

// ============ PRODUCT ADMIN ROUTES ============
router.post('/products', adminAddProduct);
router.put('/products/:id', adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);

// ============ ORDER ADMIN ROUTES ============
router.get('/orders', adminGetAllOrders);
router.put('/orders/:id/status', adminUpdateOrderStatus);

// ============ USER ADMIN ROUTES ============
router.get('/users', adminGetAllUsers);
router.put('/users/:id/toggle-status', adminToggleUserStatus);
router.put('/users/:id/promote', adminPromoteToAdmin);

module.exports = router;
