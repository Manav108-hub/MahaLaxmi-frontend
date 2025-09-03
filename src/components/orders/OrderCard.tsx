import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Order } from '@/lib/types'

interface OrderCardProps {
  order: Order
}

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
    status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }`}>
    {status}
  </span>
)

const OrderItem = ({ item }: { item: Order['orderItems'][0] }) => (
  <div className="flex gap-2">
    <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden">
      <img 
        src={item.product.images[0]} 
        alt={item.product.name}
        className="object-cover w-full h-full"
      />
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-medium">{item.product.name}</h4>
      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
    </div>
  </div>
)

const MoreItemsIndicator = ({ count }: { count: number }) => (
  <div className="flex items-center justify-center">
    <span className="text-sm text-gray-500">+{count} more items</span>
  </div>
)

export function OrderCard({ order }: OrderCardProps) {
  const displayItems = order.orderItems.slice(0, 2)
  const remainingItemsCount = order.orderItems.length - 2

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">Order #{order.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={order.deliveryStatus} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayItems.map((item) => (
          <OrderItem key={item.id} item={item} />
        ))}
        {remainingItemsCount > 0 && <MoreItemsIndicator count={remainingItemsCount} />}
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="font-bold">{formatPrice(order.totalAmount)}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/orders/${order.id}`}>View Details</Link>
        </Button>
      </div>
    </div>
  )
}