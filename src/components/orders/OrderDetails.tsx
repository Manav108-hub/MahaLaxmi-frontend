import { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface OrderDetailsProps {
  order: Order
}

const OrderItem = ({ item }: { item: Order['orderItems'][0] }) => (
  <div className="flex gap-4 border-b pb-4 last:border-b-0">
    <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
      <img 
        src={item.product.images[0]} 
        alt={item.product.name}
        className="object-cover w-full h-full"
      />
    </div>
    <div className="flex-1">
      <h3 className="font-medium">{item.product.name}</h3>
      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
      <p className="text-sm text-pink-600 font-bold mt-1">
        {formatPrice(item.price)}
      </p>
    </div>
    <div className="text-right">
      <p className="font-bold text-pink-600">
        {formatPrice(item.price * item.quantity)}
      </p>
    </div>
  </div>
)

const ShippingAddress = ({ address }: { address: Order['shippingAddress'] }) => (
  <div>
    <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
    <div className="space-y-2">
      <p className="font-medium">{address.name}</p>
      <p>{address.address}</p>
      <p>{address.city}, {address.state} - {address.pincode}</p>
      <p>{address.phone}</p>
    </div>
  </div>
)

const SummaryRow = ({ label, value, isTotal = false, colorClass = '' }: {
  label: string
  value: string
  isTotal?: boolean
  colorClass?: string
}) => (
  <div className={`flex justify-between ${isTotal ? 'pt-3 border-t border-gray-200' : ''}`}>
    <span className={isTotal ? 'font-bold' : 'text-gray-500'}>{label}</span>
    <span className={isTotal ? 'font-bold text-pink-600' : colorClass}>{value}</span>
  </div>
)

const OrderSummary = ({ order }: { order: Order }) => {
  const getStatusColor = (status: string) => 
    status === 'PAID' || status === 'DELIVERED' ? 'text-green-600' : 'text-yellow-600'

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      <div className="space-y-3">
        <SummaryRow label="Order ID" value={order.id} />
        <SummaryRow label="Date" value={new Date(order.createdAt).toLocaleDateString()} />
        <SummaryRow label="Payment Method" value={order.paymentMethod} />
        <SummaryRow 
          label="Payment Status" 
          value={order.paymentStatus} 
          colorClass={getStatusColor(order.paymentStatus)} 
        />
        <SummaryRow 
          label="Delivery Status" 
          value={order.deliveryStatus} 
          colorClass={getStatusColor(order.deliveryStatus)} 
        />
        <SummaryRow 
          label="Total" 
          value={formatPrice(order.totalAmount)} 
          isTotal 
        />
      </div>
    </div>
  )
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.orderItems.map((item) => (
            <OrderItem key={item.id} item={item} />
          ))}
        </div>
      </div>
      
      <ShippingAddress address={order.shippingAddress} />
      <OrderSummary order={order} />
    </div>
  )
}