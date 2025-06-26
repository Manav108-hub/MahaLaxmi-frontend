import api from '@/lib/api'
import { ApiResponse, Product, Category } from '@/lib/types'

export const productService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/categories')
    return response.data
  },

  async getProducts(categoryId?: string): Promise<ApiResponse<Product[]>> {
    const params = categoryId ? { categoryId } : {}
    const response = await api.get('/products', { params })
    return response.data
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await api.get(`/product/${id}`)
    return response.data
  },

  async createCategory(categoryData: {
    name: string
    description?: string
  }): Promise<ApiResponse<Category>> {
    const response = await api.post('/category', categoryData)
    return response.data
  },

  async createProduct(productData: FormData): Promise<ApiResponse<Product>> {
    const response = await api.post('/product', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async updateProduct(id: string, productData: FormData): Promise<ApiResponse<Product>> {
    const response = await api.put(`/product/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}