const { orders } = require('../data/orders');

const createOrder = (req, res) => {
  const { items = [], address, paymentMethod, userId } = req.body || {};

  console.log('📦 Creating order with userId:', userId);

  if (!userId) {
    console.log('❌ No userId provided');
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Order must contain at least one item',
    });
  }

  if (!address || !address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
    return res.status(400).json({
      success: false,
      message: 'Delivery address is required',
    });
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const originalSubtotal = items.reduce(
    (sum, item) => sum + Number(item.originalPrice ?? item.price ?? 0) * Number(item.quantity || 0),
    0,
  );

  const savings = Math.max(0, originalSubtotal - subtotal);
  const deliveryFee = subtotal < 499 ? 40 : 0;
  const grandTotal = subtotal + deliveryFee;

  const orderId = `ORD-${Date.now()}`;

  const order = {
    id: orderId,
    userId: userId,
    createdAt: new Date().toISOString(),
    status: 'pending',
    paymentMethod: paymentMethod || 'cod',
    address,
    items,
    pricing: {
      subtotal,
      originalSubtotal,
      savings,
      deliveryFee,
      grandTotal,
    },
  };

  orders.unshift(order);
  console.log('✅ Order created:', orderId, 'Total orders in system:', orders.length);

  return res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
};

const getOrders = (_req, res) => {
  res.json({
    success: true,
    data: orders,
  });
};

const getCustomerOrders = (req, res) => {
  const userId = req.user?.id || req.query.userId;
  
  console.log('🔍 Fetching orders for userId:', userId);
  console.log('📊 Total orders in system:', orders.length);
  
  if (!userId) {
    console.log('❌ No userId provided');
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }
  
  const customerOrders = orders.filter((order) => order.userId === userId);
  console.log('✅ Found', customerOrders.length, 'orders for this user');
  console.log('🔗 All order userIds in system:', orders.map(o => o.userId));
  
  res.json({
    success: true,
    data: customerOrders,
  });
};

const getOrderById = (req, res) => {
  const order = orders.find((item) => item.id === req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  return res.json({
    success: true,
    data: order,
  });
};

const cancelOrder = (req, res) => {
  const order = orders.find((item) => item.id === req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  const normalizedStatus = String(order.status || '').toLowerCase();
  if (normalizedStatus === 'cancelled' || normalizedStatus === 'delivered') {
    return res.status(400).json({
      success: false,
      message: `Order cannot be cancelled in ${normalizedStatus} state`,
    });
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date().toISOString();
  order.cancelReason = req.body?.reason || 'Cancelled by user';

  return res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
};

module.exports = {
  createOrder,
  getOrders,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
};
