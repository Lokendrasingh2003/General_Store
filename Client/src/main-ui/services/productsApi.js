const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const requestJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

const normalizeProducts = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export const CATEGORY_ORDER = ['kitchen', 'snacks', 'beauty', 'bakery', 'household'];

export const fetchProductsByCategory = async (category) => {
  const normalizedCategory = String(category || '').toLowerCase().trim();

  if (!normalizedCategory) {
    return [];
  }

  try {
    const payload = await requestJson(`${API_BASE_URL}/api/products/category/${normalizedCategory}`);
    return normalizeProducts(payload);
  } catch (error) {
    const fallbackPayload = await requestJson(`${API_BASE_URL}/api/products?category=${encodeURIComponent(normalizedCategory)}`);
    return normalizeProducts(fallbackPayload);
  }
};

export const fetchHomeCategoryProducts = async (limitPerCategory = 8) => {
  const entries = await Promise.all(
    CATEGORY_ORDER.map(async (category) => {
      const products = await fetchProductsByCategory(category);
      return [category, products.slice(0, limitPerCategory)];
    })
  );

  return Object.fromEntries(entries);
};
