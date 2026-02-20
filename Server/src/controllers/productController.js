const { products, categories } = require('../data/products');

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getCategories = (_req, res) => {
  res.json({ success: true, data: categories });
};

const getProducts = (req, res) => {
  const { category, search = '', limit } = req.query;

  let filteredProducts = [...products];

  if (category) {
    const normalizedCategory = normalizeText(category);
    filteredProducts = filteredProducts.filter(
      (product) => normalizeText(product.category) === normalizedCategory,
    );
  }

  if (search) {
    const normalizedSearch = normalizeText(search);
    filteredProducts = filteredProducts.filter((product) => {
      const haystack = [product.name, product.brand, product.category]
        .map((field) => normalizeText(field))
        .join(' ');
      return haystack.includes(normalizedSearch);
    });
  }

  if (limit) {
    const parsedLimit = Number(limit);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      filteredProducts = filteredProducts.slice(0, parsedLimit);
    }
  }

  res.json({ success: true, data: filteredProducts });
};

const getProductsByCategory = (req, res) => {
  const category = normalizeText(req.params.category);
  const categoryProducts = products.filter((product) => normalizeText(product.category) === category);
  res.json({ success: true, data: categoryProducts });
};

const getProductSuggestions = (req, res) => {
  const { search = '', limit = 6 } = req.query;
  const normalizedSearch = normalizeText(search);

  if (!normalizedSearch) {
    return res.json({ success: true, data: [] });
  }

  const parsedLimit = Number(limit);
  const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 6;

  const suggestionProducts = products
    .filter((product) => {
      const haystack = [product.name, product.brand, product.category]
        .map((field) => normalizeText(field))
        .join(' ');
      return haystack.includes(normalizedSearch);
    })
    .slice(0, safeLimit)
    .map((product) => ({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      image: product.image,
      images: product.images,
      price: product.price,
      discountedPrice: product.discountedPrice,
    }));

  return res.json({ success: true, data: suggestionProducts });
};

const getProductById = (req, res) => {
  const product = products.find((item) => item._id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  return res.json({ success: true, data: product });
};

module.exports = {
  getCategories,
  getProducts,
  getProductsByCategory,
  getProductSuggestions,
  getProductById,
};
