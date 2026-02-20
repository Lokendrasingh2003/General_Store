import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MainHeader from '../components/Header/MainHeader';
import { DEMO_CATEGORY_PRODUCTS } from '../data/demoProducts';
import SmartBasketCard from '../components/Home/SmartBasketCard';
import { getProducts, getProductsByCategory } from '../services/productsApi';

const CategoryPage = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const normalizedCategory = (category || '').toLowerCase();
  const searchQuery = (searchParams.get('search') || '').trim();
  const isSearchMode = searchQuery.length > 0;
  const [products, setProducts] = useState(DEMO_CATEGORY_PRODUCTS[normalizedCategory] || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const apiProducts = isSearchMode
          ? await getProducts({
              search: searchQuery,
              ...(normalizedCategory !== 'all' ? { category: normalizedCategory } : {}),
            })
          : await getProductsByCategory(normalizedCategory);

        const fallbackProducts = normalizedCategory === 'all'
          ? []
          : (DEMO_CATEGORY_PRODUCTS[normalizedCategory] || []);

        if (!cancelled) {
          setProducts(
            Array.isArray(apiProducts) && apiProducts.length > 0
              ? apiProducts
              : fallbackProducts,
          );
        }
      } catch {
        if (!cancelled) {
          setProducts(normalizedCategory === 'all' ? [] : (DEMO_CATEGORY_PRODUCTS[normalizedCategory] || []));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [isSearchMode, normalizedCategory, searchQuery]);

  const title = isSearchMode
    ? `Search results for "${searchQuery}"`
    : normalizedCategory
      ? `${normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)}`
      : 'Category';

  return (
    <div className="min-h-screen bg-stone-50">
      <MainHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/" className="text-sm text-stone-500 hover:text-stone-900">← Home</Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-stone-900">{title}</h1>
        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-xl bg-stone-200" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div key={normalizedCategory} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
            {products.map((p, index) => (
              <SmartBasketCard key={`${normalizedCategory}-${p._id}-${index}`} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-stone-500">
            {isSearchMode ? 'No products found for this search.' : 'No products in this category.'}
          </p>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
