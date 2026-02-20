import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useEffect, useRef, useState } from 'react';
import { getProductSuggestions } from '../../services/productsApi';
import ToastMessage from '../common/ToastMessage';
import { useTimedToast } from '../../hooks/useTimedToast';

const TOP_GREEN = '#84c225';

const CATEGORIES = [
  { label: 'Kitchen', slug: 'kitchen' },
  { label: 'Snacks', slug: 'snacks' },
  { label: 'Beauty', slug: 'beauty' },
  { label: 'Bakery', slug: 'bakery' },
  { label: 'Household', slug: 'household' },
];

const MainHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchBoxRef = useRef(null);
  const hasShownSearchErrorRef = useRef(false);
  const { toast: searchToast, showToast: showSearchToast } = useTimedToast(2200);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (!searchBoxRef.current?.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      hasShownSearchErrorRef.current = false;
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getProductSuggestions({ search: query, limit: 6 });
        if (!cancelled) {
          setSuggestions(Array.isArray(results) ? results : []);
          setShowSuggestions(true);
          hasShownSearchErrorRef.current = false;
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          if (!hasShownSearchErrorRef.current) {
            showSearchToast('Search suggestions are unavailable right now.', 'error');
            hasShownSearchErrorRef.current = true;
          }
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleCategoryClick = (slug) => {
    navigate(`/category/${slug}`);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      navigate('/');
      return;
    }

    showSearchToast(`Showing results for "${query}"`, 'info');
    navigate(`/category/all?search=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (product) => {
    const query = product.name || '';
    setSearchQuery(query);
    setShowSuggestions(false);
    showSearchToast(`Showing results for "${query}"`, 'info');
    navigate(`/category/all?search=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top green bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: TOP_GREEN }}
      />

      {/* Main header row */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 min-h-14 flex-wrap items-center gap-3 py-2 sm:gap-4 md:h-16 md:gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 flex-col justify-center pr-2 sm:pr-4"
          >
            <span className="font-display text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
              General Store
            </span>
            <span className="hidden text-xs text-stone-500 sm:block">
              Your neighbourhood store
            </span>
          </Link>

          {/* Search bar - grows on larger screens */}
          <form
            ref={searchBoxRef}
            className="relative flex-1 min-w-0 max-w-xl"
            onSubmit={handleSearchSubmit}
          >
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              <svg className="h-5 w-5" style={{ color: TOP_GREEN }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search for Products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              className="h-10 w-full rounded-lg border border-stone-300 bg-white pl-10 pr-14 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 md:h-11"
            />

            <button
              type="submit"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-stone-600 transition hover:bg-stone-100"
              aria-label="Search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {showSuggestions && (searchQuery.trim().length >= 2) && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg">
                {isSearching ? (
                  <div className="px-3 py-2 text-xs text-stone-500">Searching...</div>
                ) : suggestions.length > 0 ? (
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {suggestions.map((product) => (
                      <li key={product._id}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(product)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-stone-100"
                        >
                          <img
                            src={product.images?.[0] || product.image || 'https://placehold.co/60x60/f5f5f4/78716c?text=P'}
                            alt={product.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                          <span className="min-w-0 flex-1 text-xs text-stone-700">
                            <span className="block truncate font-semibold text-stone-900">{product.name}</span>
                            <span className="block truncate text-stone-500">{product.brand}</span>
                          </span>
                          <span className="text-xs font-semibold text-stone-700">₹{product.discountedPrice ?? product.price}</span>
                        </button>
                      </li>
                    ))}
                    <li className="border-t border-stone-100">
                      <button
                        type="submit"
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-primary-600 transition hover:bg-stone-100"
                      >
                        View all results for "{searchQuery.trim()}"
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="px-3 py-2 text-xs text-stone-500">No matching products.</div>
                )}
              </div>
            )}
          </form>

          {/* Delivery info - hidden on small screens */}
          <div className="hidden shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 md:flex md:flex-col md:justify-center">
            <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: TOP_GREEN }}>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.73l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.73l7-10a1 1 0 011.12-.184z" clipRule="evenodd" />
              </svg>
              Delivery in 10 mins
            </span>
            <span className="text-xs text-stone-500">Select Location</span>
          </div>

          {/* Login / Sign Up */}
          <Link
            to="/sign-in"
            className="hidden shrink-0 rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white sm:inline-flex md:px-5"
            style={{ backgroundColor: '#374151' }}
          >
            <span className="hidden sm:inline">Login / Sign Up</span>
            <span className="sm:hidden">Login</span>
          </Link>

          {/* Cart with badge */}
          <Link
            to="/cart"
            className="relative flex shrink-0 items-center justify-center rounded-lg p-2 transition hover:bg-stone-100"
          >
            <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Category bar - Kitchen, Snacks, Beauty, Bakery, Household */}
        <div
          className={`border-t border-stone-200 bg-stone-50/80 md:block ${mobileMenuOpen ? 'block' : 'hidden'}`}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 overflow-x-auto py-2 md:gap-3 md:py-2.5 md:overflow-visible">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`shrink-0 whitespace-nowrap rounded-2xl border-2 px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 md:px-4 md:py-2 ${
                  location.pathname === `/category/${cat.slug}`
                    ? 'border-[#84c225] bg-[#84c225]/10 text-stone-900'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-[#84c225] hover:shadow-md hover:shadow-[#84c225]/20 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      </header>

      <ToastMessage toast={searchToast} />
    </>
  );
};

export default MainHeader;
