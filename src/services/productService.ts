// @/services/productService.ts
import api from '@/lib/api'
import { 
  ApiResponse, 
  Product, 
  Category, 
  ProductsResponse,
  CreateCategoryRequest
} from '@/lib/types'

// Helper function to clean string data that might have extra quotes
const cleanString = (str: string | undefined): string => {
  if (!str) return '';
  return str.replace(/^["']|["']$/g, '').trim();
};

// Helper function to sanitize product data with proper typing
const sanitizeProduct = (product: unknown): Product => {
  // Type guard to ensure we have the basic structure
  if (!product || typeof product !== 'object') {
    throw new Error('Invalid product data: not an object');
  }
  
  const productObj = product as Record<string, unknown>;
  
  return {
    id: String(productObj.id || ''),
    name: cleanString(String(productObj.name || '')),
    slug: String(productObj.slug || ''),
    description: cleanString(String(productObj.description || '')),
    stock: Number(productObj.stock) || 0,
    price: Number(productObj.price) || 0,
    images: Array.isArray(productObj.images) ? productObj.images as string[] : [],
    category: (productObj.category as Category) || { 
      id: '', 
      name: 'Uncategorized', 
      createdAt: '', 
      updatedAt: '' 
    },
    categoryId: String(productObj.categoryId || ''),
    createdAt: String(productObj.createdAt || ''),
    updatedAt: String(productObj.updatedAt || ''),
    isActive: Boolean(productObj.isActive),
    details: productObj.details as Product['details']
  };
};

export const productService = {
  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/api/categories')
      return response.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      throw new Error('Failed to fetch categories')
    }
  },

  async createCategory(categoryData: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    try {
      const response = await api.post<ApiResponse<Category>>('/api/category', categoryData)
      return response.data
    } catch (error) {
      console.error('Failed to create category:', error)
      throw new Error('Failed to create category')
    }
  },

  // Products
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
      const response = await api.get<ApiResponse<{
        products: Product[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      }>>('/api/products', { params })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch products')
      }

      // Sanitize products
      const products = response.data.data?.products || []
      const sanitizedProducts = products.map(sanitizeProduct)

      return {
        products: sanitizedProducts,
        pagination: response.data.data?.pagination
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      throw new Error('Failed to fetch products')
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get<ApiResponse<Product>>(`/api/product/${id}`)
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Product not found')
      }
      
      return sanitizeProduct(response.data.data)
    } catch (error) {
      console.error(`Failed to fetch product with ID ${id}:`, error)
      throw new Error('Failed to fetch product')
    }
  },

  async getProductBySlug(slug: string): Promise<Product> {
    try {
      const response = await api.get<ApiResponse<Product>>(`/api/products/slug/${slug}`)
      
      // Simplified response handling - expect consistent API structure
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Product not found')
      }
      
      const sanitizedProduct = sanitizeProduct(response.data.data)
      
      // Validate required fields after sanitization
      if (!sanitizedProduct.name || !sanitizedProduct.slug || 
          typeof sanitizedProduct.price !== 'number' || 
          typeof sanitizedProduct.stock !== 'number') {
        console.error('Invalid product data:', {
          name: sanitizedProduct.name,
          slug: sanitizedProduct.slug,
          price: sanitizedProduct.price,
          stock: sanitizedProduct.stock
        })
        throw new Error('Invalid product data structure')
      }
      
      return sanitizedProduct
    } catch (error) {
      console.error(`Failed to fetch product with slug ${slug}:`, error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch product')
    }
  },

  async createProduct(productData: FormData): Promise<Product> {
    try {
      const response = await api.post<ApiResponse<Product>>('/api/product', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create product')
      }
      
      return sanitizeProduct(response.data.data)
    } catch (error) {
      console.error('Failed to create product:', error)
      throw new Error('Failed to create product')
    }
  },

  async updateProduct(id: string, productData: FormData): Promise<Product> {
    try {
      const response = await api.put<ApiResponse<Product>>(`/api/product/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to update product')
      }
      
      return sanitizeProduct(response.data.data)
    } catch (error) {
      console.error(`Failed to update product with ID ${id}:`, error)
      throw new Error('Failed to update product')
    }
  }
}