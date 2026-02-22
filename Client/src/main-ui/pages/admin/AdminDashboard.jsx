import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../../components/Header/MainHeader';
import ToastMessage from '../../components/common/ToastMessage';
import { useTimedToast } from '../../hooks/useTimedToast';
import { getOrders } from '../../services/ordersApi';
import { getProducts } from '../../services/productsApi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useTimedToast(3000);

  useEffect(() => {
    // Check if user is admin
    const adminRole = localStorage.getItem('adminRole');
    if (adminRole !== 'admin') {
      showToast('Access denied. Admin only.', 'error');
      setTimeout(() => navigate('/admin/login'), 1500);
      return;
    }

    let cancelled = false;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [ordersData, productsData] = await Promise.all([
          getOrders(),
          getProducts()
        ]);

        if (!cancelled) {
          setOrders(Array.isArray(ordersData) ? ordersData : []);
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [navigate, showToast]);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.grandTotal || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const StatCard = ({ icon, label, value, color }) => (
    <div className={`rounded-lg border-2 ${color} bg-white p-6 shadow-sm`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-stone-600">{label}</p>
          <p className="text-2xl font-bold text-stone-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ToastMessage {...toast} />

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">Admin Panel</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-stone-900">Dashboard</h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('adminAuthToken');
              localStorage.removeItem('adminUserId');
              localStorage.removeItem('adminRole');
              navigate('/admin/login');
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        {!loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="📦"
              label="Total Products"
              value={totalProducts}
              color="border-blue-300 bg-blue-50"
            />
            <StatCard
              icon="📋"
              label="Total Orders"
              value={totalOrders}
              color="border-purple-300 bg-purple-50"
            />
            <StatCard
              icon="⏳"
              label="Pending Orders"
              value={pendingOrders}
              color="border-amber-300 bg-amber-50"
            />
            <StatCard
              icon="💰"
              label="Total Revenue"
              value={`₹${totalRevenue.toFixed(0)}`}
              color="border-green-300 bg-green-50"
            />
          </div>
        )}

        {loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-stone-200" />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-stone-900">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Link
              to="/admin/products"
              className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-center font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              📦 Manage Products
            </Link>
            <Link
              to="/admin/orders"
              className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-center font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              📋 Manage Orders
            </Link>
            <Link
              to="/admin/users"
              className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-center font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              👥 Manage Users
            </Link>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Quick View</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">Recent Orders</h2>
            </div>
            <Link to="/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl shadow-sm border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#1f2937' }}>
                  <th style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem 1rem', textAlign: 'left' }}>Order ID</th>
                  <th style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem 1rem', textAlign: 'left' }}>Customer</th>
                  <th style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem 1rem', textAlign: 'left' }}>Phone</th>
                  <th style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem 1rem', textAlign: 'left' }}>Amount</th>
                  <th style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
                  <th style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', padding: '0.75rem 1rem', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    className="hover:shadow-md"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => navigate('/admin/orders')}
                  >
                    <td style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', padding: '0.5rem 1rem' }}>{order.id}</td>
                    <td style={{ color: '#334155', fontSize: '0.95rem', padding: '0.5rem 1rem' }}>{order.address?.fullName}</td>
                    <td style={{ color: '#64748b', fontSize: '0.95rem', padding: '0.5rem 1rem' }}>{order.address?.phone || '-'}</td>
                    <td style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem', padding: '0.5rem 1rem' }}>₹{order.pricing?.grandTotal?.toFixed(2) || 0}</td>
                    <td style={{ padding: '0.5rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: {
                            pending: '#fef3c7',
                            confirmed: '#dbeafe',
                            packed: '#cffafe',
                            shipped: '#e0e7ff',
                            out_for_delivery: '#fed7aa',
                            delivered: '#dcfce7',
                            cancelled: '#fee2e2',
                          }[order.status] || '#f1f5f9',
                          color: {
                            pending: '#92400e',
                            confirmed: '#0c4a6e',
                            packed: '#164e63',
                            shipped: '#3730a3',
                            out_for_delivery: '#9a3412',
                            delivered: '#166534',
                            cancelled: '#7f1d1d',
                          }[order.status] || '#475569',
                        }}
                      >
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
