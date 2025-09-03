'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const item = localStorage.getItem(key)
      if (item) setValue(JSON.parse(item))
    } catch {}
    finally {
      setIsLoaded(true)
    }
  }, [key])

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') return
    
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      setValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch {}
  }

  return [value, setStoredValue, isLoaded] as const
}