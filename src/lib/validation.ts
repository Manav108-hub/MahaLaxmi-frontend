// Input validation and sanitization utilities

export const sanitizeString = (input: string, maxLength: number = 255): string => {
  if (!input || typeof input !== 'string') return ''
  
  // Remove HTML tags and potentially dangerous characters
  const sanitized = input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .trim()
  
  return sanitized.substring(0, maxLength)
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validatePhone = (phone: string): boolean => {
  // Indian phone number validation (10 digits)
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  
  return { isValid: true }
}

export const validateSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') return ''
  
  // Allow only alphanumeric characters, spaces, and common punctuation for search
  return query
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
    .trim()
    .substring(0, 100)
}

export const validateQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 999
}

export const validatePrice = (price: number): boolean => {
  return typeof price === 'number' && price >= 0 && price <= 999999
}

// Rate limiting for client-side (complementary to server-side)
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }
  
  reset(key: string): void {
    this.requests.delete(key)
  }
}

export const apiRateLimiter = new RateLimiter(10, 60000) // 10 requests per minute
export const authRateLimiter = new RateLimiter(5, 300000) // 5 auth requests per 5 minutes