import api from "@/lib/api";
import { ApiResponse, CartItem } from "@/lib/types";

// Cart cache implementation
class CartCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 30 * 1000; // 30 seconds - shorter for immediate updates

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cartCache = new CartCache();

const handleApiCall = async <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiCall: () => Promise<any>
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall();
    // ✅ FIX: Return the response.data directly
    return response.data as ApiResponse<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Cart API error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || "Request failed",
      message: error.response?.data?.error || error.response?.data?.message || "Request failed",
    } as ApiResponse<T>;
  }
};

export const cartService = {
  async addToCart(
    productId: string,
    quantity: number = 1
  ): Promise<ApiResponse<CartItem>> {
    const result = await handleApiCall<CartItem>(() =>
      api.post("/api/cart", { productId, quantity })
    );

    // ✅ FIX: Clear cache immediately after adding
    if (result.success) {
      cartCache.clear();
    }

    return result;
  },

  async getCart(): Promise<
    ApiResponse<{
      items: CartItem[];
      total: number;
      totalItems: number;
    }>
  > {
    // ✅ FIX: Don't use cache for cart data to ensure fresh data
    // const cacheKey = "cart_data";
    // const cached = cartCache.get(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    const result = await handleApiCall<{
      items: CartItem[];
      total: number;
      totalItems: number;
    }>(() => api.get("/api/cart"));

    // Cache successful responses briefly
    // if (result.success) {
    //   cartCache.set(cacheKey, result);
    // }

    return result;
  },

  async updateCartItem(
    itemId: string,
    quantity: number
  ): Promise<ApiResponse<CartItem>> {
    const result = await handleApiCall<CartItem>(() =>
      api.put(`/api/cart/${itemId}`, { quantity })
    );

    // ✅ FIX: Clear cache immediately after updating
    if (result.success) {
      cartCache.clear();
    }

    return result;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async removeFromCart(itemId: string): Promise<ApiResponse<any>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await handleApiCall<any>(() =>
      api.delete(`/api/cart/${itemId}`)
    );

    // ✅ FIX: Clear cache immediately after removing
    if (result.success) {
      cartCache.clear();
    }

    return result;
  },

  async getSelectedCartItems(
    cartItemIds: string[]
  ): Promise<ApiResponse<{
    cartItems: CartItem[];
    summary: {
      selectedItemsCount: number;
      totalItems: number;
      totalAmount: number;
    }
  }>> {
    const result = await handleApiCall<{
      cartItems: CartItem[];
      summary: {
        selectedItemsCount: number;
        totalItems: number;
        totalAmount: number;
      }
    }>(() => api.post("/api/cart/selected", { cartItemIds }));

    return result;
  },

  // Cache management methods
  clearCache(): void {
    cartCache.clear();
  },

  invalidateCache(): void {
    cartCache.clear();
  },
};