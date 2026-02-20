import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MainHeader from '../components/Header/MainHeader';
import ToastMessage from '../components/common/ToastMessage';
import { useTimedToast } from '../hooks/useTimedToast';
import { cancelOrder, getOrderById } from '../services/ordersApi';

const statusLabelMap = {
  delivered: 'Delivered',
  out_for_delivery: 'Out for delivery',
  shipped: 'Shipped',
  packed: 'Packed',
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

const statusStyleMap = {
  delivered: 'bg-green-100 text-green-700',
  out_for_delivery: 'bg-amber-100 text-amber-700',
  shipped: 'bg-amber-100 text-amber-700',
  packed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-blue-100 text-blue-700',
  pending: 'bg-stone-100 text-stone-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast: cancelToast, showToast: showCancelToast } = useTimedToast(1800);

  useEffect(() => {
    let cancelled = false;

    const loadOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(orderId);
        if (!cancelled) setOrder(data);
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const normalizedStatus = useMemo(
    () => String(order?.status || 'pending').toLowerCase(),
    [order?.status],
  );

  const statusLabel = statusLabelMap[normalizedStatus] || 'Pending';
  const statusClass = statusStyleMap[normalizedStatus] || statusStyleMap.pending;
  const canCancelOrder = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery'].includes(normalizedStatus);

  const handleCancelOrder = async () => {
    if (!order || !canCancelOrder || isCancelling) return;

    setIsCancelling(true);
    try {
      const updatedOrder = await cancelOrder(order.id);
      setOrder(updatedOrder);
      showCancelToast('Order cancelled successfully', 'success');
    } catch {
      showCancelToast('Unable to cancel order right now.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <MainHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">Order Tracking</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-stone-900">{orderId}</h1>
          </div>
          <Link to="/profile" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Back to profile
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">Loading order...</div>
        ) : !order ? (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500">Order not found.</div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Current status</p>
                    <p className="mt-1 text-xs text-stone-500">Updated at {formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-stone-50 p-4">
                  <p className="text-xs font-semibold text-stone-500">Timeline</p>
                  <ul className="mt-2 space-y-1 text-sm text-stone-700">
                    <li>Order placed • {formatDate(order.createdAt)}</li>
                    <li>{statusLabel} • {formatDate(order.createdAt)}</li>
                  </ul>
                </div>

                {canCancelOrder && (
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel order'}
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900">Items</h2>
                <div className="mt-4 space-y-3">
                  {(order.items || []).map((item) => (
                    <div key={`${item._id}-${item.weight || 'default'}`} className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.weight || 'Standard'} • Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-stone-900">₹{Number(item.price || 0) * Number(item.quantity || 0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900">Price details</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="font-semibold text-stone-900">₹{Number(order.pricing?.originalSubtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Savings</span>
                    <span className="font-semibold text-green-600">- ₹{Number(order.pricing?.savings || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Delivery fee</span>
                    <span className="font-semibold text-stone-900">₹{Number(order.pricing?.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="my-4 border-t border-stone-200" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900">Amount paid</span>
                  <span className="text-xl font-bold text-stone-900">₹{Number(order.pricing?.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900">Delivery address</h2>
                <p className="mt-3 text-sm font-semibold text-stone-900">{order.address?.fullName}</p>
                <p className="mt-1 text-sm text-stone-600">{order.address?.line1}</p>
                <p className="text-sm text-stone-600">{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                <p className="mt-1 text-sm text-stone-600">Phone: {order.address?.phone}</p>
              </div>
            </aside>
          </div>
        )}
      </main>

      <ToastMessage toast={cancelToast} />
    </div>
  );
};

export default OrderDetailPage;
