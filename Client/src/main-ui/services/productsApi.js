const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const getCategories = async () => {
  const res = await fetch(`${API_BASE}/api/products/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return data?.data ?? data ?? [];
};

export const getProducts = async (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/products${search ? `?${search}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data?.data ?? data ?? [];
};

export const getProductSuggestions = async (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/products/suggestions${search ? `?${search}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch suggestions');
  const data = await res.json();
  return data?.data ?? data ?? [];
};

export const getProductsByCategory = async (category) => {
  const res = await fetch(`${API_BASE}/api/products/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data?.data ?? data ?? [];
};

export const getProductById = async (id) => {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  const data = await res.json();
  return data?.data ?? data;
};
