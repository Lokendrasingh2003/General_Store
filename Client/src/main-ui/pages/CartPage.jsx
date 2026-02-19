import { Box, Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import MainHeader from '../components/Header/MainHeader.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useState } from 'react';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const [promo, setPromo] = useState('');

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const deliveryCharge = totalPrice > 500 ? 0 : 50;
  const gstAmount = Math.round(totalPrice * 0.05);
  const finalTotal = totalPrice + gstAmount + deliveryCharge;

  const handleQuantityChange = (productId, weight, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, weight, newQuantity);
    }
  };

  const handleRemove = (productId, weight) => {
    removeFromCart(productId, weight);
  };

  if (cartItems.length === 0) {
    return (
      <Box sx={{ pb: 4 }}>
        <MainHeader />
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
              Your Cart is Empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start shopping now and add items to your cart!
            </Typography>
            <Button variant="contained" color="success" component={RouterLink} to="/">
              Continue Shopping
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <MainHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
          Shopping Cart ({totalItems} items)
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Cart Items */}
          <Box flex={{ xs: 1, md: 2 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Weight</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Price</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={`${item._id}-${item.weight}`} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Box component="img" src={item.image} alt={item.name} sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.brand}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{item.weight}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                          ₹{item.price}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ minWidth: 'auto', width: 32, height: 32, p: 0 }}
                            onClick={() => handleQuantityChange(item._id, item.weight, item.quantity - 1)}
                          >
                            −
                          </Button>
                          <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ minWidth: 'auto', width: 32, height: 32, p: 0 }}
                            onClick={() => handleQuantityChange(item._id, item.weight, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          ₹{item.price * item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          variant="text" 
                          color="error" 
                          size="small"
                          onClick={() => handleRemove(item._id, item.weight)}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Order Summary */}
          <Box sx={{ flex: { xs: 1, md: 1 }, minWidth: 300 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Order Summary
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal ({totalItems} items)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ₹{totalPrice}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Delivery Charge
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: deliveryCharge === 0 ? 'success.main' : 'text.primary' }}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    GST (5%)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ₹{gstAmount}
                  </Typography>
                </Box>

                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Total
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main', fontSize: '1.2rem' }}>
                    ₹{finalTotal}
                  </Typography>
                </Box>
              </Stack>

              <Button variant="contained" color="success" fullWidth size="large" sx={{ mb: 2 }}>
                Proceed to Checkout
              </Button>
              <Button variant="outlined" color="inherit" fullWidth component={RouterLink} to="/">
                Continue Shopping
              </Button>
            </Paper>

            {/* Promo Code */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Have a Promo Code?
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <input 
                  type="text" 
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Enter code"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
                <Button variant="outlined" size="small">
                  Apply
                </Button>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CartPage;
