import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../../components/Header/MainHeader';
import ToastMessage from '../../components/common/ToastMessage';
import { useTimedToast } from '../../hooks/useTimedToast';
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
  Button,
  Chip,
} from '@mui/material';
import { Lock as LockIcon, LockOpen as LockOpenIcon } from '@mui/icons-material';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useTimedToast(3000);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      showToast('Access denied. Admin only.', 'error');
      setTimeout(() => navigate('/'), 1500);
      return;
    }

    // For now, we'll fetch users from the backend
    // Since we don't have a dedicated endpoint yet, we'll use mock data
    let cancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      try {
        // Try to fetch users from backend
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setUsers(Array.isArray(data.data) ? data.data : []);
          }
        } else {
          // Fallback to empty if endpoint doesn't exist
          if (!cancelled) {
            setUsers([]);
          }
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [navigate, showToast]);

  const handleToggleActive = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user status');
      }

      const result = await response.json();
      setUsers(
        users.map((user) =>
          user.id === userId ? result.data : user
        )
      );
      showToast(result.message || 'User status updated', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update user status', 'error');
    }
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
            <h1 className="mt-2 font-display text-3xl font-bold text-stone-900">Users</h1>
          </div>
        </div>

        {/* Users Table */}
        <Box sx={{ mt: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Box sx={{ fontSize: '3rem', mb: 2 }}>👥</Box>
              <Box sx={{ fontSize: '1.2rem', fontWeight: 600, color: '#333' }}>No users found yet</Box>
              <Box sx={{ fontSize: '0.85rem', color: '#666', mt: 1 }}>Users will appear here after they sign up</Box>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1f2937' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#1f2937' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f0f4ff' }, borderBottom: '1px solid #e5e7eb' }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👤
                          </Box>
                          {user.name}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          sx={{
                            backgroundColor: user.role === 'admin' ? '#e9d5ff' : '#dbeafe',
                            color: user.role === 'admin' ? '#6b21a8' : '#1e40af',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          sx={{
                            backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                            color: user.isActive ? '#166534' : '#991b1b',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={user.isActive ? <LockIcon /> : <LockOpenIcon />}
                          onClick={() => handleToggleActive(user.id)}
                          color={user.isActive ? 'error' : 'success'}
                          sx={{ textTransform: 'none' }}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
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

export default AdminUsers;
