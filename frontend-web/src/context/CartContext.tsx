import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { cartAPI, productsAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

interface CartContextType {
  items: CartItemWithProduct[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    if (!isAuthenticated || !user) {
      setItems([]);
      setItemCount(0);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    try {
      const [itemsResponse, countResponse, totalResponse] = await Promise.all([
        cartAPI.getItems(user.userId),
        cartAPI.getCount(user.userId),
        cartAPI.getTotal(user.userId),
      ]);

      const cartItems = itemsResponse.data;
      
      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const productResponse = await productsAPI.getById(item.productId);
            return { ...item, product: productResponse.data };
          } catch (error) {
            console.error('Error fetching product:', error);
            return item;
          }
        })
      );

      setItems(itemsWithProducts);
      setItemCount(countResponse.data);
      setTotal(totalResponse.data);
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, user]);

  const addItem = async (productId: string, quantity: number) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await cartAPI.addItem(user.userId, productId, quantity);
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const updateItem = async (productId: string, quantity: number) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      if (quantity <= 0) {
        await removeItem(productId);
      } else {
        await cartAPI.updateItem(user.userId, productId, quantity);
        await refreshCart();
      }
    } catch (error) {
      throw error;
    }
  };

  const removeItem = async (productId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await cartAPI.removeItem(user.userId, productId);
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await cartAPI.clear(user.userId);
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const value: CartContextType = {
    items,
    itemCount,
    total,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
