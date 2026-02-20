import { Link } from 'react-router-dom';
import MainHeader from '../components/Header/MainHeader';
import { useCart } from '../../context/CartContext';

const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_FEE = 40;

const CartPage = () => {
  const { cartItems, getTotalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const total = getTotalPrice();
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const originalSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.originalPrice || item.price || 0) * item.quantity,
    0
  );

  const savings = Math.max(0, originalSubtotal - total);
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - total);
  const deliveryFee = remainingForFreeDelivery > 0 ? STANDARD_DELIVERY_FEE : 0;
  const finalPayable = total + deliveryFee;
  const freeDeliveryProgress = Math.min(100, Math.round((total / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <div className="min-h-screen bg-stone-50">
      <MainHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold text-stone-900">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Clear cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm">
            <p className="text-stone-600">Your cart is empty.</p>
            <Link to="/" className="mt-4 inline-block font-medium text-primary-600 hover:underline">Continue shopping</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-stone-600">
                  {remainingForFreeDelivery > 0
                    ? `Add ₹${remainingForFreeDelivery.toFixed(2)} more for free delivery`
                    : 'You have unlocked free delivery'}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>

              {cartItems.map((item) => {
                const unitPrice = Number(item.price || 0);
                const unitOriginalPrice = Number(item.originalPrice || unitPrice);
                const lineTotal = unitPrice * item.quantity;

                return (
                  <article
                    key={`${item._id}-${item.weight}`}
                    className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28"
                      />

                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="line-clamp-2 font-semibold text-stone-900">{item.name}</h3>
                        <p className="mt-1 text-xs text-stone-500">Brand: {item.brand}</p>
                        {item.weight && <p className="text-xs text-stone-500">Weight: {item.weight}</p>}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-stone-900">₹{unitPrice.toFixed(2)}</span>
                          {unitOriginalPrice > unitPrice && (
                            <span className="text-xs text-stone-400 line-through">₹{unitOriginalPrice.toFixed(2)}</span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <div className="flex items-center rounded-lg border border-stone-300">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, item.weight, item.quantity - 1)}
                              className="px-3 py-1.5 text-sm hover:bg-stone-100"
                            >
                              −
                            </button>
                            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, item.weight, item.quantity + 1)}
                              className="px-3 py-1.5 text-sm hover:bg-stone-100"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id, item.weight)}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="hidden text-right sm:block">
                        <p className="text-sm text-stone-500">Item total</p>
                        <p className="mt-1 text-base font-bold text-stone-900">₹{lineTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900">Order Summary</h2>
                <p className="mt-1 text-sm text-stone-500">{itemCount} items</p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="font-medium text-stone-900">₹{originalSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Discount</span>
                    <span className="font-medium text-green-600">- ₹{savings.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Delivery fee</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-stone-900'}`}>
                      {deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="my-4 border-t border-stone-200" />

                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-stone-900">Total</span>
                  <span className="text-xl font-bold text-stone-900">₹{finalPayable.toFixed(2)}</span>
                </div>

                <Link
                  to="/checkout"
                  className="mt-4 block w-full rounded-lg bg-primary-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/"
                  className="mt-3 block text-center text-sm font-medium text-primary-600 hover:underline"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
