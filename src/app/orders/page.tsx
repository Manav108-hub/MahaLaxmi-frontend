'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice } from '@/lib/utils'
import { orderService } from '@/services/orderService'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
  }
  quantity: number
}

interface OrderData {
  cartItems: OrderItem[]
  totalAmount: number
  timestamp: number
}

interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

const OrderItemCard = ({ item }: { item: OrderItem }) => (
  <div className="flex items-center gap-4 p-4 border border-pink-200 rounded-lg">
    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
      <img 
        src={item.product.images[0]} 
        alt={item.product.name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex-1">
      <h4 className="font-medium">{item.product.name}</h4>
      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
      <p className="text-pink-600 font-semibold">
        {formatPrice(item.product.price)}
      </p>
    </div>
    <div className="text-right">
      <p className="font-bold text-pink-600">
        {formatPrice(item.product.price * item.quantity)}
      </p>
    </div>
  </div>
)

const AddressForm = ({ 
  address, 
  onAddressChange, 
  userProfile 
}: { 
  address: ShippingAddress
  onAddressChange: (address: ShippingAddress) => void
  userProfile: any
}) => {
  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    onAddressChange({ ...address, [field]: value })
  }

  const fillFromProfile = () => {
    if (userProfile?.userDetails) {
      const { userDetails } = userProfile
      onAddressChange({
        name: userProfile.name || '',
        phone: userDetails.phone || '',
        address: userDetails.address || '',
        city: userDetails.city || '',
        state: userDetails.state || '',
        pincode: userDetails.pincode || ''
      })
      toast.success('Address filled from profile')
    }
  }

  return (
    <Card className="glass-effect border-pink-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Shipping Address</CardTitle>
          {userProfile?.userDetails && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={fillFromProfile}
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              Use Profile Address
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={address.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={address.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={address.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter complete address"
            rows={3}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City"
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={address.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="State"
              required
            />
          </div>
          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={address.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              placeholder="Pincode"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const OrderSummaryCard = ({ 
  orderData, 
  onPlaceOrder, 
  placing 
}: { 
  orderData: OrderData
  onPlaceOrder: () => void
  placing: boolean
}) => (
  <Card className="glass-effect border-pink-200">
    <CardHeader>
      <CardTitle>Order Summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between">
        <span className="text-gray-600">Items ({orderData.cartItems.length})</span>
        <span className="font-medium">{formatPrice(orderData.totalAmount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Shipping</span>
        <span className="font-medium text-green-600">Free</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Tax</span>
        <span className="font-medium">Included</span>
      </div>
      <div className="border-t border-pink-200 pt-4 flex justify-between">
        <span className="font-bold text-lg">Total</span>
        <span className="font-bold text-lg text-pink-600">
          {formatPrice(orderData.totalAmount)}
        </span>
      </div>
      
      <Button 
        onClick={onPlaceOrder}
        disabled={placing}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 text-lg font-semibold"
      >
        {placing ? 'Placing Order...' : 'Place Order & Pay'}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        By placing your order, you agree to our Terms & Conditions
      </p>
    </CardContent>
  </Card>
)

export default function PlaceOrderPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [placing, setPlacing] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  useEffect(() => {
    // Get order data from sessionStorage
    const storedData = sessionStorage.getItem('orderData')
    if (storedData) {
      const data = JSON.parse(storedData)
      // Check if data is not too old (5 minutes)
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        setOrderData(data)
      } else {
        // Data is stale, redirect back to cart
        toast.error('Order session expired. Please try again.')
        router.push('/cart')
      }
    } else {
      // No order data, redirect to cart
      toast.error('No order data found. Please select items from cart.')
      router.push('/cart')
    }

    // Prefill address if user profile exists
    if (userProfile?.userDetails) {
      const { userDetails } = userProfile
      setShippingAddress({
        name: userProfile.name || '',
        phone: userDetails.phone || '',
        address: userDetails.address || '',
        city: userDetails.city || '',
        state: userDetails.state || '',
        pincode: userDetails.pincode || ''
      })
    }
  }, [router, userProfile])

  const validateAddress = (): boolean => {
    const required = ['name', 'phone', 'address', 'city', 'state', 'pincode']
    const missing = required.filter(field => !shippingAddress[field as keyof ShippingAddress])
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`)
      return false
    }
    
    // Validate phone number (basic validation)
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return false
    }
    
    // Validate pincode (basic validation)
    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode')
      return false
    }
    
    return true
  }

  const handlePlaceOrder = async () => {
    if (!orderData || !validateAddress()) return

    setPlacing(true)
    
    try {
      // For now, we'll create a simple order without payment gateway
      // You can integrate payment later
      
      const cartItemIds = orderData.cartItems.map(item => item.id)
      
      const orderResponse = await orderService.createOrder({
        paymentMethod: 'ONLINE',
        shippingAddress,
        cartItemIds
      })

      if (orderResponse.success) {
        // Clear the order data from sessionStorage
        sessionStorage.removeItem('orderData')
        
        toast.success('Order placed successfully!')
        
        // Redirect to orders page or order confirmation
        router.push('/orders')
      } else {
        toast.error(orderResponse.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Place order error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">Place Your Order</h1>
          <Button asChild variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
            <Link href="/cart">Back to Cart</Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="glass-effect border-pink-200">
              <CardHeader>
                <CardTitle>Order Items ({orderData.cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderData.cartItems.map((item) => (
                  <OrderItemCard key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <AddressForm 
              address={shippingAddress}
              onAddressChange={setShippingAddress}
              userProfile={userProfile}
            />
          </div>

          <div className="space-y-6">
            <OrderSummaryCard 
              orderData={orderData}
              onPlaceOrder={handlePlaceOrder}
              placing={placing}
            />
          </div>
        </div>
      </div>
    </div>
  )
}