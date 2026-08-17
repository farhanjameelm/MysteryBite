import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (food, quantity = 1, customizations = []) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => item.food._id === food._id && 
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
      );

      if (existingItem) {
        toast.success(`Updated ${food.name} quantity in cart`);
        return prevCart.map(item =>
          item.food._id === food._id && 
          JSON.stringify(item.customizations) === JSON.stringify(customizations)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      toast.success(`Added ${food.name} to cart`);
      return [...prevCart, { food, quantity, customizations }];
    });
  };

  const removeFromCart = (foodId, customizations = []) => {
    setCart(prevCart => {
      const filtered = prevCart.filter(
        item => !(item.food._id === foodId && 
        JSON.stringify(item.customizations) === JSON.stringify(customizations))
      );
      toast.success('Item removed from cart');
      return filtered;
    });
  };

  const updateQuantity = (foodId, quantity, customizations = []) => {
    if (quantity <= 0) {
      removeFromCart(foodId, customizations);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.food._id === foodId && 
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  const cartTotal = cart.reduce((total, item) => {
    if (!item.food || !item.food.price) return total;
    return total + (item.food.price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
