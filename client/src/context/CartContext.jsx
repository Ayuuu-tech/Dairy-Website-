import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.productId && item.variantLabel === product.variantLabel);
      if (existing) {
        return prev.map(item =>
          item.productId === product.productId && item.variantLabel === product.variantLabel
            ? { ...item, qty: item.qty + (product.qty || 1) }
            : item
        );
      }
      return [...prev, { ...product, qty: product.qty || 1 }];
    });
  };

  const updateQuantity = (productId, variantLabel, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.productId === productId && item.variantLabel === variantLabel) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId, variantLabel) => {
    setCartItems(prev => prev.filter(item => !(item.productId === productId && item.variantLabel === variantLabel)));
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = subtotal > 0 && subtotal < 500 ? 50 : 0;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, updateQuantity, removeFromCart, clearCart,
      subtotal, deliveryFee, total
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
