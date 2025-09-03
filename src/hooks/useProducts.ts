import { useQuery, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/productService'
import { Product, Category } from '@/lib/types'

// Query keys for consistency
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: string) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: ['categories'] as const,
  featured: ['products', 'featured'] as const,
}

export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: productKeys.list(categoryId || 'all'),
    queryFn: async () => {
      const response = await productService.getProducts(categoryId)
      return response.products || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
  })
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: async () => {
      const response = await productService.getCategories()
      if (response.success && Array.isArray(response.data)) {
        return response.data
      } else if (Array.isArray(response)) {
        return response
      }
      return []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change less frequently
    gcTime: 60 * 60 * 1000,    // 1 hour
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured,
    queryFn: async () => {
      const response = await productService.getFeaturedProducts()
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await productService.getProduct(id)
      return response
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// Prefetch functions for better UX
export function usePrefetchProduct() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: async () => {
        const response = await productService.getProduct(id)
        return response
      },
      staleTime: 5 * 60 * 1000,
    })
  }
}