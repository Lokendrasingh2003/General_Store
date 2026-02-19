import { Alert, Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainHeader from '../components/Header/MainHeader.jsx';
import ProductCard from '../components/Product/ProductCard.jsx';
import { CATEGORY_ORDER, fetchProductsByCategory } from '../services/productsApi.js';

const categoryLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const CategoryPage = () => {
  const { category } = useParams();
  const selectedCategory = String(category || '').toLowerCase();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!CATEGORY_ORDER.includes(selectedCategory)) {
        setError('Invalid category.');
        setIsLoading(false);
        return;
      }

      try {
        setError('');
        setIsLoading(true);
        const data = await fetchProductsByCategory(selectedCategory);
        setProducts(data);
      } catch (apiError) {
        setError('Category products load nahi ho pa rahe.');
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [selectedCategory]);

  return (
    <Box sx={{ pb: { xs: 4, md: 6 } }}>
      <MainHeader />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, textTransform: 'capitalize', mb: 0.7 }}>
          {categoryLabel(selectedCategory)} Products
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.2 }}>
          Total items: {products.length}
        </Typography>

        {isLoading ? (
          <Box sx={{ py: 7, display: 'grid', placeItems: 'center' }}>
            <CircularProgress color="success" />
          </Box>
        ) : null}

        {!isLoading && error ? <Alert severity="error">{error}</Alert> : null}

        {!isLoading && !error ? (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id || product.name}>
                <ProductCard product={product} fluid />
              </Grid>
            ))}
          </Grid>
        ) : null}
      </Container>
    </Box>
  );
};

export default CategoryPage;
