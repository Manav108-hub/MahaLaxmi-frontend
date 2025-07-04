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

// Helper function to clean string data that might have extra quotes
const cleanString = (str: string | undefined): string => {
  if (!str) return '';
  return str.replace(/^["']|["']$/g, '').trim();
};

// Helper function to sanitize product data
const sanitizeProduct = (product: any): Product => {
  return {
    ...product,
    name: cleanString(product.name),
    description: cleanString(product.description),
    // Ensure stock is a number
    stock: Number(product.stock) || 0,
    // Ensure price is a number
    price: Number(product.price) || 0,
    // Ensure images is an array
    images: Array.isArray(product.images) ? product.images : [],
    // Ensure category exists
    category: product.category || { id: '', name: 'Uncategorized', createdAt: '', updatedAt: '' }
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
      
      console.log('Raw API Response:', response.data) // Debugging log
      
      // Handle different response structures
      let product: any = null
      
      if (response.data?.success) {
        // If response has success field and data is nested
        if (response.data.data) {
          // Check if product is nested under data.product
          if (typeof response.data.data === 'object' && 'product' in response.data.data) {
            product = (response.data.data as any).product
          } else {
            // Product is directly in data
            product = response.data.data
          }
        }
      } else {
        // If response doesn't have success field, assume product is in response.data
        if (response.data && typeof response.data === 'object' && 'id' in response.data) {
          product = response.data
        }
      }
      
      console.log('Extracted product:', product)
      
      // Validate product data
      if (!product || !product.id) {
        throw new Error('Product not found or invalid product data')
      }
      
      // Sanitize the product before validation
      const sanitizedProduct = sanitizeProduct(product)
      console.log('Sanitized product:', sanitizedProduct)
      
      // Validate required fields after sanitization
      if (!sanitizedProduct.name || !sanitizedProduct.slug || 
          typeof sanitizedProduct.price !== 'number' || 
          typeof sanitizedProduct.stock !== 'number') {
        console.error('Invalid product data:', {
          name: sanitizedProduct.name,
          slug: sanitizedProduct.slug,
          price: sanitizedProduct.price,
          priceType: typeof sanitizedProduct.price,
          stock: sanitizedProduct.stock,
          stockType: typeof sanitizedProduct.stock
        })
        throw new Error('Invalid product data structure')
      }
      
      return sanitizedProduct
    } catch (error) {
      console.error(`Failed to fetch product with slug ${slug}:`, error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        throw error
      } else if (typeof error === 'string') {
        throw new Error(error)
      } else {
        throw new Error('Failed to fetch product')
      }
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