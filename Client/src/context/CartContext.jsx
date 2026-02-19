import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedWeight = null) => {
    const cartItem = {
      _id: product._id,
      name: product.name,
      brand: product.brand,
      price: product.discountedPrice || product.price,
      originalPrice: product.price,
      image: product.images?.[0] || 'https://dummyimage.com/600x400/e2e8f0/64748b.png&text=No+Image',
      category: product.category,
      weight: selectedWeight || product.weight || product.size,
      quantity,
      shopId: product.shopId
    };

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item._id === cartItem._id && item.weight === cartItem.weight
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === cartItem._id && item.weight === cartItem.weight
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, cartItem];
    });

    return true;
  };

  const removeFromCart = (productId, weight = null) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item._id === productId && (weight === null || item.weight === weight))
      )
    );
  };

  const updateQuantity = (productId, weight, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId && item.weight === weight
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
