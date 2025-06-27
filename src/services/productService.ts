// @/services/productService.ts
import api from '@/lib/api'
import { ApiResponse, Product, Category } from '@/lib/types'

export const productService = {
  async getCategories(): Promise<{ categories: Category[] }> {
  const response = await api.get('/api/categories')
  return response.data
},


  // productService.ts

async getProducts(categoryId?: string, search?: string): Promise<{ products: Product[]; pagination: any }> {
  const params = { categoryId, search }
  const response = await api.get('/api/products', { params })
  return response.data
}
,



  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await api.get(`/api/product/${id}`)
    return response.data
  },

  async createCategory(categoryData: {
    name: string
    description?: string
  }): Promise<ApiResponse<Category>> {
    const response = await api.post('/api/category', categoryData)
    return response.data
  },

  async createProduct(productData: FormData): Promise<ApiResponse<Product>> {
    const response = await api.post('/api/product', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async updateProduct(id: string, productData: FormData): Promise<ApiResponse<Product>> {
    const response = await api.put(`/api/product/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}