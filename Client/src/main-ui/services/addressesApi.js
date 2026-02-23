const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const saveAddress = async (payload) => {
  const userId = localStorage.getItem('userId');
  const res = await fetch(`${API_BASE}/api/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, userId }),
  });
  if (!res.ok) throw new Error('Failed to save address');
  const data = await res.json();
  return data?.data ?? data;
};

export const getAddresses = async () => {
  const userId = localStorage.getItem('userId');
  const res = await fetch(`${API_BASE}/api/addresses/customer?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to fetch addresses');
  const data = await res.json();
  return data?.data ?? data ?? [];
};

export const updateAddress = async (addressId, payload) => {
  const userId = localStorage.getItem('userId');
  const res = await fetch(`${API_BASE}/api/addresses/${encodeURIComponent(addressId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, userId }),
  });
  if (!res.ok) throw new Error('Failed to update address');
  const data = await res.json();
  return data?.data ?? data;
};

export const deleteAddress = async (addressId) => {
  const userId = localStorage.getItem('userId');
  const res = await fetch(`${API_BASE}/api/addresses/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to delete address');
  const data = await res.json();
  return data?.data ?? data;
};
