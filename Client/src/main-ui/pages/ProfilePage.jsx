import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../components/Header/MainHeader';
import ToastMessage from '../components/common/ToastMessage';
import { useTimedToast } from '../hooks/useTimedToast';
import { cancelOrder, getOrders } from '../services/ordersApi';
import { saveAddress, deleteAddress, getAddresses } from '../services/addressesApi';

const MOCK_PROFILE = {
  name: 'Adesh Kumar',
  phone: '+91 98765 43210',
  email: 'adesh@example.com',
};

const MOCK_ADDRESSES = [
  {
    id: 'addr-1',
    label: 'Home',
    name: 'Adesh Kumar',
    phone: '9876543210',
    line1: 'House 22, MG Road',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Work',
    name: 'Adesh Kumar',
    phone: '9876543210',
    line1: 'Tech Park, Tower B',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    isDefault: false,
  },
];

const MOCK_ORDERS = [
  {
    id: 'ORD-100245',
    date: '20 Feb 2026',
    status: 'Delivered',
    total: 624,
    items: 4,
    paymentMethod: 'UPI',
    trackingId: 'TRK-784521',
    deliveryAddress: 'House 22, MG Road, Indore - 452001',
    itemsPreview: [
      'Carrot - Orange (1 kg)',
      'Cucumber (500 g)',
      'Almonds (200 g)',
    ],
    statusTimeline: [
      { label: 'Order placed', date: '20 Feb 2026, 9:10 AM' },
      { label: 'Packed', date: '20 Feb 2026, 10:30 AM' },
      { label: 'Delivered', date: '20 Feb 2026, 1:15 PM' },
    ],
  },
  {
    id: 'ORD-100221',
    date: '18 Feb 2026',
    status: 'Out for delivery',
    total: 349,
    items: 2,
    paymentMethod: 'COD',
    trackingId: 'TRK-784102',
    deliveryAddress: 'Tech Park, Tower B, Indore - 452010',
    itemsPreview: [
      'Face Cream (50 g)',
      'Soap (3 pcs)',
    ],
    statusTimeline: [
      { label: 'Order placed', date: '18 Feb 2026, 8:45 AM' },
      { label: 'Packed', date: '18 Feb 2026, 9:40 AM' },
      { label: 'Out for delivery', date: '18 Feb 2026, 11:15 AM' },
    ],
  },
  {
    id: 'ORD-100198',
    date: '15 Feb 2026',
    status: 'Cancelled',
    total: 189,
    items: 1,
    paymentMethod: 'Card',
    trackingId: 'TRK-783890',
    deliveryAddress: 'House 22, MG Road, Indore - 452001',
    itemsPreview: [
      'Roasted Makhana (200 g)',
    ],
    statusTimeline: [
      { label: 'Order placed', date: '15 Feb 2026, 10:05 AM' },
      { label: 'Cancelled', date: '15 Feb 2026, 11:30 AM' },
    ],
  },
];

