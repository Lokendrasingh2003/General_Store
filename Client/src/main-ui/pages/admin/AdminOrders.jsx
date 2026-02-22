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
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Close as CloseIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const { toast, showToast } = useTimedToast(3000);

  useEffect(() => {
    const adminRole = localStorage.getItem('adminRole');
    if (adminRole !== 'admin') {
      showToast('Access denied. Admin only.', 'error');
      setTimeout(() => navigate('/admin/login'), 1500);
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
    <div className="min-h-screen bg-slate-50">
    
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ToastMessage {...toast} />

        <div className="mb-8">
          <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            ← Back to Dashboard
          </Link>
          <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">Orders Management</h1>
          <p className="mt-1 text-sm text-slate-600">View and manage all customer orders</p>
        </div>

        {/* Filter Tabs */}
        <Box sx={{ mt: 6, mb: 6, display: 'flex', gap: 1.5, overflowX: 'auto', pb: 2 }}>
          {['all', ...statusOptions].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status)}
              variant={filter === status ? 'contained' : 'outlined'}
              sx={{
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
                ...(filter === status ? {
                  backgroundColor: '#1f2937',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#374151' }
                } : {
                  borderColor: '#cbd5e1',
                  color: '#64748b',
                  '&:hover': { 
                    backgroundColor: '#f8fafc',
                    borderColor: '#1f2937'
                  }
                })
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
            <TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#1f2937', '&:hover': { backgroundColor: '#1f2937' } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', py: 2.5 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', py: 2.5 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', py: 2.5 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', py: 2.5 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', py: 2.5 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', py: 2.5 }}>Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', py: 2.5 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: '#f8fafc', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }, borderBottom: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', py: 2 }}>{order.id}</TableCell>
                      <TableCell sx={{ color: '#334155', fontSize: '0.95rem', py: 2 }}>{order.address?.fullName}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.95rem', py: 2 }}>{order.address?.phone || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem', py: 2 }}>₹{order.pricing?.grandTotal?.toFixed(2) || 0}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={order.status.replace(/_/g, ' ').toUpperCase()}
                          size="small"
                          sx={{
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
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.95rem', py: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOpenModal(true);
                          }}
                          sx={{ 
                            color: '#2563eb',
                            backgroundColor: '#eff6ff',
                            '&:hover': { backgroundColor: '#dbeafe' },
                            mr: 1
                          }}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <Select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          size="small"
                          sx={{ 
                            minWidth: 120,
                            backgroundColor: '#fff',
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.9rem',
                              '& fieldset': { borderColor: '#cbd5e1' },
                              '&:hover fieldset': { borderColor: '#1f2937' },
                            }
                          }}
                        >
                          {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status.replace(/_/g, ' ').toUpperCase()}
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

        {/* Order Details Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Order #{selectedOrder?.id}</span>
            <IconButton onClick={() => setOpenModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedOrder && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                {/* Order Items */}
                <Box>
                  <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Items</h3>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
                      <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>{item.name}</p>
                      <p style={{ fontSize: '0.875rem', color: '#666', margin: '0 0 0.5rem 0' }}>
                        {item.brand}
                      </p>
                      {item.weight && (
                        <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0' }}>
                          Size: <span style={{ fontWeight: 600 }}>{item.weight}</span>
                        </p>
                      )}
                      <p style={{ margin: '0.5rem 0 0 0' }}>
                        <span style={{ color: '#666' }}>Qty: </span>
                        <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                        <span style={{ marginLeft: '1rem', color: '#666' }}>Price: </span>
                        <span style={{ fontWeight: 600 }}>₹{item.price?.toFixed(2)}</span>
                      </p>
                    </Box>
                  ))}
                </Box>

                {/* Summary & Details */}
                <Box>
                  {/* Pricing */}
                  <Box sx={{ mb: 3 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Summary</h3>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <span style={{ color: '#666' }}>Subtotal</span>
                      <span style={{ fontWeight: 600 }}>₹{selectedOrder.pricing?.subtotal?.toFixed(2) || 0}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <span style={{ color: '#666' }}>Discount</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        -₹{selectedOrder.pricing?.discount?.toFixed(2) || 0}
                      </span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ color: '#666' }}>Delivery Fee</span>
                      <span style={{ fontWeight: 600 }}>₹{selectedOrder.pricing?.deliveryFee?.toFixed(2) || 0}</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700 }}>Grand Total</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>
                        ₹{selectedOrder.pricing?.grandTotal?.toFixed(2) || 0}
                      </span>
                    </Box>
                  </Box>

                  {/* Status */}
                  <Box sx={{ mb: 3 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Status</h3>
                    <Chip
                      label={selectedOrder.status?.replace(/_/g, ' ').toUpperCase()}
                      sx={{
                        backgroundColor: {
                          pending: '#f3f4f6',
                          confirmed: '#dbeafe',
                          packed: '#cffafe',
                          shipped: '#e0e7ff',
                          out_for_delivery: '#fef3c7',
                          delivered: '#dcfce7',
                          cancelled: '#fee2e2',
                        }[selectedOrder.status] || '#f3f4f6',
                        color: {
                          pending: '#374151',
                          confirmed: '#1e40af',
                          packed: '#0891b2',
                          shipped: '#4338ca',
                          out_for_delivery: '#b45309',
                          delivered: '#166534',
                          cancelled: '#991b1b',
                        }[selectedOrder.status] || '#374151',
                      }}
                    />
                  </Box>

                  {/* Customer */}
                  <Box sx={{ mb: 3 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Customer</h3>
                    <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>{selectedOrder.address?.fullName}</p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#666' }}>
                      📞 {selectedOrder.address?.phone || 'N/A'}
                    </p>
                  </Box>

                  {/* Delivery Address */}
                  <Box>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Delivery Address</h3>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#666' }}>
                      {selectedOrder.address?.line1}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#666' }}>
                      {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.pincode}
                    </p>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminOrders;
