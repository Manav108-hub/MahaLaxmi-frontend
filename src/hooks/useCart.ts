import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const { isAuthenticated } = useAuth();

  console.log('🛒 useCart render - cartItems:', cartItems.length, 'loading:', loading);

  /* ---------- little helpers ---------- */
  const setLoading = (value: boolean) => {
    console.log('🔄 Setting loading to:', value);
    setState(prev => ({ ...prev, loading: value }));
  };
  
  const setError = (msg: string | null) => {
    console.log('❌ Setting error to:', msg);
    setState(prev => ({ ...prev, error: msg }));
  };

  /* ---------- fetch cart ---------- */
  const fetchCart = useCallback(async (): Promise<void> => {
    console.log('🔍 fetchCart called - isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, clearing cart');
      setState(prev => ({ ...prev, cartItems: [], loading: false }));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 Calling cartService.getCart()...');
      const res = await cartService.getCart();
      console.log('📡 Cart service response:', res);
      
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

      console.log('✅ Setting cart items:', items.length, 'items');
      setState(prev => ({ ...prev, cartItems: items }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch cart';
      console.error('❌ fetchCart error:', err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('🔄 useEffect triggered - calling fetchCart');
    fetchCart();
  }, [fetchCart]);

  /* ---------- add / update / remove ---------- */
  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      console.log('➕ addToCart called:', { productId, quantity });
      
      if (!isAuthenticated) {
        toast.error('Please login to add items to cart');
        return { success: false, message: 'User not authenticated' };
      }

      try {
        console.log('📡 Calling cartService.addToCart...');
        const res = await cartService.addToCart(productId, quantity);
        console.log('📡 addToCart response:', res);

        if (!res.success) {
          toast.error(res.message ?? 'Failed to add item to cart');
          return res;
        }

        console.log('✅ Add successful, calling fetchCart...');
        await fetchCart();
        toast.success('Item added to cart');
        return res;
      } catch (err) {
        console.error('❌ addToCart error:', err);
        toast.error('Failed to add item to cart');
        setError('Failed to add item to cart');
        throw err;
      }
    },
    [isAuthenticated, fetchCart],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      console.log('📝 updateQuantity called:', { itemId, quantity });
      
      if (!isAuthenticated) {
        console.log('❌ Not authenticated');
        return { success: false, message: 'User not authenticated' };
      }
      
      if (quantity < 1) {
        console.log('❌ Invalid quantity');
        return { success: false, message: 'Quantity must be at least 1' };
      }

      try {
        console.log('📡 Calling cartService.updateCartItem...');
        const res = await cartService.updateCartItem(itemId, quantity);
        console.log('📡 updateCartItem response:', res);

        if (!res.success) {
          toast.error(res.message ?? 'Failed to update cart');
          return res;
        }

        // Option 1: Update the item locally for immediate UI update
        console.log('✅ Update successful, updating local state...');
        setState(prev => ({
          ...prev,
          cartItems: prev.cartItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        }));

        // Option 2: Also fetch from server to ensure consistency
        // Comment out the fetchCart call if you want to rely only on local update
        console.log('🔄 Fetching fresh cart data...');
        await fetchCart();
        
        toast.success('Cart updated');
        return res;
      } catch (err) {
        console.error('❌ updateQuantity error:', err);
        toast.error('Failed to update cart');
        setError('Failed to update cart');
        throw err;
      }
    },
    [isAuthenticated, fetchCart],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      console.log('🗑️ removeItem called:', { itemId });
      
      if (!isAuthenticated) {
        console.log('❌ Not authenticated');
        return { success: false, message: 'User not authenticated' };
      }

      try {
        console.log('📡 Calling cartService.removeFromCart...');
        const res = await cartService.removeFromCart(itemId);
        console.log('📡 removeFromCart response:', res);

        if (!res.success) {
          toast.error(res.message ?? 'Failed to remove item');
          return res;
        }

        // Option 1: Remove item locally for immediate UI update
        console.log('✅ Remove successful, updating local state...');
        setState(prev => ({
          ...prev,
          cartItems: prev.cartItems.filter(item => item.id !== itemId)
        }));

        // Option 2: Also fetch from server to ensure consistency
        console.log('🔄 Fetching fresh cart data...');
        await fetchCart();
        
        toast.success('Item removed');
        return res;
      } catch (err) {
        console.error('❌ removeItem error:', err);
        toast.error('Failed to remove item from cart');
        setError('Failed to remove item from cart');
        throw err;
      }
    },
    [isAuthenticated, fetchCart],
  );

  /* ---------- derived data ---------- */
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

  /* ---------- test function ---------- */
  const forceRefresh = useCallback(() => {
    console.log('🔄 Force refresh called');
    fetchCart();
  }, [fetchCart]);

  /* ---------- public API ---------- */
  return {
    cartItems,
    loading,
    error,
    /* CRUD */
    addToCart,
    updateQuantity,
    removeItem,
    fetchCart,
    forceRefresh,
    /* derived */
    totalAmount,
    totalItems,
    getTotalItems: () => totalItems,
    getItemQuantity,
    isEmpty: cartItems.length === 0,
  };
}