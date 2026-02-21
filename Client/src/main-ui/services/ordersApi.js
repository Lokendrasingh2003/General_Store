const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const placeOrder = async (payload) => {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to place order');
  }

  const data = await res.json();
  return data?.data ?? data;
};

export const getOrders = async () => {
  const res = await fetch(`${API_BASE}/api/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  const data = await res.json();
  return data?.data ?? data ?? [];
};

export const getOrderById = async (orderId) => {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderId)}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  const data = await res.json();
  return data?.data ?? data;
};

export const cancelOrder = async (orderId, reason = 'Cancelled by user') => {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    throw new Error('Failed to cancel order');
  }

  const data = await res.json();
  return data?.data ?? data;
};
