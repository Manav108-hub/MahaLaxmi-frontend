'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'
import { formatPrice, generateSlug } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
  layout?: 'grid' | 'list'
}

const ProductImage = ({ product }: { product: Product }) => (
  <div className="aspect-square bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
    {product.images?.length > 0 ? (
      <Image
        src={product.images[0]}
        alt={product.name}
        width={300}
        height={300}
        className="object-cover w-full h-full"
      />
    ) : (
      <div className="text-pink-400 text-4xl font-bold">
        {product.name.charAt(0)}
      </div>
    )}
  </div>
)

const StockBadge = ({ stock }: { stock: number }) => 
  stock <= 5 ? (
    <Badge className="absolute top-2 right-2 bg-orange-500">Low Stock</Badge>
  ) : null

const ProductInfo = ({ product }: { product: Product }) => (
  <div className="mb-2">
    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{product.name}</h3>
    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
  </div>
)

const PriceSection = ({ product, isAdding, onAddToCart }: {
  product: Product
  isAdding: boolean
  onAddToCart: (e: React.MouseEvent) => void
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-lg font-bold text-pink-600">{formatPrice(product.price)}</p>
      <p className="text-xs text-gray-500">{product.stock} in stock</p>
    </div>
    <Button
      size="sm"
      className="bg-pink-500 hover:bg-pink-600"
      onClick={onAddToCart}
      disabled={isAdding || product.stock === 0}
    >
      <ShoppingCart className="h-4 w-4" />
    </Button>
  </div>
)

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAdding(true)
    
    try {
      await addToCart(product.id)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link href={`/products/${generateSlug(product.name)}`}>
      <Card className="glass-effect hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-pink-200 overflow-hidden">
        <div className="relative">
          <ProductImage product={product} />
          <StockBadge stock={product.stock} />
        </div>
        <CardContent className="p-4">
          <ProductInfo product={product} />
          <PriceSection
            product={product}
            isAdding={isAdding}
            onAddToCart={handleAddToCart}
          />
        </CardContent>
      </Card>
    </Link>
  )
}