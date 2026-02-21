const { products } = require('../data/products');
const { orders } = require('../data/orders');
const { users } = require('../data/users');

// ============ PRODUCT ADMIN ENDPOINTS ============

const adminAddProduct = (req, res) => {
  try {
    const { name, category, image, description, inStock, weights } = req.body;

    if (!name || !category || !weights || !Array.isArray(weights) || weights.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and at least one weight option are required'
      });
    }

    // Validate all weights have required fields
    const validWeights = weights.every(w => w.label && w.value && w.price);
    if (!validWeights) {
      return res.status(400).json({
        success: false,
        message: 'Each weight must have label, value, and price'
      });
    }

    // Use the first weight's price as default
    const defaultPrice = weights[0].price;
    const defaultOriginalPrice = weights[0].originalPrice || weights[0].price;

    const newProduct = {
      _id: `prod-${Date.now()}`,
      name,
      category,
      image: image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQldrIc06gBxFloOdF3BCFlM5n5ojcKQRCC8w&s',
      description: description || '',
      inStock: inStock !== false,
      brand: 'General Store',
      images: [image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQldrIc06gBxFloOdF3BCFlM5n5ojcKQRCC8w&s'],
      price: defaultPrice,
      originalPrice: defaultOriginalPrice,
      discountPercent: defaultOriginalPrice > defaultPrice ? Math.round(((defaultOriginalPrice - defaultPrice) / defaultOriginalPrice) * 100) : 0,
      weights: weights.map(w => ({
        label: w.label,
        value: w.value,
        price: parseFloat(w.price),
        originalPrice: parseFloat(w.originalPrice || w.price),
        discountPercent: parseFloat(w.originalPrice || w.price) > parseFloat(w.price)
          ? Math.round((((parseFloat(w.originalPrice || w.price)) - parseFloat(w.price)) / (parseFloat(w.originalPrice || w.price))) * 100)
          : 0
      })),
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Admin add product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add product',
      error: error.message
    });
  }
};

const adminUpdateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, image, description, inStock, weights } = req.body;

    const productIndex = products.findIndex(p => p._id === id);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[productIndex];
    
    if (name) product.name = name;
    if (category) product.category = category;
    if (image) {
      product.image = image;
      product.images = [image];
    }
    if (description !== undefined) product.description = description;
    if (inStock !== undefined) product.inStock = inStock;

    // Handle weights update
    if (weights && Array.isArray(weights) && weights.length > 0) {
      const validWeights = weights.every(w => w.label && w.value && w.price);
      if (!validWeights) {
        return res.status(400).json({
          success: false,
          message: 'Each weight must have label, value, and price'
        });
      }

      product.weights = weights.map(w => ({
        label: w.label,
        value: w.value,
        price: parseFloat(w.price),
        originalPrice: parseFloat(w.originalPrice || w.price),
        discountPercent: parseFloat(w.originalPrice || w.price) > parseFloat(w.price)
          ? Math.round((((parseFloat(w.originalPrice || w.price)) - parseFloat(w.price)) / (parseFloat(w.originalPrice || w.price))) * 100)
          : 0
      }));

      // Update default price from first weight
      product.price = parseFloat(weights[0].price);
      product.originalPrice = parseFloat(weights[0].originalPrice || weights[0].price);
      product.discountPercent = product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;
    }

    products[productIndex] = product;

    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Admin update product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

const adminDeleteProduct = (req, res) => {
  try {
    const { id } = req.params;

    const productIndex = products.findIndex(p => p._id === id);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const deletedProduct = products.splice(productIndex, 1);

    return res.json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct[0]
    });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// ============ ORDER ADMIN ENDPOINTS ============

const adminGetAllOrders = (req, res) => {
  try {
    return res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

const adminUpdateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
      });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Order status updated successfully',
      data: orders[orderIndex]
    });
  } catch (error) {
    console.error('Admin update order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// ============ USER ADMIN ENDPOINTS ============

const adminGetAllUsers = (req, res) => {
  try {
    // Return users without passwords
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt
    }));

    return res.json({
      success: true,
      data: safeUsers
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

const adminToggleUserStatus = (req, res) => {
  try {
    const { id } = req.params;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    users[userIndex].isActive = !users[userIndex].isActive;

    const safeUser = {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      phone: users[userIndex].phone,
      role: users[userIndex].role,
      isActive: users[userIndex].isActive,
      createdAt: users[userIndex].createdAt
    };

    return res.json({
      success: true,
      message: `User ${users[userIndex].isActive ? 'activated' : 'deactivated'} successfully`,
      data: safeUser
    });
  } catch (error) {
    console.error('Admin toggle user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
};

const adminPromoteToAdmin = (req, res) => {
  try {
    const { id } = req.params;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (users[userIndex].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }

    users[userIndex].role = 'admin';

    const safeUser = {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      phone: users[userIndex].phone,
      role: users[userIndex].role,
      isActive: users[userIndex].isActive,
      createdAt: users[userIndex].createdAt
    };

    return res.json({
      success: true,
      message: 'User promoted to admin successfully',
      data: safeUser
    });
  } catch (error) {
    console.error('Admin promote user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to promote user',
      error: error.message
    });
  }
};

module.exports = {
  adminAddProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminGetAllUsers,
  adminToggleUserStatus,
  adminPromoteToAdmin
};
