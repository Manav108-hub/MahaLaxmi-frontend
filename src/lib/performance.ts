// Performance monitoring and optimization utilities

export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
}

export const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  } catch (error) {
    const end = performance.now()
    console.log(`${name} failed after ${end - start} milliseconds`)
    throw error
  }
}

// Debounce function for search and form inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Lazy loading intersection observer
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Web vitals reporting
export const reportWebVitals = (metric: any) => {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }
  
  // In production, you could send to analytics service
  // Example: analytics.track('Web Vitals', metric)
}

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    }
  }
  return null
}

// Bundle analyzer for client-side
export const logBundleSize = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'))
    const totalSize = scripts.reduce((acc, script) => {
      const src = (script as HTMLScriptElement).src
      if (src.includes('/_next/static/')) {
        // Estimate based on typical gzip compression
        return acc + 1
      }
      return acc
    }, 0)
    console.log(`Estimated bundle scripts: ${totalSize}`)
  }
}