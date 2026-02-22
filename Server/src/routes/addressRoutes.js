const express = require('express');
const {
  saveAddress,
  getAddresses,
  getCustomerAddresses,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');

const router = express.Router();

// More specific routes first
router.post('/', saveAddress);
router.get('/customer', getCustomerAddresses);
router.get('/', getAddresses);
router.put('/:addressId', updateAddress);
router.delete('/:addressId', deleteAddress);

module.exports = router;
