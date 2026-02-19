import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import SavingsIcon from '@mui/icons-material/Savings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const benefits = [
  {
    icon: LocalShippingIcon,
    title: 'Free Delivery',
    description: 'On orders above ₹500',
    color: '#667eea'
  },
  {
    icon: VerifiedIcon,
    title: '100% Fresh',
    description: 'Quality guaranteed products',
    color: '#764ba2'
  },
  {
    icon: SavingsIcon,
    title: 'Best Prices',
    description: 'Unbeatable deals everyday',
    color: '#FF6B6B'
  },
  {
    icon: SupportAgentIcon,
    title: '24/7 Support',
    description: 'Always here to help you',
    color: '#FFD93D'
  }
];

const BenefitsSection = () => {
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {benefits.map((benefit, index) => {
          const IconComponent = benefit.icon;
          return (
            <Grid item xs={6} md={3} key={index}>
              <Stack 
                spacing={1.5}
                sx={{
                  textAlign: 'center',
                  p: { xs: 1.5, md: 2.5 },
                  borderRadius: 2.5,
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: { xs: 60, md: 70 },
                    height: { xs: 60, md: 70 },
                    backgroundColor: `${benefit.color}20`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <IconComponent 
                    sx={{ 
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      color: benefit.color
                    }} 
                  />
                </Box>
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography 
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}
                >
                  {benefit.description}
                </Typography>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default BenefitsSection;
