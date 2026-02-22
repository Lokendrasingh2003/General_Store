import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MainHeader from '../components/Header/MainHeader';
import SmartBasketCard from '../components/Home/SmartBasketCard';
import { DEMO_CATEGORY_PRODUCTS } from '../data/demoProducts';
import { getProductsByCategory } from '../services/productsApi';

const CATEGORY_SLUGS = ['kitchen', 'snacks', 'beauty', 'bakery', 'household'];
const CATEGORY_LABELS = {
  kitchen: 'Kitchen',
  snacks: 'Snacks',
  beauty: 'Beauty',
  bakery: 'Bakery',
  household: 'Household',
};

const CategorySection = ({ title, slug, products, scrollRefSetter, onScrollLeft, onScrollRight }) => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <Link
            to={`/category/${slug}`}
            className="text-sm font-semibold text-primary-600 transition hover:text-primary-700"
          >
            View All
          </Link>
          <div className="flex rounded-full border border-stone-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={onScrollLeft}
              className="flex h-9 w-9 items-center justify-center rounded-l-full text-stone-600 transition hover:bg-stone-100"
              aria-label="Scroll left"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              type="button"
              onClick={onScrollRight}
              className="flex h-9 w-9 items-center justify-center rounded-r-full border-l border-stone-200 text-stone-600 transition hover:bg-stone-100"
              aria-label="Scroll right"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scrollRefSetter}
        className="mt-4 flex gap-3 overflow-x-auto pb-2 scroll-smooth md:gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => (
          <SmartBasketCard key={`${slug}-${product._id}-${index}`} product={product} compact />
        ))}
      </div>
    </section>
  );
};

const HomePage = () => {
  const scrollRefs = useRef({});
  const [categoryProducts, setCategoryProducts] = useState(DEMO_CATEGORY_PRODUCTS);

  const setScrollEl = (slug) => (el) => {
    if (el) scrollRefs.current[slug] = el;
  };

  const scroll = (slug, dir) => {
    const el = scrollRefs.current[slug];
    if (!el) return;
    const step = 200;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const results = await Promise.all(
          CATEGORY_SLUGS.map(async (slug) => [slug, await getProductsByCategory(slug)]),
        );

        if (cancelled) return;

        const mapped = Object.fromEntries(
          results.map(([slug, products]) => [slug, Array.isArray(products) && products.length > 0 ? products : (DEMO_CATEGORY_PRODUCTS[slug] || [])]),
        );

        setCategoryProducts(mapped);
      } catch {
        if (!cancelled) {
          setCategoryProducts(DEMO_CATEGORY_PRODUCTS);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <MainHeader />

      {/* Animated Category Cards */}
      <section className="hidden md:block mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORY_SLUGS.map((slug, index) => {
            const categoryColors = {
              kitchen: { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-lg sm:text-xl' },
              bakery: { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-lg sm:text-xl' },
              snacks: { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-lg sm:text-xl' },
              beauty: { bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-lg sm:text-xl' },
              household: { bg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-lg sm:text-xl' },
            };
            const colors = categoryColors[slug];

            return (
              <Link
                key={slug}
                to={`/category/${slug}`}
                className={`group relative overflow-hidden rounded-lg border ${colors.bg} ${colors.border} transition-all duration-300 hover:shadow-sm`}
                style={{ animation: `slideUp 0.5s ease-out ${index * 0.08}s backwards` }}
              >
                <div className="relative h-16 sm:h-20 flex flex-col items-center justify-center p-2 sm:p-3">
                  {/* Icon */}
                  <div className={`${colors.icon} mb-1`}>
                    {
                      {
                        kitchen: '🍳',
                        bakery: '🥐',
                        snacks: '🍿',
                        beauty: '💄',
                        household: '🧹',
                      }[slug]
                    }
                  </div>
                  {/* Category Name */}
                  <h3 className={`text-center font-semibold text-[10px] sm:text-xs ${colors.text}`}>
                    {CATEGORY_LABELS[slug]}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5 category sections */}
      {CATEGORY_SLUGS.map((slug) => (
        <CategorySection
          key={slug}
          title={`${CATEGORY_LABELS[slug]} Smart Basket`}
          slug={slug}
          products={categoryProducts[slug] || DEMO_CATEGORY_PRODUCTS[slug] || []}
          scrollRefSetter={setScrollEl(slug)}
          onScrollLeft={() => scroll(slug, 'left')}
          onScrollRight={() => scroll(slug, 'right')}
        />
      ))}

      {/* Benefits */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-stone-900">Free delivery</h3>
              <p className="mt-1 text-sm text-stone-600">On orders above ₹499</p>
            </div>
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-stone-900">Secure payment</h3>
              <p className="mt-1 text-sm text-stone-600">100% secure checkout</p>
            </div>
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-stone-900">Easy returns</h3>
              <p className="mt-1 text-sm text-stone-600">7-day return policy</p>
            </div>
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-stone-900">Support 24/7</h3>
              <p className="mt-1 text-sm text-stone-600">We're here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="font-display text-xl font-bold tracking-tight text-white">
                General Store
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                Your neighbourhood store. Fresh groceries and daily essentials delivered.
              </p>
            </div>
            {/* Quick links */}
            <div>
              <h4 className="font-semibold uppercase tracking-wider text-white">Quick links</h4>
              <ul className="mt-4 space-y-2.5">
                <li><Link to="/" className="text-sm transition hover:text-white">Home</Link></li>
                <li><Link to="/category/kitchen" className="text-sm transition hover:text-white">Shop</Link></li>
                <li><Link to="/cart" className="text-sm transition hover:text-white">Cart</Link></li>
                <li><Link to="/sign-in" className="text-sm transition hover:text-white">Sign In</Link></li>
                <li><Link to="/sign-up" className="text-sm transition hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            {/* Categories */}
            <div>
              <h4 className="font-semibold uppercase tracking-wider text-white">Categories</h4>
              <ul className="mt-4 space-y-2.5">
                {CATEGORY_SLUGS.map((slug) => (
                  <li key={slug}>
                    <Link to={`/category/${slug}`} className="text-sm capitalize transition hover:text-white">
                      {CATEGORY_LABELS[slug]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Contact Details */}
            <div>
              <h4 className="font-semibold uppercase tracking-wider text-white">Contact Us</h4>
              <ul className="mt-4 space-y-2.5">
                <li className="text-sm text-stone-400">
                  <span className="font-semibold text-white">Phone:</span> +91 9876 543 210
                </li>
                <li className="text-sm text-stone-400">
                  <span className="font-semibold text-white">Email:</span> support@generalstore.com
                </li>
                <li className="text-sm text-stone-400">
                  <span className="font-semibold text-white">Address:</span> 123 Market Street, City Center, State 110001
                </li>
                <li className="text-sm text-stone-400 mt-4">
                  <span className="font-semibold text-white">Hours:</span>
                  <br />7 AM - 11 PM Daily
                </li>
              </ul>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-700 pt-8 sm:flex-row">
            <p className="text-center text-sm text-stone-500 sm:text-left">
              © {new Date().getFullYear()} General Store. All rights reserved.
            </p>
            <p className="text-center text-xs text-stone-500 sm:text-right">
              Fresh groceries delivered to your doorstep · 24/7 support
            </p>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
