// @/services/productService.ts
import api from '@/lib/api'
import { 
  ApiResponse, 
  Product, 
  Category, 
  ProductsResponse,
  CreateCategoryRequest,
  CreateProductRequest
} from '@/lib/types'

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

      return {
        products: response.data.data?.products || [],
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
      
      return response.data.data
    } catch (error) {
      console.error(`Failed to fetch product with ID ${id}:`, error)
      throw new Error('Failed to fetch product')
    }
  },

  async getProductBySlug(slug: string): Promise<Product> {
  try {
    // Add /api/ to match the backend route
    const response = await api.get<ApiResponse<Product>>(`/api/products/slug/${slug}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Product not found');
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch product with slug ${slug}:`, error);
    throw new Error('Failed to fetch product');
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
      
      return response.data.data
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
      
      return response.data.data
    } catch (error) {
      console.error(`Failed to update product with ID ${id}:`, error)
      throw new Error('Failed to update product')
    }
  }
}