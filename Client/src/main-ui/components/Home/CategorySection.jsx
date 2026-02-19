import PropTypes from 'prop-types';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ProductCard from '../Product/ProductCard.jsx';

const categoryLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const CategorySection = ({ category, products }) => {
  const scrollContainerId = `scroll-${category}`;

  const slide = (direction) => {
    const element = document.getElementById(scrollContainerId);
    if (!element) return;

    const amount = direction === 'left' ? -450 : 450;
    element.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'capitalize', fontSize: { xs: '1.2rem', md: '1.45rem' } }}>
            {categoryLabel(category)}
          </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            component={RouterLink}
            to={`/category/${category}`}
            sx={{ fontWeight: 700, color: 'text.secondary', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            View All
          </Typography>

          <IconButton onClick={() => slide('left')} sx={{ bgcolor: 'grey.100', borderRadius: 2, '&:hover': { bgcolor: 'grey.200' } }}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={() => slide('right')} sx={{ bgcolor: 'grey.100', borderRadius: 2, '&:hover': { bgcolor: 'grey.200' } }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

        <Box id={scrollContainerId} sx={{ display: 'flex', gap: 1.8, overflowX: 'auto', pb: 0.5, scrollBehavior: 'smooth', '&::-webkit-scrollbar': { height: 7 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#d1d5db', borderRadius: 999 } }}>
          {products.map((product) => (
            <ProductCard key={product._id || `${category}-${product.name}`} product={product} />
          ))}
        </Box>
      </Stack>
    </Box>
  );
};

CategorySection.propTypes = {
  category: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default CategorySection;
