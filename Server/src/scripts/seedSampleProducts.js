require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

const SEED_OWNER = {
  name: 'Demo Store Owner',
  email: 'demo.owner@generalstore.com',
  password: 'Demo@1234',
  phone: '9876543210',
  role: 'admin'
};

const SEED_SHOP = {
  shopName: 'General Store Demo Shop',
  ownerName: 'Demo Store Owner',
  email: 'demo.shop@generalstore.com',
  phone: '9123456789',
  type: 'groceries',
  address: {
    street: '12 Market Road',
    city: 'Indore',
    state: 'Madhya Pradesh',
    zipCode: '452001',
    country: 'India'
  }
};

const SAMPLE_PRODUCTS = [
  // KITCHEN - 16 products
  {
    name: 'Premium Basmati Rice',
    brand: 'Annapurna',
    description: 'Long grain premium basmati rice suitable for daily meals and special occasions.',
    category: 'kitchen',
    weight: '1kg',
    price: 180,
    discountedPrice: 165,
    images: ['https://dummyimage.com/600x400/f7e7b8/222222.jpg']
  },
  {
    name: 'Premium Basmati Rice Sella',
    brand: 'Aeroplane',
    description: 'Golden sella basmati rice with aromatic fragrance and superior taste.',
    category: 'kitchen',
    weight: '1kg',
    price: 350,
    discountedPrice: 315,
    images: ['https://dummyimage.com/600x400/f7d5a8/222222.jpg']
  },
  {
    name: 'Cold Pressed Mustard Oil',
    brand: 'Swaad',
    description: 'Pure mustard oil with rich aroma, ideal for cooking and traditional recipes.',
    category: 'kitchen',
    weight: '500g',
    price: 145,
    discountedPrice: 132,
    images: ['https://dummyimage.com/600x400/fdd835/222222.jpg']
  },
  {
    name: 'Cold Pressed Coconut Oil',
    brand: 'Coco Pure',
    description: 'Virgin coconut oil extracted from fresh coconuts, ideal for cooking and beauty.',
    category: 'kitchen',
    weight: '500g',
    price: 280,
    discountedPrice: 252,
    images: ['https://dummyimage.com/600x400/ffe0b2/222222.jpg']
  },
  {
    name: 'Refined Sunflower Oil',
    brand: 'Fortune',
    description: 'Light and healthy refined sunflower oil perfect for everyday cooking.',
    category: 'kitchen',
    weight: '1kg',
    price: 165,
    discountedPrice: 149,
    images: ['https://dummyimage.com/600x400/fdd835/222222.jpg']
  },
  {
    name: 'Organic Turmeric Powder',
    brand: 'Nature\'s Best',
    description: 'Pure organic turmeric powder with high curcumin content and natural warmth.',
    category: 'kitchen',
    weight: '250g',
    price: 95,
    discountedPrice: 85,
    images: ['https://dummyimage.com/600x400/ffb74d/222222.jpg']
  },
  {
    name: 'Red Chilly Powder',
    brand: 'Mirchi Magic',
    description: 'Premium red chilly powder with rich color and spicy flavor.',
    category: 'kitchen',
    weight: '100g',
    price: 65,
    discountedPrice: 58,
    images: ['https://dummyimage.com/600x400/ef5350/222222.jpg']
  },
  {
    name: 'Coriander Powder',
    brand: 'Spice Master',
    description: 'Fresh coriander powder with aromatic fragrance for all curry dishes.',
    category: 'kitchen',
    weight: '100g',
    price: 55,
    discountedPrice: 49,
    images: ['https://dummyimage.com/600x400/ab47bc/222222.jpg']
  },
  {
    name: 'Mixed Pulses',
    brand: 'Harvest Gold',
    description: 'Mixed dal variety including moong, masoor, chana for nutritious meals.',
    category: 'kitchen',
    weight: '1kg',
    price: 125,
    discountedPrice: 112,
    images: ['https://dummyimage.com/600x400/d2b48c/222222.jpg']
  },
  {
    name: 'Moong Dal',
    brand: 'Golden Valley',
    description: 'Premium moong dal free from stones, ideal for khichdi and dosa.',
    category: 'kitchen',
    weight: '1kg',
    price: 140,
    discountedPrice: 126,
    images: ['https://dummyimage.com/600x400/e8d4b0/222222.jpg']
  },
  {
    name: 'Masoor Dal Red',
    brand: 'Nation\'s Choice',
    description: 'Clean red masoor dal suitable for dal tadka and quick cooking.',
    category: 'kitchen',
    weight: '1kg',
    price: 120,
    discountedPrice: 108,
    images: ['https://dummyimage.com/600x400/daa520/222222.jpg']
  },
  {
    name: 'Black Chickpeas',
    brand: 'Farm Fresh',
    description: 'High quality black chickpeas rich in protein and fiber.',
    category: 'kitchen',
    weight: '500g',
    price: 95,
    discountedPrice: 85,
    images: ['https://dummyimage.com/600x400/8b6914/222222.jpg']
  },
  {
    name: 'White Rice Basmati',
    brand: 'Royal Choice',
    description: 'Pure white basmati rice grains with natural fragrance.',
    category: 'kitchen',
    weight: '1kg',
    price: 320,
    discountedPrice: 288,
    images: ['https://dummyimage.com/600x400/f5f5dc/222222.jpg']
  },
  {
    name: 'Brown Rice Organic',
    brand: 'Green Earth',
    description: 'Wholesome brown rice with natural fiber for healthy lifestyle.',
    category: 'kitchen',
    weight: '1kg',
    price: 110,
    discountedPrice: 99,
    images: ['https://dummyimage.com/600x400/cd853f/222222.jpg']
  },
  {
    name: 'Salt Rock Fine',
    brand: 'Pure Rock',
    description: 'Fine rock salt without additives, pure and natural.',
    category: 'kitchen',
    weight: '500g',
    price: 35,
    discountedPrice: 31,
    images: ['https://dummyimage.com/600x400/c0c0c0/222222.jpg']
  },
  {
    name: 'Cooking Ghee Pure',
    brand: 'Desi Ghee',
    description: 'Pure desi ghee made from quality butter, rich and aromatic.',
    category: 'kitchen',
    weight: '250g',
    price: 450,
    discountedPrice: 405,
    images: ['https://dummyimage.com/600x400/f4a460/222222.jpg']
  },

  // SNACKS - 16 products
  {
    name: 'Masala Peanut Mix',
    brand: 'Crunchy Bite',
    description: 'Spicy peanut snack blend with crispy texture, great for tea time munching.',
    category: 'snacks',
    weight: '250g',
    price: 90,
    discountedPrice: 79,
    images: ['https://dummyimage.com/600x400/ffcc80/222222.jpg']
  },
  {
    name: 'Classic Namkeen Sev',
    brand: 'SnackHub',
    description: 'Traditional savory sev made from gram flour with balanced spices.',
    category: 'snacks',
    weight: '100g',
    price: 45,
    discountedPrice: 39,
    images: ['https://dummyimage.com/600x400/f4b183/222222.jpg']
  },
  {
    name: 'Roasted Cashew Nuts',
    brand: 'NutsCraze',
    description: 'Premium roasted cashew nuts with natural crunch and rich taste.',
    category: 'snacks',
    weight: '250g',
    price: 380,
    discountedPrice: 342,
    images: ['https://dummyimage.com/600x400/d2b48c/222222.jpg']
  },
  {
    name: 'Roasted Almonds',
    brand: 'DryFruit King',
    description: 'Healthy roasted almonds packed with nutrients and great taste.',
    category: 'snacks',
    weight: '250g',
    price: 420,
    discountedPrice: 378,
    images: ['https://dummyimage.com/600x400/a89968/222222.jpg']
  },
  {
    name: 'Mixed Dry Fruits',
    brand: 'Premium Select',
    description: 'Mix of almonds, cashews, raisins, and pisachios in one pack.',
    category: 'snacks',
    weight: '250g',
    price: 520,
    discountedPrice: 468,
    images: ['https://dummyimage.com/600x400/8b7355/222222.jpg']
  },
  {
    name: 'Corn Chips Masala',
    brand: 'Snack Master',
    description: 'Crispy corn chips with tangy masala flavoring for instant satisfaction.',
    category: 'snacks',
    weight: '100g',
    price: 65,
    discountedPrice: 58,
    images: ['https://dummyimage.com/600x400/ffd700/222222.jpg']
  },
  {
    name: 'Potato Wafers Plain',
    brand: 'CrispyTime',
    description: 'Thin and crispy potato wafers with minimal salt, healthy snacking option.',
    category: 'snacks',
    weight: '250g',
    price: 55,
    discountedPrice: 49,
    images: ['https://dummyimage.com/600x400/f4a460/222222.jpg']
  },
  {
    name: 'Moong Dal Chikhalwali',
    brand: 'Taste Bites',
    description: 'Crispy moong dal snack with light and airy texture.',
    category: 'snacks',
    weight: '250g',
    price: 70,
    discountedPrice: 63,
    images: ['https://dummyimage.com/600x400/fffacd/222222.jpg']
  },
  {
    name: 'Chikhalwali Mix Savory',
    brand: 'Mixed Delight',
    description: 'Mix of chikhalwali, sev, and moong flavors in every bite.',
    category: 'snacks',
    weight: '250g',
    price: 85,
    discountedPrice: 76,
    images: ['https://dummyimage.com/600x400/ffd700/222222.jpg']
  },
  {
    name: 'Salted Wavey Chips',
    brand: 'Crispy Wave',
    description: 'Textured wavy chips with light salt seasoning.',
    category: 'snacks',
    weight: '100g',
    price: 50,
    discountedPrice: 45,
    images: ['https://dummyimage.com/600x400/daa520/222222.jpg']
  },
  {
    name: 'Honey Roasted Peanuts',
    brand: 'Sweet Crunch',
    description: 'Peanuts roasted with honey coating for sweet and savory combo.',
    category: 'snacks',
    weight: '250g',
    price: 110,
    discountedPrice: 99,
    images: ['https://dummyimage.com/600x400/daa520/222222.jpg']
  },
  {
    name: 'Jaggery Poppins',
    brand: 'Natural Sweet',
    description: 'Healthy snack made from jaggery and puffed rice, traditional taste.',
    category: 'snacks',
    weight: '250g',
    price: 75,
    discountedPrice: 67,
    images: ['https://dummyimage.com/600x400/cd853f/222222.jpg']
  },
  {
    name: 'Raisins Golden Premium',
    brand: 'Grape Valley',
    description: 'Sweet golden raisins perfect for snacking and baking.',
    category: 'snacks',
    weight: '250g',
    price: 180,
    discountedPrice: 162,
    images: ['https://dummyimage.com/600x400/8b4513/222222.jpg']
  },
  {
    name: 'Dates Black Ajwa',
    brand: 'Date Palace',
    description: 'Premium black Ajwa dates naturally sweet and energy-boosting.',
    category: 'snacks',
    weight: '250g',
    price: 250,
    discountedPrice: 225,
    images: ['https://dummyimage.com/600x400/2f1b0c/222222.jpg']
  },
  {
    name: 'Cashew Pieces Roasted',
    brand: 'Cashew Premium',
    description: 'Broken cashew pieces roasted to perfection for snacking.',
    category: 'snacks',
    weight: '250g',
    price: 280,
    discountedPrice: 252,
    images: ['https://dummyimage.com/600x400/d2b48c/222222.jpg']
  },
  {
    name: 'Chikky Brittle Peanut',
    brand: 'Crunch Factory',
    description: 'Peanut brittle candy with hard caramel coating, crunchy texture.',
    category: 'snacks',
    weight: '100g',
    price: 95,
    discountedPrice: 85,
    images: ['https://dummyimage.com/600x400/8b6914/222222.jpg']
  },

  // BEAUTY - 16 products
  {
    name: 'Herbal Face Wash',
    brand: 'GlowCare',
    description: 'Mild herbal face wash that helps cleanse skin and control excess oil.',
    category: 'beauty',
    weight: '100g',
    price: 120,
    discountedPrice: 105,
    images: ['https://dummyimage.com/600x400/c8e6c9/222222.jpg']
  },
  {
    name: 'Nourishing Body Lotion',
    brand: 'SoftSkin',
    description: 'Hydrating body lotion with light fragrance and non-sticky formulation.',
    category: 'beauty',
    weight: '250g',
    price: 210,
    discountedPrice: 189,
    images: ['https://dummyimage.com/600x400/e1bee7/222222.jpg']
  },
  {
    name: 'Charcoal Face Mask',
    brand: 'Pure Beauty',
    description: 'Deep cleansing charcoal mask that removes impurities and detoxifies skin.',
    category: 'beauty',
    weight: '100g',
    price: 180,
    discountedPrice: 162,
    images: ['https://dummyimage.com/600x400/3f3f3f/222222.jpg']
  },
  {
    name: 'Aloe Vera Gel Pure',
    brand: 'Nature\'s Essence',
    description: 'Pure aloe vera gel for skin soothing and natural hydration.',
    category: 'beauty',
    weight: '250g',
    price: 95,
    discountedPrice: 85,
    images: ['https://dummyimage.com/600x400/98fb98/222222.jpg']
  },
  {
    name: 'Moisturizing Night Cream',
    brand: 'LunaGlow',
    description: 'Rich night cream that repairs and rejuvenates skin while you sleep.',
    category: 'beauty',
    weight: '100g',
    price: 320,
    discountedPrice: 288,
    images: ['https://dummyimage.com/600x400/ffe4e1/222222.jpg']
  },
  {
    name: 'Anti-Aging Day Serum',
    brand: 'YouthElixir',
    description: 'Lightweight serum with vitamin C that fights wrinkles and brightens skin.',
    category: 'beauty',
    weight: '100g',
    price: 450,
    discountedPrice: 405,
    images: ['https://dummyimage.com/600x400/fff0f5/222222.jpg']
  },
  {
    name: 'Sunscreen SPF 30',
    brand: 'SunShield',
    description: 'Lightweight sunscreen that protects skin from UV rays without greasiness.',
    category: 'beauty',
    weight: '100g',
    price: 280,
    discountedPrice: 252,
    images: ['https://dummyimage.com/600x400/fffacd/222222.jpg']
  },
  {
    name: 'Lip Balm Hydrating',
    brand: 'LipCare Plus',
    description: 'Moisturizing lip balm with natural ingredients and pleasant flavor.',
    category: 'beauty',
    weight: '100g',
    price: 65,
    discountedPrice: 58,
    images: ['https://dummyimage.com/600x400/ffc0cb/222222.jpg']
  },
  {
    name: 'Hand Cream Nourishing',
    brand: 'SoftHands',
    description: 'Rich hand cream that prevents dryness and keeps hands soft and smooth.',
    category: 'beauty',
    weight: '100g',
    price: 140,
    discountedPrice: 126,
    images: ['https://dummyimage.com/600x400/f5deb3/222222.jpg']
  },
  {
    name: 'Hair Oil Coconut',
    brand: 'TressGold',
    description: 'Pure coconut hair oil that nourishes scalp and promotes hair growth.',
    category: 'beauty',
    weight: '250g',
    price: 150,
    discountedPrice: 135,
    images: ['https://dummyimage.com/600x400/ffe0b2/222222.jpg']
  },
  {
    name: 'Shampoo Herbal',
    brand: 'HairCare Natural',
    description: 'Gentle herbal shampoo that cleanses without harsh chemicals.',
    category: 'beauty',
    weight: '250g',
    price: 125,
    discountedPrice: 112,
    images: ['https://dummyimage.com/600x400/f0e68c/222222.jpg']
  },
  {
    name: 'Conditioner Moisturizing',
    brand: 'SilkyLocks',
    description: 'Deep conditioner that leaves hair soft, shiny and manageable.',
    category: 'beauty',
    weight: '250g',
    price: 130,
    discountedPrice: 117,
    images: ['https://dummyimage.com/600x400/deb887/222222.jpg']
  },
  {
    name: 'Face Toner Balancing',
    brand: 'SeabreezeBeauty',
    description: 'pH balancing toner that prepares skin for better absorption of serums.',
    category: 'beauty',
    weight: '250g',
    price: 160,
    discountedPrice: 144,
    images: ['https://dummyimage.com/600x400/f0e68c/222222.jpg']
  },
  {
    name: 'Makeup Remover Wipes',
    brand: 'CleanGlow',
    description: 'Gentle makeup remover wipes with soothing ingredients.',
    category: 'beauty',
    weight: '100g',
    price: 110,
    discountedPrice: 99,
    images: ['https://dummyimage.com/600x400/dda0dd/222222.jpg']
  },
  {
    name: 'Face Scrub Gentle',
    brand: 'PolishPure',
    description: 'Mild face scrub that removes dead skin without causing irritation.',
    category: 'beauty',
    weight: '100g',
    price: 135,
    discountedPrice: 121,
    images: ['https://dummyimage.com/600x400/f4a460/222222.jpg']
  },
  {
    name: 'Bath Salts Lavender',
    brand: 'RelaxSpa',
    description: 'Aromatic bath salts with lavender essence for relaxing bath time.',
    category: 'beauty',
    weight: '250g',
    price: 190,
    discountedPrice: 171,
    images: ['https://dummyimage.com/600x400/e6e6fa/222222.jpg']
  },

  // BAKERY - 16 products
  {
    name: 'Whole Wheat Bread',
    brand: 'BakeFresh',
    description: 'Soft whole wheat bread loaf prepared for healthy breakfast and snacks.',
    category: 'bakery',
    weight: '500g',
    price: 55,
    discountedPrice: 49,
    images: ['https://dummyimage.com/600x400/d7b899/222222.jpg']
  },
  {
    name: 'Butter Cookies Pack',
    brand: 'CookieCraft',
    description: 'Crispy butter cookies with classic taste, perfect for tea and gifting.',
    category: 'bakery',
    weight: '250g',
    price: 130,
    discountedPrice: 118,
    images: ['https://dummyimage.com/600x400/f5d6a1/222222.jpg']
  },
  {
    name: 'White Sandwich Bread',
    brand: 'FreshBake',
    description: 'Soft white bread perfect for sandwiches and toasts.',
    category: 'bakery',
    weight: '500g',
    price: 50,
    discountedPrice: 45,
    images: ['https://dummyimage.com/600x400/fff8dc/222222.jpg']
  },
  {
    name: 'Multigrain Bread',
    brand: 'HealthyGrain',
    description: 'Nutritious multigrain bread with seeds and whole grains.',
    category: 'bakery',
    weight: '500g',
    price: 75,
    discountedPrice: 67,
    images: ['https://dummyimage.com/600x400/8b6914/222222.jpg']
  },
  {
    name: 'Rusk Biscuits Pack',
    brand: 'CrispyMorning',
    description: 'Crunchy rusk biscuits perfect for tea and coffee time.',
    category: 'bakery',
    weight: '250g',
    price: 85,
    discountedPrice: 76,
    images: ['https://dummyimage.com/600x400/daa520/222222.jpg']
  },
  {
    name: 'Digestive Biscuits',
    brand: 'GoodHealth',
    description: 'Plain digestive biscuits with whole grain goodness.',
    category: 'bakery',
    weight: '250g',
    price: 95,
    discountedPrice: 85,
    images: ['https://dummyimage.com/600x400/cd853f/222222.jpg']
  },
  {
    name: 'Chocolate Chip Cookies',
    brand: 'ChocoBites',
    description: 'Soft cookies loaded with chocolate chips, delightful flavor.',
    category: 'bakery',
    weight: '250g',
    price: 145,
    discountedPrice: 130,
    images: ['https://dummyimage.com/600x400/8b4513/222222.jpg']
  },
  {
    name: 'Oatmeal Cookies',
    brand: 'OatMaster',
    description: 'Healthy oatmeal cookies with natural oats and raisins.',
    category: 'bakery',
    weight: '250g',
    price: 120,
    discountedPrice: 108,
    images: ['https://dummyimage.com/600x400/f4a460/222222.jpg']
  },
  {
    name: 'Marie Biscuits Gold',
    brand: 'GoldenCrisp',
    description: 'Classic marie biscuits with delicate texture and sweet taste.',
    category: 'bakery',
    weight: '250g',
    price: 75,
    discountedPrice: 67,
    images: ['https://dummyimage.com/600x400/f5deb3/222222.jpg']
  },
  {
    name: 'Croissant Butter',
    brand: 'FrenchBake',
    description: 'Flaky butter croissants with rich and buttery taste.',
    category: 'bakery',
    weight: '100g',
    price: 65,
    discountedPrice: 58,
    images: ['https://dummyimage.com/600x400/daa520/222222.jpg']
  },
  {
    name: 'Muffin Chocolate Pack',
    brand: 'SweetBaker',
    description: 'Soft chocolate muffins perfect for breakfast or snack time.',
    category: 'bakery',
    weight: '250g',
    price: 110,
    discountedPrice: 99,
    images: ['https://dummyimage.com/600x400/8b4513/222222.jpg']
  },
  {
    name: 'Cake Mix Vanilla',
    brand: 'HomeBaker',
    description: 'Easy vanilla cake mix for quick homemade baking.',
    category: 'bakery',
    weight: '250g',
    price: 85,
    discountedPrice: 76,
    images: ['https://dummyimage.com/600x400/fff0f5/222222.jpg']
  },
  {
    name: 'Rye Bread Dark',
    brand: 'DarkGrain',
    description: 'Dense and nutritious rye bread with distinct flavor.',
    category: 'bakery',
    weight: '500g',
    price: 95,
    discountedPrice: 85,
    images: ['https://dummyimage.com/600x400/3f3f3f/222222.jpg']
  },
  {
    name: 'Sourdough Bread',
    brand: 'ArtisanBake',
    description: 'Tangy sourdough bread with chewy texture and complex flavor.',
    category: 'bakery',
    weight: '500g',
    price: 120,
    discountedPrice: 108,
    images: ['https://dummyimage.com/600x400/a0826d/222222.jpg']
  },
  {
    name: 'Biscotti Almond',
    brand: 'ItalianStyle',
    description: 'Twice-baked almond biscotti, hard texture perfect for dunking.',
    category: 'bakery',
    weight: '250g',
    price: 135,
    discountedPrice: 121,
    images: ['https://dummyimage.com/600x400/daa520/222222.jpg']
  },
  {
    name: 'Pita Bread Pack',
    brand: 'MiddleEast',
    description: 'Soft pita bread perfect for wraps and sandwiches.',
    category: 'bakery',
    weight: '250g',
    price: 105,
    discountedPrice: 94,
    images: ['https://dummyimage.com/600x400/d7b899/222222.jpg']
  },

  // HOUSEHOLD - 16 products
  {
    name: 'Floor Cleaner Citrus',
    brand: 'HomeShield',
    description: 'Citrus based floor cleaner designed for effective stain and odor removal.',
    category: 'household',
    size: '1L',
    price: 175,
    discountedPrice: 160,
    images: ['https://dummyimage.com/600x400/b3e5fc/222222.jpg']
  },
  {
    name: 'Dishwash Liquid Lemon',
    brand: 'Sparkle',
    description: 'Powerful dishwash liquid that removes grease while being gentle on hands.',
    category: 'household',
    size: '500ml',
    price: 99,
    discountedPrice: 88,
    images: ['https://dummyimage.com/600x400/ffe082/222222.jpg']
  },
  {
    name: 'Glass Cleaner Spray',
    brand: 'ClearVision',
    description: 'Streak-free glass cleaner for crystal clear windows and mirrors.',
    category: 'household',
    size: '500ml',
    price: 145,
    discountedPrice: 130,
    images: ['https://dummyimage.com/600x400/e0ffff/222222.jpg']
  },
  {
    name: 'All Purpose Cleaner',
    brand: 'CleanPro',
    description: 'Multi-surface cleaner suitable for kitchen, bathroom, and floors.',
    category: 'household',
    size: '1L',
    price: 125,
    discountedPrice: 112,
    images: ['https://dummyimage.com/600x400/f0f8ff/222222.jpg']
  },
  {
    name: 'Toilet Cleaner Powerful',
    brand: 'PureSanitary',
    description: 'Powerful toilet bowl cleaner with disinfectant properties.',
    category: 'household',
    size: '500ml',
    price: 95,
    discountedPrice: 85,
    images: ['https://dummyimage.com/600x400/87ceeb/222222.jpg']
  },
  {
    name: 'Laundry Detergent Powder',
    brand: 'WashWell',
    description: 'Effective laundry detergent that removes tough stains and brightens clothes.',
    category: 'household',
    size: '1L',
    price: 270,
    discountedPrice: 243,
    images: ['https://dummyimage.com/600x400/ffc0cb/222222.jpg']
  },
  {
    name: 'Fabric Softener',
    brand: 'SoftTexture',
    description: 'Liquid fabric softener that makes clothes soft and fragrant.',
    category: 'household',
    size: '1L',
    price: 195,
    discountedPrice: 175,
    images: ['https://dummyimage.com/600x400/dda0dd/222222.jpg']
  },
  {
    name: 'Disinfectant Liquid',
    brand: 'SafeGuard',
    description: 'Strong disinfectant liquid for killing 99.9% of germs and bacteria.',
    category: 'household',
    size: '500ml',
    price: 130,
    discountedPrice: 117,
    images: ['https://dummyimage.com/600x400/ffb6c1/222222.jpg']
  },
  {
    name: 'Air Freshener Spray',
    brand: 'FreshAir',
    description: 'Long-lasting air freshener with pleasant floral fragrance.',
    category: 'household',
    size: '250ml',
    price: 110,
    discountedPrice: 99,
    images: ['https://dummyimage.com/600x400/ffffe0/222222.jpg']
  },
  {
    name: 'Trash Bags Heavy Duty',
    brand: 'DuraPack',
    description: 'Strong trash bags that prevent tearing and leaking.',
    category: 'household',
    size: '250ml',
    price: 85,
    discountedPrice: 76,
    images: ['https://dummyimage.com/600x400/808080/222222.jpg']
  },
  {
    name: 'Paper Towels Roll',
    brand: 'Absorbmax',
    description: 'Highly absorbent paper towels for kitchen cleaning.',
    category: 'household',
    size: '250ml',
    price: 95,
    discountedPrice: 85,
    images: ['https://dummyimage.com/600x400/f0e68c/222222.jpg']
  },
  {
    name: 'Steel Wool Scrubber',
    brand: 'ScrubPro',
    description: 'Durable steel wool scrubber for tough stains on cookware.',
    category: 'household',
    size: '250ml',
    price: 75,
    discountedPrice: 67,
    images: ['https://dummyimage.com/600x400/a9a9a9/222222.jpg']
  },
  {
    name: 'Broom and Dustpan Set',
    brand: 'CleanMate',
    description: 'Sturdy broom and dustpan combo for effective floor cleaning.',
    category: 'household',
    size: '1L',
    price: 180,
    discountedPrice: 162,
    images: ['https://dummyimage.com/600x400/8b8b83/222222.jpg']
  },
  {
    name: 'Mop and Bucket Set',
    brand: 'WetClean',
    description: 'Complete mop and bucket set with wringer for wet floor cleaning.',
    category: 'household',
    size: '2L',
    price: 220,
    discountedPrice: 198,
    images: ['https://dummyimage.com/600x400/696969/222222.jpg']
  },
  {
    name: 'Rubber Gloves Latex',
    brand: 'HandSafe',
    description: 'Protective rubber gloves for cleaning and kitchen tasks.',
    category: 'household',
    size: '250ml',
    price: 65,
    discountedPrice: 58,
    images: ['https://dummyimage.com/600x400/ff69b4/222222.jpg']
  },
  {
    name: 'Sponge Scrubber Pack',
    brand: 'SpongePro',
    description: 'Durable kitchen sponges with scrubber side for effective cleaning.',
    category: 'household',
    size: '500ml',
    price: 70,
    discountedPrice: 63,
    images: ['https://dummyimage.com/600x400/ffb6c1/222222.jpg']
  }
];

const connectDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/general_store';
  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000
  });
};

const ensureSeedOwner = async () => {
  let owner = await User.findOne({ email: SEED_OWNER.email });

  if (!owner) {
    owner = await User.create(SEED_OWNER);
    return owner;
  }

  return owner;
};

const ensureSeedShop = async (ownerId) => {
  let shop = await Shop.findOne({ email: SEED_SHOP.email });

  if (!shop) {
    shop = await Shop.create({
      ...SEED_SHOP,
      ownerId
    });
    return shop;
  }

  shop.ownerId = ownerId;
  shop.ownerName = SEED_SHOP.ownerName;
  shop.shopName = SEED_SHOP.shopName;
  shop.phone = SEED_SHOP.phone;
  shop.type = SEED_SHOP.type;
  shop.address = SEED_SHOP.address;
  await shop.save();
  return shop;
};

const seedProducts = async (shopId) => {
  let created = 0;
  let updated = 0;

  for (const productData of SAMPLE_PRODUCTS) {
    const existingProduct = await Product.findOne({
      name: productData.name,
      shopId
    });

    if (!existingProduct) {
      await Product.create({
        ...productData,
        shopId,
        isAvailable: true
      });
      created += 1;
      continue;
    }

    existingProduct.brand = productData.brand;
    existingProduct.description = productData.description;
    existingProduct.category = productData.category;
    existingProduct.weight = productData.weight;
    existingProduct.size = productData.size;
    existingProduct.price = productData.price;
    existingProduct.discountedPrice = productData.discountedPrice;
    existingProduct.images = productData.images;
    existingProduct.isAvailable = true;
    await existingProduct.save();
    updated += 1;
  }

  const totalProducts = await Product.countDocuments({ shopId });
  await Shop.findByIdAndUpdate(shopId, { totalProducts });

  return { created, updated, totalProducts };
};

const run = async () => {
  try {
    await connectDatabase();

    const owner = await ensureSeedOwner();
    const shop = await ensureSeedShop(owner._id);
    const result = await seedProducts(shop._id);

    console.log('✅ Sample products seeded successfully');
    console.log(`Shop: ${shop.shopName}`);
    console.log(`Created: ${result.created}`);
    console.log(`Updated: ${result.updated}`);
    console.log(`Total products in shop: ${result.totalProducts}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
