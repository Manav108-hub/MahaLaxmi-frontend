import api from '@/lib/api'
import { ApiResponse, Product, Category, ProductsResponse, CreateCategoryRequest } from '@/lib/types'

// Simple browser cache
const browserCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key: string) => {
  const cached = browserCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  browserCache.set(key, { data, timestamp: Date.now() });
};

// EXISTING FUNCTIONS - UNCHANGED
const handleApiCall = async <T>(apiCall: () => Promise<any>): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall()
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Product request failed',
      message: error.response?.data?.message || 'Product request failed'
    }
  }
}

const sanitizeProduct = (product: any): Product => {
  if (!product || typeof product !== 'object') {
    throw new Error('Invalid product data')
  }
  
  return {
    id: String(product.id || ''),
    name: String(product.name || '').replace(/^["']|["']$/g, '').trim(),
    slug: String(product.slug || ''),
    description: String(product.description || '').replace(/^["']|["']$/g, '').trim(),
    stock: Number(product.stock) || 0,
    price: Number(product.price) || 0,
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category || { id: '', name: 'Uncategorized', createdAt: '', updatedAt: '' },
    categoryId: String(product.categoryId || ''),
    createdAt: String(product.createdAt || ''),
    updatedAt: String(product.updatedAt || ''),
    isActive: Boolean(product.isActive),
    details: product.details
  }
}

export const productService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    // Check cache first
    const cached = getCached('categories');
    if (cached) return cached as ApiResponse<Category[]>;
    
    const result = await handleApiCall(() => api.get('/api/categories'));
    
    // Cache result if successful
    if (result.success) {
      setCache('categories', result);
    }
    
    return result as ApiResponse<Category[]>;
  },

  async createCategory(categoryData: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return handleApiCall(() => api.post('/api/category', categoryData))
  },

  async getProducts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ProductsResponse> {
    // Check cache first
    const cacheKey = `products_${JSON.stringify(params || {})}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await api.get('/api/products', { params })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch products')
      }

      const products = response.data.data?.products || []
      const sanitizedProducts = products.map(sanitizeProduct)

      const result = {
        success: true,
        data: sanitizedProducts,
        products: sanitizedProducts,
        pagination: response.data.data?.pagination
      };
      
      // Cache result
      setCache(cacheKey, result);
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products')
    }
  },

  async getProductById(id: string): Promise<Product> {
    // Check cache first
    const cacheKey = `product_${id}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await api.get(`/api/product/${id}`)
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Product not found')
      }
      
      const result = sanitizeProduct(response.data.data);
      
      // Cache result
      setCache(cacheKey, result);
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product')
    }
  },

  async getProductBySlug(slug: string): Promise<Product> {
    // Check cache first
    const cacheKey = `product_slug_${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await api.get(`/api/products/slug/${slug}`)
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Product not found')
      }
      
      const sanitizedProduct = sanitizeProduct(response.data.data)
      
      if (!sanitizedProduct.name || !sanitizedProduct.slug || 
          typeof sanitizedProduct.price !== 'number' || 
          typeof sanitizedProduct.stock !== 'number') {
        throw new Error('Invalid product data structure')
      }
      
      // Cache result
      setCache(cacheKey, sanitizedProduct);
      
      return sanitizedProduct;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product')
    }
  },

  async createProduct(productData: FormData): Promise<Product> {
    try {
      const response = await api.post('/api/product', productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create product')
      }
      
      return sanitizeProduct(response.data.data)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create product')
    }
  },

  async updateProduct(id: string, productData: FormData): Promise<Product> {
    try {
      const response = await api.put(`/api/product/${id}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to update product')
      }
      
      return sanitizeProduct(response.data.data)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update product')
    }
  }
}