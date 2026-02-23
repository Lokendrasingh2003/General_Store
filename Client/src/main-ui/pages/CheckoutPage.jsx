import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../components/Header/MainHeader';
import ToastMessage from '../components/common/ToastMessage';
import { useCart } from '../../context/CartContext';
import { useTimedToast } from '../hooks/useTimedToast';
import { placeOrder } from '../services/ordersApi';
import { getAddresses, saveAddress } from '../services/addressesApi';

const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_FEE = 40;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const { toast: paymentToast, showToast: showPaymentToast } = useTimedToast(2000);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [addressSaved, setAddressSaved] = useState(false);
  const [showAddressErrors, setShowAddressErrors] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast: orderToast, showToast: showOrderToast } = useTimedToast(2000);

  const total = getTotalPrice();
  const originalSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.originalPrice || item.price || 0) * item.quantity,
    0,
  );
  const savings = Math.max(0, originalSubtotal - total);
  const deliveryFee = total < FREE_DELIVERY_THRESHOLD ? STANDARD_DELIVERY_FEE : 0;
  const finalPayable = total + deliveryFee;

  const isUpiValid = /^\S+@\S+$/.test(upiId.trim());
  const isCardNumberValid = cardNumber.replace(/\s/g, '').length >= 12;
  const isCardExpiryValid = /^\d{2}\/\d{2}$/.test(cardExpiry.trim());
  const isCardCvvValid = /^\d{3,4}$/.test(cardCvv.trim());
  const isCardNameValid = cardName.trim().length >= 2;

  const isPaymentValid =
    paymentMethod === 'cod' ||
    (paymentMethod === 'upi' && isUpiValid) ||
    (paymentMethod === 'card' && isCardNumberValid && isCardExpiryValid && isCardCvvValid && isCardNameValid);

  const isAddressValid =
    address.fullName.trim().length >= 2 &&
    /^\d{10}$/.test(address.phone.trim()) &&
    address.line1.trim().length >= 5 &&
    address.city.trim().length >= 2 &&
    address.state.trim().length >= 2 &&
    /^\d{6}$/.test(address.pincode.trim());

  const requiresPaymentStep = paymentMethod === 'upi' || paymentMethod === 'card';
  const isPaymentDone = paymentMethod === 'cod' ? true : paymentCompleted;
  const isPlaceOrderEnabled = addressSaved && isPaymentValid && isPaymentDone && cartItems.length > 0;

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const fetchedAddresses = await getAddresses();
        setSavedAddresses(Array.isArray(fetchedAddresses) ? fetchedAddresses : []);
        // Auto-select default address if available
        const defaultAddr = fetchedAddresses?.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setAddress({
            fullName: defaultAddr.name,
            phone: defaultAddr.phone,
            line1: defaultAddr.line1,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
          });
          setAddressSaved(true);
        }
      } catch {
        setSavedAddresses([]);
      }
    };
    loadAddresses();
  }, []);

  const handleSelectSavedAddress = (id) => {
    const selected = savedAddresses.find((a) => a.id === id);
    if (selected) {
      setSelectedAddressId(id);
      setAddress({
        fullName: selected.name,
        phone: selected.phone,
        line1: selected.line1,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode,
      });
      setAddressSaved(true);
    }
  };

  const handleAddressChange = (field) => (event) => {
    const value = event.target.value;
    setAddress((prev) => ({ ...prev, [field]: value }));
    setAddressSaved(false);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentCompleted(false);
  };

  const handleProceedToPayment = () => {
    if (!isPaymentValid) return;
    if (paymentMethod === 'upi') {
      setIsPaying(true);
      setTimeout(() => {
        setIsPaying(false);
        setPaymentCompleted(true);
        showPaymentToast('Payment completed successfully', 'success');
      }, 1200);
      return;
    }

    setPaymentCompleted(true);
    showPaymentToast('Payment completed successfully', 'success');
  };

  const handleSaveAddress = () => {
    if (!isAddressValid) {
      setShowAddressErrors(true);
      return;
    }

    setShowAddressErrors(false);
    setAddressSaved(true);
  };

  const handlePlaceOrder = async () => {
    if (!isPlaceOrderEnabled || isPlacingOrder) return;

    setIsPlacingOrder(true);
    try {
      const userId = localStorage.getItem('userId');
      
      // Place the order
      await placeOrder({
        items: cartItems,
        address,
        paymentMethod,
        userId,
      });

      const shouldSaveAddress = !selectedAddressId;

      // Automatically save the address only if it's not from saved addresses
      if (shouldSaveAddress) {
        try {
          await saveAddress({
            label: 'Delivery Address', // Add label for address
            name: address.fullName,
            phone: address.phone,
            line1: address.line1,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: savedAddresses.length === 0, // Make it default if no other addresses exist
          });
          console.log('✅ Address auto-saved to customer profile');
        } catch (addressError) {
          console.log('⚠️ Order placed but address save failed (non-critical):', addressError);
          // Don't show error to user for address saving - order is what matters
        }
      }

      clearCart();
      showOrderToast('Order placed successfully!', 'success');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch {
      showOrderToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <MainHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">Checkout</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-stone-900">Payment</h1>
          </div>
          <Link to="/cart" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Back to cart
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Delivery Address</h2>
                  <p className="mt-1 text-sm text-stone-500">Save your delivery address to continue.</p>
                </div>
                {addressSaved && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Address saved
                  </span>
                )}
              </div>

              {savedAddresses.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs font-semibold text-stone-600">Select saved address</label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => handleSelectSavedAddress(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                  >
                    <option value="">-- Choose an address --</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} - {addr.line1}
                        {addr.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-stone-600">Full name</label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={handleAddressChange('fullName')}
                    placeholder="Adesh Kumar"
                    className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                  />
                  {showAddressErrors && address.fullName.trim().length < 2 && (
                    <p className="mt-1 text-xs text-red-500">Enter your full name.</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600">Phone number</label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={handleAddressChange('phone')}
                    placeholder="9876543210"
                    className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                  />
                  {showAddressErrors && !/^\d{10}$/.test(address.phone.trim()) && (
                    <p className="mt-1 text-xs text-red-500">Enter a valid 10-digit phone.</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-600">Address line</label>
                  <input
                    type="text"
                    value={address.line1}
                    onChange={handleAddressChange('line1')}
                    placeholder="House no, street, area"
                    className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                  />
                  {showAddressErrors && address.line1.trim().length < 5 && (
                    <p className="mt-1 text-xs text-red-500">Enter your address line.</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={handleAddressChange('city')}
                    placeholder="Indore"
                    className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                  />
                  {showAddressErrors && address.city.trim().length < 2 && (
                    <p className="mt-1 text-xs text-red-500">Enter your city.</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600">State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={handleAddressChange('state')}
                    placeholder="Madhya Pradesh"
                    className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                  />
                  {showAddressErrors && address.state.trim().length < 2 && (
                    <p className="mt-1 text-xs text-red-500">Enter your state.</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600">Pincode</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={handleAddressChange('pincode')}
                    placeholder="452001"
                    className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                  />
                  {showAddressErrors && !/^\d{6}$/.test(address.pincode.trim()) && (
                    <p className="mt-1 text-xs text-red-500">Enter a valid 6-digit pincode.</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAddress}
                className="mt-5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                {addressSaved ? 'Update Address' : 'Save Address'}
              </button>

              {addressSaved && (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Saved address</p>
                      <p className="mt-1 text-sm font-semibold text-stone-900">{address.fullName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddressSaved(false)}
                      className="text-xs font-semibold text-green-700 hover:text-green-800"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-stone-700">
                    {address.line1}, {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="mt-1 text-sm text-stone-700">Phone: {address.phone}</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900">Payment Method</h2>
              <p className="mt-1 text-sm text-stone-500">Secure and quick checkout options.</p>

              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 rounded-xl border border-stone-200 px-4 py-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => handlePaymentMethodChange('cod')}
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Cash on Delivery</p>
                    <p className="text-xs text-stone-500">Pay when your order arrives.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-stone-200 px-4 py-3">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => handlePaymentMethodChange('upi')}
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">UPI</p>
                    <p className="text-xs text-stone-500">Pay using any UPI app.</p>
                  </div>
                </label>

                {paymentMethod === 'upi' && (
                  <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3">
                    <label className="text-xs font-semibold text-stone-600">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="name@bank"
                      className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                    />
                    {!isUpiValid && upiId.length > 0 && (
                      <p className="mt-1 text-xs text-red-500">Enter a valid UPI ID.</p>
                    )}
                  </div>
                )}

                <label className="flex items-center gap-3 rounded-xl border border-stone-200 px-4 py-3">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => handlePaymentMethodChange('card')}
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Debit/Credit Card</p>
                    <p className="text-xs text-stone-500">Visa, MasterCard, RuPay supported.</p>
                  </div>
                </label>

                {paymentMethod === 'card' && (
                  <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-stone-600">Card number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                        />
                        {!isCardNumberValid && cardNumber.length > 0 && (
                          <p className="mt-1 text-xs text-red-500">Enter a valid card number.</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-stone-600">Name on card</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Adesh Kumar"
                          className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                        />
                        {!isCardNameValid && cardName.length > 0 && (
                          <p className="mt-1 text-xs text-red-500">Enter cardholder name.</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-stone-600">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="09/27"
                          className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                        />
                        {!isCardExpiryValid && cardExpiry.length > 0 && (
                          <p className="mt-1 text-xs text-red-500">Enter expiry as MM/YY.</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-stone-600">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                        />
                        {!isCardCvvValid && cardCvv.length > 0 && (
                          <p className="mt-1 text-xs text-red-500">Enter a valid CVV.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {requiresPaymentStep && (
                  <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">Proceed to payment</p>
                        <p className="text-xs text-stone-500">Complete payment to place your order.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleProceedToPayment}
                        disabled={!isPaymentValid}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                          isPaymentValid ? 'bg-primary-600 hover:bg-primary-700' : 'cursor-not-allowed bg-stone-400'
                        }`}
                      >
                        {paymentCompleted
                          ? 'Payment Completed'
                          : (isPaying ? 'Processing...' : 'Proceed to Payment')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900">Order Summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Items total</span>
                  <span className="font-semibold text-stone-900">₹{originalSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Delivery fee</span>
                  <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : 'text-stone-900'}`}>
                    {deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Savings</span>
                  <span className="font-semibold text-green-600">- ₹{savings.toFixed(2)}</span>
                </div>
              </div>

              <div className="my-4 border-t border-stone-200" />

              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-stone-900">Amount Payable</span>
                <span className="text-xl font-bold text-stone-900">₹{finalPayable.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!isPlaceOrderEnabled}
                className={`mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition ${
                  isPlaceOrderEnabled ? 'bg-primary-600 hover:bg-primary-700' : 'cursor-not-allowed bg-stone-400'
                }`}
              >
                {isPlacingOrder ? 'Placing order...' : 'Place Order'}
              </button>

              <p className="mt-3 text-xs text-stone-500">
                By placing your order, you agree to our Terms & Conditions.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <ToastMessage toast={paymentToast} />
      <ToastMessage toast={orderToast} positionClassName="bottom-20 right-6" />
    </div>
  );
};

export default CheckoutPage;
