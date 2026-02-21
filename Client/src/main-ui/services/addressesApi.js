const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const saveAddress = async (payload) => {
  const res = await fetch(`${API_BASE}/api/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save address');
  const data = await res.json();
  return data?.data ?? data;
};

export const getAddresses = async () => {
  const res = await fetch(`${API_BASE}/api/addresses`);
  if (!res.ok) throw new Error('Failed to fetch addresses');
  const data = await res.json();
  return data?.data ?? data ?? [];
};

export const updateAddress = async (addressId, payload) => {
  const res = await fetch(`${API_BASE}/api/addresses/${encodeURIComponent(addressId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update address');
  const data = await res.json();
  return data?.data ?? data;
};

export const deleteAddress = async (addressId) => {
  const res = await fetch(`${API_BASE}/api/addresses/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete address');
  const data = await res.json();
  return data?.data ?? data;
};
