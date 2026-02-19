import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import cartLogo from '../../assets/cart-logo.svg';
import { useCart } from '../../../context/CartContext.jsx';
import { useState } from 'react';

const categoryItems = ['kitchen', 'snacks', 'beauty', 'bakery', 'household'];

const MainHeader = () => {
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const cartCount = getTotalItems();

  const handleCategoryClick = (category) => {
    navigate(`/category/${category}`);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderTop: '3px solid',
        borderColor: 'success.main',
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        backdropFilter: 'blur(8px)',
        backgroundColor: alpha('#ffffff', 0.96)
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, md: 3 } }}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 'auto', md: 82 },
            py: { xs: 1, md: 0 },
            gap: { xs: 1, md: 1.8 },
            flexWrap: { xs: 'wrap', md: 'nowrap' }
          }}
        >
          <Box 
            component={RouterLink}
            to="/"
            sx={{ minWidth: { xs: 96, sm: 110, md: 150 }, cursor: 'pointer' }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
              General
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.3, color: 'text.primary', fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
              STORE
            </Typography>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Search for Products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
            sx={{
              maxWidth: { xs: '100%', md: 760 },
              flex: { md: 1 },
              order: { xs: 3, md: 0 },
              flexBasis: { xs: '100%', md: 'auto' },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: `0 1px 0 ${alpha('#0f172a', 0.04)}`
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              )
            }}
          />

          <Paper
            variant="outlined"
            sx={{
              display: { xs: 'none', md: 'flex' },
              px: 1.4,
              py: 0.9,
              minWidth: { md: 150, lg: 190 },
              flexDirection: 'column'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.dark', lineHeight: 1.2 }}>
              Deliver Today
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select Location
            </Typography>
          </Paper>

          <Button
            component={RouterLink}
            to="/sign-in"
            variant="contained"
            color="inherit"
            size="small"
            sx={{
              px: 1.2,
              minWidth: { xs: 92, md: 118 },
              height: { xs: 40, md: 44 },
              fontSize: { xs: '0.68rem', md: '0.76rem' },
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: 'grey.900',
              color: 'common.white',
              lineHeight: 1.05,
              borderRadius: 1.1,
              textAlign: 'center',
              whiteSpace: 'normal',
              '&:hover': { bgcolor: 'grey.800' },
              '& .topText': {
                color: '#e2f0ff'
              },
              '& .bottomText': {
                color: '#ffffff'
              }
            }}
          >
            <Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box component="span" className="topText">Login/ Sign</Box>
              <Box component="span" className="bottomText">Up</Box>
            </Box>
          </Button>

          <IconButton 
            color="error" 
            aria-label="cart"
            onClick={handleCartClick}
            sx={{
              position: 'relative',
              '&:hover': {
                backgroundColor: alpha('#ff4444', 0.1)
              }
            }}
          >
            <Badge 
              badgeContent={cartCount} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  right: -3,
                  top: 13,
                  border: `2px solid white`,
                  padding: '0 4px',
                }
              }}
            >
              <Box component="img" src={cartLogo} alt="Cart" sx={{ width: { xs: 22, md: 26 }, height: { xs: 22, md: 26 }, display: 'block' }} />
            </Badge>
          </IconButton>
        </Toolbar>

        <Divider />

        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 52, md: 60 },
            gap: { xs: 1, md: 1.6 },
            px: { xs: 0.5, md: 0 },
            justifyContent: { xs: 'flex-start', md: 'center' },
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollSnapType: 'x proximity'
          }}
        >
          {categoryItems.map((item) => (
            <Button
              key={item}
              onClick={() => handleCategoryClick(item)}
              variant="outlined"
              color="inherit"
              sx={{
                px: { xs: 1.6, md: 2.2 },
                py: 0.75,
                borderRadius: 999,
                borderColor: 'divider',
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
                minWidth: { xs: 96, md: 120 },
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'success.main',
                  color: 'success.main',
                  backgroundColor: 'rgba(34, 197, 94, 0.06)'
                }
              }}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Button>
          ))}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default MainHeader;
