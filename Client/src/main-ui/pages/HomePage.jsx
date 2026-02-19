import { Alert, Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import MainHeader from '../components/Header/MainHeader.jsx';
import CategorySection from '../components/Home/CategorySection.jsx';
import { CATEGORY_ORDER, fetchHomeCategoryProducts } from '../services/productsApi.js';

const categoryLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const HomePage = () => {
  const [categoryProducts, setCategoryProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchHomeCategoryProducts(8);
        setCategoryProducts(data);
      } catch (apiError) {
        setError('Categories load nahi ho pa rahi. Backend service check karein.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f7f7f7' }}>
      <MainHeader />

      {/* Shop by Category Section */}
      <Box sx={{ width: '100%', py: 3, backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ fontWeight: 700, fontSize: { xs: '1.2rem', md: '1.5rem' }, mb: 1 }}
            >
              Popular Products
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.98rem', maxWidth: 500, mx: 'auto' }}
            >
              Browse our handpicked collection from each category
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ py: 5, display: 'grid', placeItems: 'center' }}>
              <CircularProgress color="success" size={36} />
            </Box>
          ) : null}

          {!isLoading && error ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Alert severity="error" sx={{ maxWidth: 500, width: '100%' }}>{error}</Alert>
            </Box>
          ) : null}

          {!isLoading && !error ? (
            <Stack spacing={3}>
              {CATEGORY_ORDER.map((category) => {
                const products = categoryProducts[category] || [];
                if (!products.length) {
                  return (
                    <Box 
                      key={category} 
                      sx={{ border: '1px dashed #ccc', borderRadius: 2, p: 2, backgroundColor: '#fafafa' }}
                    >
                      <Typography 
                        variant="subtitle1" 
                        sx={{ mb: 0.5, textTransform: 'capitalize', fontWeight: 600 }}
                      >
                        {categoryLabel(category)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Products coming soon...
                      </Typography>
                    </Box>
                  );
                }
                return (
                  <Box key={category}>
                    <CategorySection category={category} products={products} />
                  </Box>
                );
              })}
            </Stack>
          ) : null}
        </Container>
      </Box>

      

      {/* Footer Section */}
      <Box sx={{ width: '100%', py: 2, backgroundColor: '#2c3e50', color: 'white', mt: 2 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem' } }}>
              © 2026 General Store. All Rights Reserved.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: { xs: '0.75rem', md: '0.85rem' } }}>
              Fresh Groceries Delivered to Your Doorstep | 24/7 Customer Support Available
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
