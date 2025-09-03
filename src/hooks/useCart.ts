import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CartItem } from '@/lib/types';
import { cartService } from '@/services/cartService';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CartState {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
}

export function useCart() {
  const [{ cartItems, loading, error }, setState] = useState<CartState>({
    cartItems: [],
    loading: false,
    error: null,
  });

  const { isAuthenticated, loading: authLoading } = useAuth();
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Track previous auth state to detect changes
  const prevAuthStateRef = useRef(isAuthenticated);

  console.log('useCart render - cartItems:', cartItems.length, 'loading:', loading, 'authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Helper functions with stable references
  const setLoading = useCallback((value: boolean) => {
    if (!mountedRef.current) return;
    console.log('Setting loading to:', value);
    setState(prev => ({ ...prev, loading: value }));
  }, []);
  
  const setError = useCallback((msg: string | null) => {
    if (!mountedRef.current) return;
    console.log('Setting error to:', msg);
    setState(prev => ({ ...prev, error: msg }));
  }, []);

  // Stable fetchCart function that doesn't cause re-renders
  const fetchCart = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    // Don't fetch if component is unmounted
    if (!mountedRef.current) {
      console.log('Component unmounted, skipping cart fetch...');
      return;
    }

    // Don't fetch if still checking authentication
    if (authLoading) {
      console.log('Auth still loading, skipping cart fetch...');
      return;
    }

    console.log('fetchCart called - isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('Not authenticated, clearing cart');
      if (mountedRef.current) {
        setState(prev => ({ ...prev, cartItems: [], loading: false, error: null }));
      }
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('Calling cartService.getCart()...');
      const res = await cartService.getCart();
      console.log('Cart service response:', res);
      
      // Check if component is still mounted before updating state
      if (!mountedRef.current) {
        console.log('Component unmounted during fetch, skipping state update');
        return;
      }
      
      if (!res.success) {
        throw new Error(res.error ?? 'Failed to fetch cart');
      }

      // Handle different response formats
      let items: CartItem[] = [];
      if (Array.isArray(res.data)) {
        items = res.data;
      } else if (res.data && 'items' in res.data) {
        items = res.data.items;
      }

      console.log('Setting cart items:', items.length, 'items');
      setState(prev => ({ ...prev, cartItems: items, error: null }));
    } catch (err) {
      if (!mountedRef.current) return;
      
      const msg = err instanceof Error ? err.message : 'Failed to fetch cart';
      console.error('fetchCart error:', err);
      
      // Only set error if it's not an auth error (those are handled by the API interceptor)
      if (!msg.includes('401') && !msg.includes('Authentication')) {
        setError(msg);
        toast.error(msg);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [isAuthenticated, authLoading, setLoading, setError]);

  // Effect that only runs when auth status actually changes
  useEffect(() => {
    const authStateChanged = prevAuthStateRef.current !== isAuthenticated;
    prevAuthStateRef.current = isAuthenticated;

    // Don't fetch if auth is still loading
    if (authLoading) {
      return;
    }

    // Only fetch if auth state actually changed or if we just became authenticated
    if (authStateChanged || (isAuthenticated && cartItems.length === 0)) {
      console.log('useEffect triggered - auth state changed or authenticated with empty cart');
      fetchCart();
    }
  }, [isAuthenticated, authLoading, fetchCart]); // fetchCart is stable, so this won't cause infinite loops

  // Cart operations with stable references
  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      console.log('addToCart called:', { productId, quantity });
      
      if (!isAuthenticated) {
        toast.error('Please login to add items to cart');
        return { success: false, message: 'User not authenticated' };
      }

      try {
        console.log('Calling cartService.addToCart...');
        const res = await cartService.addToCart(productId, quantity);
        console.log('addToCart response:', res);

        if (!res.success) {
          toast.error(res.message ?? 'Failed to add item to cart');
          return res;
        }

        console.log('Add successful, refreshing cart...');
        await fetchCart();
        toast.success('Item added to cart');
        return res;
      } catch (err) {
        console.error('addToCart error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to add item to cart';
        
        // Don't show toast for auth errors (handled by API interceptor)
        if (!errorMsg.includes('401') && !errorMsg.includes('Authentication')) {
          toast.error('Failed to add item to cart');
          setError('Failed to add item to cart');
        }
        throw err;
      }
    },
    [isAuthenticated, fetchCart, setError],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      console.log('updateQuantity called:', { itemId, quantity });
      
      if (!isAuthenticated) {
        console.log('Not authenticated');
        return { success: false, message: 'User not authenticated' };
      }
      
      if (quantity < 1) {
        console.log('Invalid quantity');
        return { success: false, message: 'Quantity must be at least 1' };
      }

      try {
        console.log('Calling cartService.updateCartItem...');
        const res = await cartService.updateCartItem(itemId, quantity);
        console.log('updateCartItem response:', res);

        if (!res.success) {
          toast.error(res.message ?? 'Failed to update cart');
          return res;
        }

        // Update local state immediately for better UX
        console.log('Update successful, updating local state...');
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            cartItems: prev.cartItems.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            )
          }));
        }

        toast.success('Cart updated');
        return res;
      } catch (err) {
        console.error('updateQuantity error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to update cart';
        
        // Don't show toast for auth errors
        if (!errorMsg.includes('401') && !errorMsg.includes('Authentication')) {
          toast.error('Failed to update cart');
          setError('Failed to update cart');
        }
        throw err;
      }
    },
    [isAuthenticated, setError],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      console.log('removeItem called:', { itemId });
      
      if (!isAuthenticated) {
        console.log('Not authenticated');
        return { success: false, message: 'User not authenticated' };
      }

      try {
        console.log('Calling cartService.removeFromCart...');
        const res = await cartService.removeFromCart(itemId);
        console.log('removeFromCart response:', res);

        if (!res.success) {
          toast.error(res.message ?? 'Failed to remove item');
          return res;
        }

        // Remove item from local state immediately
        console.log('Remove successful, updating local state...');
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            cartItems: prev.cartItems.filter(item => item.id !== itemId)
          }));
        }

        toast.success('Item removed');
        return res;
      } catch (err) {
        console.error('removeItem error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to remove item from cart';
        
        // Don't show toast for auth errors
        if (!errorMsg.includes('401') && !errorMsg.includes('Authentication')) {
          toast.error('Failed to remove item from cart');
          setError('Failed to remove item from cart');
        }
        throw err;
      }
    },
    [isAuthenticated, setError],
  );

  // Derived data with stable references
  const totalAmount = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0,
      ),
    [cartItems],
  );

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const getItemQuantity = useCallback(
    (productId: string) =>
      cartItems.find(i => i.productId === productId)?.quantity ?? 0,
    [cartItems],
  );

  const forceRefresh = useCallback(() => {
    console.log('Force refresh called');
    if (isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    fetchCart,
    forceRefresh,
    totalAmount,
    totalItems,
    getTotalItems: () => totalItems,
    getItemQuantity,
    isEmpty: cartItems.length === 0,
  };
}