import api from '@/lib/api'
import { ApiResponse, Product, Category, ProductsResponse, CreateCategoryRequest } from '@/lib/types'

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
    return handleApiCall(() => api.get('/api/categories'))
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
    try {
      const response = await api.get('/api/products', { params })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch products')
      }

      const products = response.data.data?.products || []
      const sanitizedProducts = products.map(sanitizeProduct)

      return {
        success: true,
        data: sanitizedProducts,
        products: sanitizedProducts,
        pagination: response.data.data?.pagination
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products')
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get(`/api/product/${id}`)
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Product not found')
      }
      
      return sanitizeProduct(response.data.data)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product')
    }
  },

  async getProductBySlug(slug: string): Promise<Product> {
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
      
      return sanitizedProduct
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