import { useEffect, useState } from 'react';
import { useCart } from '../../../context/CartContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const resolveImageUrl = (value) => {
  if (!value) return '';
  if (value.includes('/images/')) {
    const rewritten = value.replace('/images/', '/uploads/');
    return rewritten.startsWith('http') ? rewritten : `${API_BASE}${rewritten}`;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return `${API_BASE}${value}`;
  return `${API_BASE}/${value}`;
};

const parseWeightValue = (value) => {
  if (!value || typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();
  const match = normalized.match(/([\d.]+)\s*(kg|g|l|ml|pc|pcs)/);
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2];
  if (!Number.isFinite(amount)) return null;

  if (unit === 'kg') return { quantity: amount * 1000, type: 'weight' };
  if (unit === 'g') return { quantity: amount, type: 'weight' };
  if (unit === 'l') return { quantity: amount * 1000, type: 'volume' };
  if (unit === 'ml') return { quantity: amount, type: 'volume' };
  if (unit === 'pc' || unit === 'pcs') return { quantity: amount, type: 'count' };

  return null;
};

const SmartBasketCard = ({ product, compact = false }) => {
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState(product.weights?.[0]?.value ?? product.weight ?? '1 kg');
  const [isAdded, setIsAdded] = useState(false);
  const normalizedStockStatus = String(product.stockStatus || '').trim().toLowerCase();
  const isOutOfStock =
    product.inStock === false ||
    normalizedStockStatus === 'out_of_stock' ||
    normalizedStockStatus === 'out of stock';

  useEffect(() => {
    setSelectedWeight(product.weights?.[0]?.value ?? product.weight ?? '1 kg');
  }, [product]);

  const weights = product.weights?.length
    ? product.weights
    : [{ label: product.weightLabel || '1 kg', value: selectedWeight }];

  const selectedWeightData =
    weights.find((weightOption) => weightOption.value === selectedWeight) ||
    weights[0] ||
    {};

  const baseWeightData =
    weights.find((weightOption) => weightOption.price != null || weightOption.originalPrice != null) ||
    weights[0] ||
    {};

  const selectedParsedWeight = parseWeightValue(selectedWeightData.value);
  const baseParsedWeight = parseWeightValue(baseWeightData.value);

  const canUseProportionalPricing =
    selectedParsedWeight &&
    baseParsedWeight &&
    selectedParsedWeight.type === baseParsedWeight.type &&
    baseParsedWeight.quantity > 0;

  const proportionalFactor = canUseProportionalPricing
    ? selectedParsedWeight.quantity / baseParsedWeight.quantity
    : null;

  const basePriceForProportion =
    baseWeightData.price ??
    baseWeightData.discountedPrice ??
    product.discountedPrice ??
    product.price;

  const baseOriginalPriceForProportion =
    baseWeightData.originalPrice ??
    product.originalPrice ??
    product.price;

  const proportionalPrice =
    proportionalFactor != null && basePriceForProportion != null
      ? Number((basePriceForProportion * proportionalFactor).toFixed(2))
      : null;

  const proportionalOriginalPrice =
    proportionalFactor != null && baseOriginalPriceForProportion != null
      ? Number((baseOriginalPriceForProportion * proportionalFactor).toFixed(2))
      : null;

  const price =
    selectedWeightData.price ??
    selectedWeightData.discountedPrice ??
    proportionalPrice ??
    product.discountedPrice ??
    product.price;

  const originalPrice =
    selectedWeightData.originalPrice ??
    proportionalOriginalPrice ??
    product.originalPrice ??
    product.price;

  const discountPercent =
    selectedWeightData.discountPercent ??
    product.discountPercent ??
    (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  const effectivePrice = Number(price ?? 0);
  const effectiveOriginalPrice = Number(originalPrice ?? effectivePrice);

  const rawImage = product.images?.[0] || product.image;
  const productImage = resolveImageUrl(rawImage) || 'https://placehold.co/400x400/f5f5f4/78716c?text=No+Image';

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        price: effectivePrice,
        originalPrice: effectiveOriginalPrice,
        discountedPrice: effectivePrice,
        images: product.images?.length ? product.images : (product.image ? [product.image] : []),
        category: product.category,
        weight: selectedWeight,
      },
      1,
      selectedWeight
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  return (
    <div
      className={`shrink-0 rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md ${
        compact ? 'w-[140px] sm:w-[160px] md:w-[180px]' : 'w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]'
      } ${isOutOfStock ? 'shadow-[0_6px_18px_rgba(220,38,38,0.15)]' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-stone-100">
        {isOutOfStock && (
          <div className="absolute right-2 top-2 z-10 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">
            Unavailable
          </div>
        )}
        {discountPercent > 0 && (
          <div
            className="absolute left-0 top-0 z-10"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)',
              width: '55px',
              height: '55px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.12)'
            }}
          >
            <span className="text-white font-black text-center" style={{ transform: 'translate(5px, -4px)' }}>
              <div style={{ fontSize: '8px', lineHeight: '1' }}>
                {discountPercent}%
              </div>
              <div style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '0.5px' }}>
                OFF
              </div>
            </span>
          </div>
        )}
        <img
          src={productImage}
          alt={product.name}
          className="h-full w-full object-cover"
        />

      </div>
      <div className={compact ? 'p-2' : 'p-3'}>
        <p className={compact ? 'text-[10px] text-stone-500' : 'text-xs text-stone-500'}>{product.brand}</p>
        <h3 className={`mt-0.5 font-semibold text-stone-800 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          {product.name}
        </h3>
        <select
          value={selectedWeight}
          onChange={(e) => setSelectedWeight(e.target.value)}
          disabled={isOutOfStock}
          className={`mt-1.5 w-full rounded border border-stone-300 bg-stone-50 text-stone-700 focus:border-stone-400 focus:outline-none ${
            compact ? 'py-1 text-[10px]' : 'py-1.5 text-xs'
          }`}
        >
          {weights.map((w) => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </select>
        <div className={`mt-1.5 flex items-center gap-1.5 ${compact ? 'flex-wrap' : ''}`}>
          <span className={`font-bold text-stone-900 ${compact ? 'text-xs' : 'text-sm'}`}>₹{effectivePrice}</span>
          {effectiveOriginalPrice > effectivePrice && (
            <span className={`text-stone-400 line-through ${compact ? 'text-[10px]' : 'text-xs'}`}>
              ₹{effectiveOriginalPrice}
            </span>
          )}
        </div>
        <div className={`mt-2 ${compact ? 'mt-1.5' : ''}`}>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full rounded-lg py-2 text-xs font-bold text-white shadow-sm transition ${
              isOutOfStock
                ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                : (isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600')
            }`}
          >
            {isOutOfStock ? 'Unavailable' : (isAdded ? 'Added' : 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartBasketCard;
