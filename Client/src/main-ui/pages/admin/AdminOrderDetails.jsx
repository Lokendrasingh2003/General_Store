import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainHeader from '../../components/Header/MainHeader';
import ToastMessage from '../../components/common/ToastMessage';
import { useTimedToast } from '../../hooks/useTimedToast';
import { getOrders } from '../../services/ordersApi';

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const { toast, showToast } = useTimedToast(3000);

  useEffect(() => {
    const adminRole = localStorage.getItem('adminRole');
    if (adminRole !== 'admin') {
      showToast('Access denied. Admin only.', 'error');
      setTimeout(() => navigate('/admin/login'), 1500);
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrders();
        const foundOrder = Array.isArray(data) ? data.find((o) => o.id === orderId || o._id === orderId) : null;
        if (!cancelled) {
          if (foundOrder) {
            setOrder(foundOrder);
            setNewStatus(foundOrder.status || 'pending');
          } else {
            showToast('Order not found', 'error');
            setTimeout(() => navigate('/admin/orders'), 1500);
          }
        }
      } catch {
        if (!cancelled) {
          showToast('Failed to load order', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, navigate, showToast]);

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      showToast('Please select a different status', 'info');
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${order.id || order._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }

      setOrder({ ...order, status: newStatus });
      showToast('Order status updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <MainHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-stone-200" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50">
        <MainHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-stone-600">Order not found</p>
        </main>
      </div>
    );
  }

  const items = order.items || [];
  const customer = order.customerId || {};
  const pricing = order.pricing || {};
  const delivery = order.deliveryAddress || {};

  return (
    <div className="min-h-screen bg-stone-50">
      <MainHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ToastMessage toast={toast} />

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Link to="/admin/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              ← Back to Orders
            </Link>
            <h1 className="mt-2 font-display text-3xl font-bold text-stone-900">Order #{order.id}</h1>
            <p className="text-sm text-stone-600">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        {/* Order Status and Actions */}
        <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-stone-900">Order Status</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span
                className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                  order.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : order.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'processing'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'shipped'
                          ? 'bg-purple-100 text-purple-700'
                          : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-stone-100 text-stone-700'
                }`}
              >
                {order.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus || newStatus === order.status}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:bg-stone-400"
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Items */}
          <section className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-stone-900">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="px-4 py-3 text-left font-semibold text-stone-700">Product</th>
                    <th className="px-4 py-3 text-center font-semibold text-stone-700">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-stone-700">Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-stone-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-stone-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-900">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.brand}</p>
                      </td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">₹{item.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₹{(item.quantity * item.price)?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Order Summary and Details */}
          <section className="space-y-6">
            {/* Pricing Summary */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h3 className="mb-4 font-display font-bold text-stone-900">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium text-stone-900">₹{pricing.subtotal?.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Discount</span>
                  <span className="font-medium text-green-600">-₹{pricing.discount?.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Delivery Fee</span>
                  <span className="font-medium text-stone-900">₹{pricing.deliveryFee?.toFixed(2) || 0}</span>
                </div>
                <div className="border-t border-stone-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-stone-900">Grand Total</span>
                    <span className="font-display text-lg font-bold text-primary-600">
                      ₹{pricing.grandTotal?.toFixed(2) || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h3 className="mb-4 font-display font-bold text-stone-900">Customer</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-stone-900">{customer.name}</p>
                <p className="text-stone-600">{customer.email}</p>
                <p className="text-stone-600">{customer.phone}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h3 className="mb-4 font-display font-bold text-stone-900">Delivery Address</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-stone-900">{delivery.label || 'Home'}</p>
                <p className="text-stone-600">{delivery.address}</p>
                <p className="text-stone-600">
                  {delivery.city}, {delivery.state} {delivery.pincode}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminOrderDetails;
