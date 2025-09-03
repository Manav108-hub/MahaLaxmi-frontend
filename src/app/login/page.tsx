'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { authService } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'

type FormData = { username: string; password: string }

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(formData)
      
      if (response.success && response.user) {
        login(response.user)
        router.push('/')
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (err: any) {
      const error = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed. Please try again.'
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  const InputField = ({ 
    id, 
    name, 
    type, 
    placeholder, 
    icon: Icon, 
    showToggle 
  }: {
    id: string
    name: keyof FormData
    type: string
    placeholder: string
    icon: React.ComponentType<{ className?: string }>
    showToggle?: boolean
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700">{id.charAt(0).toUpperCase() + id.slice(1)}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showToggle && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleInputChange}
          className="pl-10 pr-10 border-pink-200 focus:border-pink-500 focus:ring-pink-500"
          required
        />
        <Icon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        <Card className="glass-effect shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-gray-800">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-pink-200 bg-pink-50">
                  <AlertDescription className="text-pink-800">{error}</AlertDescription>
                </Alert>
              )}

              <InputField 
                id="username" 
                name="username" 
                type="text" 
                placeholder="Enter your username" 
                icon={Mail} 
              />
              
              <InputField 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Enter your password" 
                icon={Lock} 
                showToggle 
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-pink-600 hover:text-pink-700 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-6">
            <div className="w-full text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-pink-600 hover:text-pink-700 font-medium hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-pink-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-pink-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}