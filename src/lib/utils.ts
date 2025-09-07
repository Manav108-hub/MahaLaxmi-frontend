import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Product } from "./types"

// Memoization cache for expensive operations
const memoCache = new Map<string, any>();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cached price formatter - expensive operation that can be memoized
const priceFormatters = new Map<string, Intl.NumberFormat>();

export function formatPrice(price: number): string {
  const locale = 'en-IN';
  
  // Check if formatter already exists for this locale
  if (!priceFormatters.has(locale)) {
    priceFormatters.set(locale, new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
    }));
  }
  
  return priceFormatters.get(locale)!.format(price);
}

// Cached slug generation with memoization
export function generateSlug(text: string): string {
  const cacheKey = `slug_${text}`;
  
  // Check cache first
  if (memoCache.has(cacheKey)) {
    return memoCache.get(cacheKey);
  }
  
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  // Cache the result
  memoCache.set(cacheKey, slug);
  
  return slug;
}

// Optimized product lookup with caching
const productLookupCache = new Map<string, Map<string, Product>>();

export function getProductFromSlug(slug: string, products: Product[]): Product | undefined {
  // Create a cache key based on products array length and slug
  const arrayKey = `products_${products.length}`;
  
  // Check if we have a lookup map for this products array
  if (!productLookupCache.has(arrayKey)) {
    // Build lookup map for O(1) access instead of O(n) search
    const lookupMap = new Map<string, Product>();
    
    for (const product of products) {
      const productSlug = generateSlug(product.name);
      lookupMap.set(productSlug, product);
    }
    
    productLookupCache.set(arrayKey, lookupMap);
  }
  
  const lookupMap = productLookupCache.get(arrayKey)!;
  return lookupMap.get(slug);
}

// Utility functions for cache management
export const cacheUtils = {
  // Clear all memoization caches
  clearCache(): void {
    memoCache.clear();
    productLookupCache.clear();
  },
  
  // Clear specific cache patterns
  clearPriceCache(): void {
    priceFormatters.clear();
  },
  
  clearSlugCache(): void {
    for (const key of memoCache.keys()) {
      if (key.startsWith('slug_')) {
        memoCache.delete(key);
      }
    }
  },
  
  clearProductCache(): void {
    productLookupCache.clear();
  },
  
  // Get cache statistics
  getCacheStats() {
    return {
      memoCache: memoCache.size,
      priceFormatters: priceFormatters.size,
      productLookupCache: productLookupCache.size,
    };
  }
};

// Additional optimized utility functions
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}