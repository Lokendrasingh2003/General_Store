import PropTypes from 'prop-types';
import { Box, Button, Card, CardContent, CardMedia, Chip, Typography, Rating } from '@mui/material';
import WeightSelector from './WeightSelector';
import { useState } from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCart } from '../../../context/CartContext.jsx';

const getMeasureText = (product) => {
  if (!product) return '';
  if (product.category === 'household') return product.size || '';
  return product.weight || '';
};

const ProductCard = ({ product, fluid = false }) => {
  const { addToCart } = useCart();
  const imageUrl = product.images?.[0] || 'https://dummyimage.com/600x400/e2e8f0/64748b.png&text=No+Image';
  const salePrice = product.discountedPrice || product.price;
  const measure = getMeasureText(product);
  const [selectedWeight, setSelectedWeight] = useState(measure);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Calculate discount percentage
  const discountPercent = product.discountedPrice 
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  // Mock rating (can be replaced with real data later)
  const mockRating = 4 + Math.random();
  const mockReviews = Math.floor(Math.random() * 150) + 20;

  const handleAddToCart = () => {
    addToCart(product, 1, selectedWeight);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: fluid ? '100%' : { xs: 160, sm: 210, md: 230 },
        minWidth: { xs: 140, sm: 180 },
        maxWidth: { xs: 200, sm: 250 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        background: '#fff',
        boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.06)', sm: '0 4px 16px rgba(0,0,0,0.09)' },
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-6px)' },
          boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.10)', sm: '0 8px 24px rgba(0,0,0,0.15)' },
          borderColor: '#4a90e2'
        }
      }}
    >
      <CardMedia
        component="img"
        image={imageUrl}
        alt={product.name}
        sx={{
          height: { xs: 90, sm: 120, md: 150 },
          objectFit: 'cover',
          backgroundColor: '#f1f5f9',
          borderRadius: '0 0 12px 12px',
        }}
      />
      
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <Box sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: '#ff4757',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
          zIndex: 10
        }}>
          -{discountPercent}%
        </Box>
      )}
      
      {/* Stock Badge */}
      <Box sx={{
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: product.isAvailable ? '#2ed573' : '#e74c3c',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 700,
        zIndex: 10
      }}>
        {product.isAvailable ? 'In Stock' : 'Out'}
      </Box>
      
      <CardContent
        sx={{
          p: { xs: 0.7, sm: 1.1, md: 1.3 },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 0.5, sm: 0.8 },
          flexGrow: 1,
        }}
      >
        
        <Chip label={product.category} size="small" color="success" variant="outlined" sx={{ alignSelf: 'flex-start', textTransform: 'capitalize', fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.8rem' } }} />

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.15,
              mb: 0.2,
              fontSize: { xs: '0.85rem', sm: '1rem', md: '1.05rem' },
              wordBreak: 'break-word',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
            title={product.name}
          >
            {product.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
            title={product.brand}
          >
            {product.brand}
          </Typography>
        </Box>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Rating value={mockRating} precision={0.5} readOnly size="small" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
            ({mockReviews})
          </Typography>
        </Box>

        {/* Weight Selector */}
        {measure && (
          <WeightSelector 
            product={product} 
            onWeightChange={setSelectedWeight}
          />
        )}

        {/* Pricing */}
        <Box sx={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 0.6,
          backgroundColor: '#f9f9f9',
          padding: { xs: '5px', sm: '8px' },
          borderRadius: '6px'
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.1rem' }, color: '#2ed573' }}>
            ₹{salePrice}
          </Typography>
          {product.discountedPrice && (
            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>
              ₹{product.price}
            </Typography>
          )}
        </Box>

        {/* Add Button */}
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #f0f0f0', background: { xs: '#fafbfc', sm: 'transparent' } }}>
          <Button
            variant="contained"
            color="success"
            size="medium"
            fullWidth
            onClick={handleAddToCart}
            disabled={addedToCart || !product.isAvailable}
            startIcon={addedToCart ? <CheckCircleIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} /> : <ShoppingCartIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} />}
            sx={{
              py: { xs: 0.7, sm: 1 },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.9rem', sm: '1.05rem' },
              borderRadius: 2,
              backgroundColor: addedToCart ? '#26de81' : '#2ed573',
              '&:hover': {
                backgroundColor: addedToCart ? '#26de81' : '#26de81',
                transform: { xs: 'none', sm: 'scale(1.02)' }
              },
              '&:disabled': {
                backgroundColor: '#ccc',
                color: '#666'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {addedToCart ? 'Added!' : 'Add'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    weight: PropTypes.string,
    size: PropTypes.string,
    price: PropTypes.number.isRequired,
    discountedPrice: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string),
    isAvailable: PropTypes.bool
  }).isRequired,
  fluid: PropTypes.bool
};

export default ProductCard;
