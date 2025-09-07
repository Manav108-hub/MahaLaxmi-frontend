import api from "@/lib/api";
import { ApiResponse, CartItem } from "@/lib/types";

// Cart cache implementation
class CartCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 2 * 60 * 1000; // 2 minutes for cart data (shorter due to frequent changes)

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

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
  apiCall: () => Promise<any>
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall();
    return response.data as ApiResponse<T>;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Request failed",
      message: error.response?.data?.message || "Request failed",
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

    // Clear cart cache when items are added
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
    const cacheKey = "cart_data";

    // Check cache first
    const cached = cartCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await handleApiCall<{
      items: CartItem[];
      total: number;
      totalItems: number;
    }>(() => api.get("/api/cart"));

    // Cache successful responses
    if (result.success) {
      cartCache.set(cacheKey, result);
    }

    return result;
  },

  async updateCartItem(
    itemId: string,
    quantity: number
  ): Promise<ApiResponse<CartItem>> {
    const result = await handleApiCall<CartItem>(() =>
      api.put(`/api/cart/${itemId}`, { quantity })
    );

    // Clear cart cache when items are updated
    if (result.success) {
      cartCache.clear();
    }

    return result;
  },

  async removeFromCart(itemId: string): Promise<ApiResponse<any>> {
    const result = await handleApiCall<any>(() =>
      api.delete(`/api/cart/${itemId}`)
    );

    // Clear cart cache when items are removed
    if (result.success) {
      cartCache.clear();
    }

    return result;
  },

  async getSelectedCartItems(
    cartItemIds: string[]
  ): Promise<ApiResponse<CartItem[]>> {
    const cacheKey = `selected_items_${JSON.stringify(cartItemIds.sort())}`;

    // Check cache first
    const cached = cartCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await handleApiCall<CartItem[]>(() =>
      api.post("/api/cart/selected", { cartItemIds })
    );

    // Cache successful responses for selected items
    if (result.success) {
      cartCache.set(cacheKey, result);
    }

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