const statusStyles = {
  delivered: 'bg-green-100 text-green-700',
  out_for_delivery: 'bg-amber-100 text-amber-700',
  shipped: 'bg-amber-100 text-amber-700',
  packed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-blue-100 text-blue-700',
  pending: 'bg-stone-100 text-stone-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const statusLabelMap = {
  delivered: 'Delivered',
  out_for_delivery: 'Out for delivery',
  shipped: 'Shipped',
  packed: 'Packed',
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

const formatOrderDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatOrderDateTime = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const normalizeStatus = (status) => String(status || 'pending').trim().toLowerCase();

const canCancelOrderStatus = (status) => !['delivered', 'cancelled'].includes(normalizeStatus(status));

const mapApiOrderToView = (order) => {
  const normalizedStatus = normalizeStatus(order.status);
  const statusLabel = statusLabelMap[normalizedStatus] || 'Pending';
  const statusTime = order.cancelledAt || order.updatedAt || order.createdAt;
  const deliveryAddress = order.address
    ? `${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
    : 'Address not available';

  const itemsPreview = (order.items || []).slice(0, 3).map(
    (item) => `${item.name}${item.weight ? ` (${item.weight})` : ''}`,
  );

  return {
    id: order.id,
    date: formatOrderDate(order.createdAt),
    status: statusLabel,
    statusKey: normalizedStatus,
    total: Number(order.pricing?.grandTotal || 0),
    items: (order.items || []).length,
    paymentMethod: String(order.paymentMethod || 'cod').toUpperCase(),
    trackingId: `TRK-${String(order.id || '').replace('ORD-', '').slice(-6) || '000000'}`,
    deliveryAddress,
    itemsPreview,
    statusTimeline: [
      { label: 'Order placed', date: formatOrderDateTime(order.createdAt) },
      { label: statusLabel, date: formatOrderDateTime(statusTime) },
    ],
  };
};

const emptyAddress = {
  id: '',
  label: '',
  name: '',
  phone: '',
  line1: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState('');
  const { toast: ordersActionToast, showToast: showOrdersToast } = useTimedToast(1800);

  const orderCount = orders.length;
  const deliveredCount = orders.filter((order) => order.status === 'Delivered').length;
  const latestOrder = orders[0];

  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [profileDraft, setProfileDraft] = useState(MOCK_PROFILE);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressDraft, setAddressDraft] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressError, setAddressError] = useState('');

  const handleProfileEdit = () => {
    setProfileDraft(profile);
    setProfileError('');
    setIsEditingProfile(true);
  };

  const handleProfileSave = () => {
    if (profileDraft.name.trim().length < 2) {
      setProfileError('Please enter your name.');
      return;
    }
    if (!/^\+?\d[\d\s-]{8,}$/.test(profileDraft.phone.trim())) {
      setProfileError('Please enter a valid phone number.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(profileDraft.email.trim())) {
      setProfileError('Please enter a valid email.');
      return;
    }

    setProfile(profileDraft);
    setIsEditingProfile(false);
    setProfileError('');
  };

  const handleProfileCancel = () => {
    setProfileDraft(profile);
    setProfileError('');
    setIsEditingProfile(false);
  };

  const openAddressForm = () => {
    setAddressDraft({ ...emptyAddress, id: `addr-${Date.now()}` });
    setEditingAddressId(null);
    setAddressError('');
    setIsAddressFormOpen(true);
  };

  const handleEditAddress = (address) => {
    setAddressDraft(address);
    setEditingAddressId(address.id);
    setAddressError('');
    setIsAddressFormOpen(true);
  };

  const handleAddressSave = async () => {
    if (addressDraft.label.trim().length < 2) {
      setAddressError('Please add a label like Home or Work.');
      return;
    }
    if (addressDraft.name.trim().length < 2) {
      setAddressError('Please enter a name for this address.');
      return;
    }
    if (!/^\d{10}$/.test(addressDraft.phone.trim())) {
      setAddressError('Phone must be 10 digits.');
      return;
    }
    if (addressDraft.line1.trim().length < 5) {
      setAddressError('Please enter a valid address line.');
      return;
    }
    if (addressDraft.city.trim().length < 2 || addressDraft.state.trim().length < 2) {
      setAddressError('Please enter city and state.');
      return;
    }
    if (!/^\d{6}$/.test(addressDraft.pincode.trim())) {
      setAddressError('Pincode must be 6 digits.');
      return;
    }

    // Call backend to save address
    try {
      await saveAddress({
        label: addressDraft.label,
        name: addressDraft.name,
        phone: addressDraft.phone,
        line1: addressDraft.line1,
        city: addressDraft.city,
        state: addressDraft.state,
        pincode: addressDraft.pincode,
        isDefault: addressDraft.isDefault,
      });

      // Reload addresses from backend
      const updatedAddresses = await getAddresses();
      setAddresses(updatedAddresses);

      setIsAddressFormOpen(false);
      setEditingAddressId(null);
      setAddressDraft(emptyAddress);
      setAddressError('');
    } catch (err) {
      setAddressError('Failed to save address. Please try again.');
    }
  };

  const handleAddressCancel = () => {
    setIsAddressFormOpen(false);
    setEditingAddressId(null);
    setAddressDraft(emptyAddress);
    setAddressError('');
  };

  const handleSetDefault = async (id) => {
    try {
      const addressToUpdate = addresses.find((a) => a.id === id);
      if (!addressToUpdate) return;

      await saveAddress({
        label: addressToUpdate.label,
        name: addressToUpdate.name,
        phone: addressToUpdate.phone,
        line1: addressToUpdate.line1,
        city: addressToUpdate.city,
        state: addressToUpdate.state,
        pincode: addressToUpdate.pincode,
        isDefault: true,
      });

      const updated = await getAddresses();
      setAddresses(updated);
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  const handleDeleteAddressClick = async (id) => {
    try {
      await deleteAddress(id);
      const updated = await getAddresses();
      setAddresses(updated);
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleQuickCancelOrder = async (orderId) => {
    if (!orderId || cancellingOrderId) return;

    setCancellingOrderId(orderId);

    try {
      const cancelledOrder = await cancelOrder(orderId, 'Cancelled from profile');
      const nextOrder = mapApiOrderToView(cancelledOrder);

      setOrders((prev) => prev.map((item) => (item.id === orderId ? nextOrder : item)));
      showOrdersToast(`Order ${orderId} cancelled successfully.`, 'success');
    } catch {
      showOrdersToast(`Unable to cancel order ${orderId}. Please try again.`, 'error');
    } finally {
      setCancellingOrderId('');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const apiOrders = await getOrders();
        if (!cancelled && Array.isArray(apiOrders)) {
          const mappedOrders = apiOrders.map(mapApiOrderToView);
          setOrders(mappedOrders.length > 0 ? mappedOrders : []);
        }
      } catch {
        if (!cancelled) {
          setOrders(MOCK_ORDERS);
        }
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };

    const loadAddresses = async () => {
      try {
        // Check for temp address from signup first
        const tempAddr = localStorage.getItem('tempAddress');
        if (tempAddr) {
          const parsed = JSON.parse(tempAddr);
          if (parsed.line1?.trim()) {
            await saveAddress({
              label: parsed.label || 'Home',
              name: parsed.fullName || profile.name,
              phone: parsed.phone || profile.phone,
              line1: parsed.line1,
              city: parsed.city,
              state: parsed.state,
              pincode: parsed.pincode,
              isDefault: true,
            });
            localStorage.removeItem('tempAddress');
          }
        }
        
        // Load from backend
        const backendAddresses = await getAddresses();
        setAddresses(backendAddresses.length > 0 ? backendAddresses : MOCK_ADDRESSES);
      } catch {
        // Fallback to mock
        setAddresses(MOCK_ADDRESSES);
      }
    };

    loadOrders();
    loadAddresses();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <MainHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-200 bg-gradient-to-r from-stone-900 to-stone-700 px-6 py-6 text-white shadow-sm sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl font-bold">
                {profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/70">Profile</p>
                <h1 className="mt-1 font-display text-3xl font-bold">My Account</h1>
                <p className="mt-1 text-sm text-white/70">Manage orders, addresses, and payments</p>
              </div>
            </div>
            <Link to="/" className="text-sm font-semibold text-white/80 hover:text-white">
              Continue shopping
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold">
              Total orders: {orderCount}
            </div>
            <div className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold">
              Delivered: {deliveredCount}
            </div>
            <div className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold">
              Default address: {addresses.find((address) => address.isDefault)?.label || 'Not set'}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Profile details</h2>
                  <p className="mt-1 text-sm text-stone-500">Manage your personal information.</p>
                </div>
                {isEditingProfile ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleProfileCancel}
                      className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleProfileSave}
                      className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleProfileEdit}
                    className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                  >
                    Edit profile
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-stone-500">Name</p>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileDraft.name}
                      onChange={(event) => setProfileDraft((prev) => ({ ...prev, name: event.target.value }))}
                      className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-stone-900">{profile.name}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500">Phone</p>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileDraft.phone}
                      onChange={(event) => setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))}
                      className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-stone-900">{profile.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold text-stone-500">Email</p>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      value={profileDraft.email}
                      onChange={(event) => setProfileDraft((prev) => ({ ...prev, email: event.target.value }))}
                      className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-stone-900">{profile.email}</p>
                  )}
                </div>
              </div>

              {profileError && (
                <p className="mt-3 text-sm font-semibold text-rose-600">{profileError}</p>
              )}
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Saved addresses</h2>
                  <p className="mt-1 text-sm text-stone-500">Default delivery locations.</p>
                </div>
                <button
                  type="button"
                  onClick={openAddressForm}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Add address
                </button>
              </div>

              {isAddressFormOpen && (
                <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-stone-600">Label</label>
                      <input
                        type="text"
                        value={addressDraft.label}
                        onChange={(event) => setAddressDraft((prev) => ({ ...prev, label: event.target.value }))}
                        placeholder="Home"
                        className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600">Full name</label>
                      <input
                        type="text"
                        value={addressDraft.name}
                        onChange={(event) => setAddressDraft((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Adesh Kumar"
                        className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600">Phone</label>
                      <input
                        type="text"
                        value={addressDraft.phone}
                        onChange={(event) => setAddressDraft((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="9876543210"
                        className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600">Pincode</label>
                      <input
                        type="text"
                        value={addressDraft.pincode}
                        onChange={(event) => setAddressDraft((prev) => ({ ...prev, pincode: event.target.value }))}
                        placeholder="452001"
                        className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-stone-600">Address line</label>
                      <input
                        type="text"
                        value={addressDraft.line1}
                        onChange={(event) => setAddressDraft((prev) => ({ ...prev, line1: event.target.value }))}
                        placeholder="House no, street, area"
                        className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600">City</label>
                      <input
                        type="text"
                        value={addressDraft.city}
                        onChange={(event) => setAddressDraft((prev) => ({ ...prev, city: event.target.value }))}
                        placeholder="Indore"
                        className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-stone-600">State</label>
                      <input
                        type="text"
                        value={addressDraft.state}
                        onChange={(event) => setAddressDraft((prev) => ({ ...prev, state: event.target.value }))}
                        placeholder="Madhya Pradesh"
                        className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        id="setDefault"
                        type="checkbox"
                        checked={addressDraft.isDefault}
                        onChange={(event) => setAddressDraft((prev) => ({ ...prev, isDefault: event.target.checked }))}
                        className="h-4 w-4 rounded border-stone-300 text-stone-900"
                      />
                      <label htmlFor="setDefault" className="text-xs font-semibold text-stone-600">
                        Set as default address
                      </label>
                    </div>
                  </div>

                  {addressError && (
                    <p className="mt-3 text-sm font-semibold text-rose-600">{addressError}</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleAddressSave}
                      className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                    >
                      {editingAddressId ? 'Update address' : 'Save address'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddressCancel}
                      className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{address.label}</span>
                        {address.isDefault && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            Default
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEditAddress(address)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-stone-900">{address.name}</p>
                    <p className="mt-1 text-sm text-stone-600">{address.line1}</p>
                    <p className="text-sm text-stone-600">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">Phone: {address.phone}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(address.id)}
                          className="text-xs font-semibold text-stone-700 hover:text-stone-900"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddressClick(address.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Recent orders</h2>
                  <p className="mt-1 text-sm text-stone-500">Track your latest deliveries.</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  View all
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {ordersLoading ? (
                  <div className="rounded-xl border border-stone-200 px-4 py-4 text-sm text-stone-500">
                    Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-xl border border-stone-200 px-4 py-4 text-sm text-stone-500">
                    No orders found yet.
                  </div>
                ) : orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-stone-200 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{order.id}</p>
                        <p className="text-xs text-stone-500">{order.date} • {order.items} items</p>
                        <p className="mt-1 text-xs text-stone-500">Payment: {order.paymentMethod}</p>
                        <p className="text-xs text-stone-500">Tracking: {order.trackingId}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.statusKey] || statusStyles.pending}`}>
                          {order.status}
                        </span>
                        <p className="text-sm font-semibold text-stone-900">₹{order.total}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                      <div className="rounded-lg bg-stone-50 px-3 py-2">
                        <p className="text-xs font-semibold text-stone-500">Items</p>
                        <ul className="mt-1 space-y-1 text-xs text-stone-700">
                          {order.itemsPreview.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-stone-50 px-3 py-2">
                        <p className="text-xs font-semibold text-stone-500">Delivery address</p>
                        <p className="mt-1 text-xs text-stone-700">{order.deliveryAddress}</p>
                      </div>
                      <div className="rounded-lg bg-stone-50 px-3 py-2">
                        <p className="text-xs font-semibold text-stone-500">Status timeline</p>
                        <ul className="mt-1 space-y-1 text-xs text-stone-700">
                          {order.statusTimeline.map((step) => (
                            <li key={step.label}>{step.label} • {step.date}</li>
                          ))}
                        </ul>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-800"
                          >
                            Track order
                          </button>
                          {canCancelOrderStatus(order.statusKey) && (
                            <button
                              type="button"
                              onClick={() => handleQuickCancelOrder(order.id)}
                              disabled={cancellingOrderId === order.id}
                              className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel order'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900">My orders</h2>
              <p className="mt-1 text-sm text-stone-500">Quick access to your latest order.</p>
              {latestOrder ? (
                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-900">{latestOrder.id}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[latestOrder.statusKey] || statusStyles.pending}`}>
                      {latestOrder.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">{latestOrder.date} • ₹{latestOrder.total}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/orders/${latestOrder.id}`)}
                    className="mt-3 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                  >
                    Track order
                  </button>
                  {canCancelOrderStatus(latestOrder.statusKey) && (
                    <button
                      type="button"
                      onClick={() => handleQuickCancelOrder(latestOrder.id)}
                      disabled={cancellingOrderId === latestOrder.id}
                      className="mt-2 w-full rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cancellingOrderId === latestOrder.id ? 'Cancelling...' : 'Cancel order'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500">
                  No recent order yet.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900">Quick actions</h2>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Manage addresses
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Payment methods
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Support
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900">Membership</h2>
              <p className="mt-1 text-sm text-stone-500">Prime delivery and exclusive offers.</p>
              <button
                type="button"
                className="mt-4 w-full rounded-lg bg-stone-900 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Join now
              </button>
            </div>
          </aside>
        </div>
      </main>

      <ToastMessage toast={ordersActionToast} />
    </div>
  );
};

export default ProfilePage;
