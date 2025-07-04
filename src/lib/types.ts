// --- TypeScript Interfaces (lib/types.ts) ---

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;  
  updatedAt: string;
}

export interface UserWithDetails {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  userDetails: {
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string; // Add this if missing
  description?: string;
  price: number;
  stock: number; // Ensure this is required
  images: string[];
  isActive?: boolean;
  category: Category;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  details?: ProductDetails;
}

export interface ProductDetails {
  weight?: string;
  dimensions?: string;
  material?: string;
  warranty?: string;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  deliveryStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  shippingAddress: ShippingAddress;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSession {
  id: string;
  orderId: string;
  userId: string;
  transactionId: string;
  merchantTransactionId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILURE';
  callbackUrl?: string;
  mobileNumber?: string;
  paymentUrl?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
   success: boolean;
  message?: string;
  data?: T;
  error?: string;
  // Remove these:
  // csrfToken: any;
  // user(user: any): string;
  // categories(categories: any): unknown;
  // Keep pagination fields if needed
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
}
export interface ProductsResponse {
  [x: string]: any;
  products: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    username: string;
    role: 'USER' | 'ADMIN';
  };
}

// Request Types
export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
  adminToken?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: string[];
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}
export type PaymentMethod = 'COD' | 'ONLINE'

export interface CreateOrderRequest {
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  cartItemIds: string[];
}

export interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  callbackUrl: string;
  mobileNumber?: string;
}

export interface VerifyPaymentRequest {
  transactionId: string;
}

// Utility Types
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'category'>;
export type CreateOrderInput = Omit<Order, 'id' | 'orderItems' | 'createdAt' | 'updatedAt'>;
export type CreateOrderItemInput = Omit<OrderItem, 'id' | 'createdAt' | 'updatedAt' | 'product'>;
