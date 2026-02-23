import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../../components/Header/MainHeader';
import ToastMessage from '../../components/common/ToastMessage';
import { useTimedToast } from '../../hooks/useTimedToast';
import { getOrders } from '../../services/ordersApi';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Select,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast, showToast } = useTimedToast(3000);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      showToast('Access denied. Admin only.', 'error');
      setTimeout(() => navigate('/'), 1500);
      return;
    }

    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await getOrders();
        if (!cancelled) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [navigate, showToast]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order status');
      }

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      showToast('Order status updated successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update order status', 'error');
    }
  };

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((order) => order.status === filter);

  const statusOptions = [
    'pending',
    'confirmed',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ];

  const statusStyleMap = {
    pending: 'bg-stone-100 text-stone-700',
    confirmed: 'bg-blue-100 text-blue-700',
    packed: 'bg-cyan-100 text-cyan-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    out_for_delivery: 'bg-amber-100 text-amber-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-stone-50">
    
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ToastMessage {...toast} />

        <div className="flex items-center justify-between gap-4">
          <div>
            <Link to="/admin" className="text-sm text-stone-500 hover:text-stone-900">
              ← Dashboard
            </Link>
            <h1 className="mt-2 font-display text-3xl font-bold text-stone-900">Orders</h1>
          </div>
        </div>

        {/* Filter Tabs */}
        <Box sx={{ mt: 4, display: 'flex', gap: 1, overflowX: 'auto', pb: 2 }}>
          {['all', ...statusOptions].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status)}
              variant={filter === status ? 'contained' : 'outlined'}
              sx={{
                whiteSpace: 'nowrap',
                textTransform: 'capitalize',
              }}
            >
              {status === 'all' ? 'All Orders' : status.replace(/_/g, ' ')}
            </Button>
          ))}
        </Box>

        {/* Orders Table */}
        <Box sx={{ mt: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Box sx={{ fontSize: '3rem', mb: 2 }}>📦</Box>
              <Box sx={{ fontSize: '1.2rem', fontWeight: 600, color: '#333' }}>No orders found</Box>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#1f2937' }}>Update Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: '#f0f4ff' }, borderBottom: '1px solid #e5e7eb' }}>
                      <TableCell>
                        <Link
                          to={`/orders/${order.id}`}
                          style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{order.address?.fullName}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{order.pricing?.grandTotal?.toFixed(2) || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.replace(/_/g, ' ')}
                          sx={{
                            backgroundColor: {
                              pending: '#f3f4f6',
                              confirmed: '#dbeafe',
                              packed: '#cffafe',
                              shipped: '#e0e7ff',
                              out_for_delivery: '#fef3c7',
                              delivered: '#dcfce7',
                              cancelled: '#fee2e2',
                            }[order.status] || '#f3f4f6',
                            color: {
                              pending: '#374151',
                              confirmed: '#1e40af',
                              packed: '#0891b2',
                              shipped: '#4338ca',
                              out_for_delivery: '#b45309',
                              delivered: '#166534',
                              cancelled: '#991b1b',
                            }[order.status] || '#374151',
                          }}
                        />
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell align="center">
                        <Select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status.replace(/_/g, ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </main>
    </div>
  );
};

export default AdminOrders;
