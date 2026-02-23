const express = require('express');
const {
  saveAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require('../controllers/addressController');

const router = express.Router();

router.post('/', saveAddress);
router.get('/', getAddresses);
router.put('/:addressId', updateAddress);
router.delete('/:addressId', deleteAddress);

module.exports = router;
