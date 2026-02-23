const { addresses } = require('../data/addresses');

const saveAddress = (req, res) => {
  try {
    const { label, name, phone, line1, city, state, pincode, isDefault } = req.body;

    if (!label || !name || !phone || !line1 || !city || !state || !pincode) {
      return res.status(400).json({ error: 'All address fields are required' });
    }

    if (!/^\d{10}$/.test(String(phone).trim())) {
      return res.status(400).json({ error: 'Phone must be 10 digits' });
    }

    if (!/^\d{6}$/.test(String(pincode).trim())) {
      return res.status(400).json({ error: 'Pincode must be 6 digits' });
    }

    if (isDefault) {
      addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      id: `addr-${Date.now()}`,
      label,
      name,
      phone,
      line1,
      city,
      state,
      pincode,
      isDefault: isDefault || false,
      createdAt: new Date().toISOString(),
    };

    addresses.push(newAddress);

    res.status(201).json({
      success: true,
      data: newAddress,
      message: 'Address saved successfully',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAddresses = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAddress = (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, name, phone, line1, city, state, pincode, isDefault } = req.body;

    const address = addresses.find((a) => a.id === addressId);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (label) address.label = label;
    if (name) address.name = name;
    if (phone) address.phone = phone;
    if (line1) address.line1 = line1;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;

    if (isDefault) {
      addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    address.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      data: address,
      message: 'Address updated successfully',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAddress = (req, res) => {
  try {
    const { addressId } = req.params;
    const index = addresses.findIndex((a) => a.id === addressId);

    if (index === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const deleted = addresses.splice(index, 1)[0];

    res.status(200).json({
      success: true,
      data: deleted,
      message: 'Address deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  saveAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};
