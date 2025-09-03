'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check, X } from 'lucide-react'
import { authService } from '@/services/authService'

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  username: string
}

type PasswordStrength = {
  score: number
  text: string
  color: string
  width: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  username: ''
}

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { score: 0, text: '', color: '', width: 'w-0' }
  
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  score = Object.values(checks).filter(Boolean).length
  
  if (score < 2) return { score, text: 'Weak', color: 'bg-red-500', width: 'w-1/4' }
  if (score < 4) return { score, text: 'Medium', color: 'bg-yellow-500', width: 'w-2/3' }
  return { score, text: 'Strong', color: 'bg-green-500', width: 'w-full' }
}

const getPasswordValidation = (password: string) => ({
  length: { valid: password.length >= 8, text: 'At least 8 characters' },
  lowercase: { valid: /[a-z]/.test(password), text: 'One lowercase letter' },
  uppercase: { valid: /[A-Z]/.test(password), text: 'One uppercase letter' },
  number: { valid: /\d/.test(password), text: 'One number' },
  special: { valid: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'One special character' }
})

const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
  <div className={`flex items-center text-xs ${valid ? 'text-green-600' : 'text-gray-500'}`}>
    {valid ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
    {text}
  </div>
)

const InputField = ({ 
  id, 
  name, 
  type, 
  placeholder, 
  icon: Icon, 
  value, 
  onChange, 
  required = false,
  showToggle = false,
  showPassword = false,
  onTogglePassword
}: {
  id: string
  name: keyof FormData
  type: string
  placeholder: string
  icon: React.ComponentType<{ className?: string }>
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  showToggle?: boolean
  showPassword?: boolean
  onTogglePassword?: () => void
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-gray-700">
      {id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1')}
      {!required && <span className="text-gray-400 text-sm"> (Optional)</span>}
    </Label>
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={showToggle && showPassword ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10 pr-10 border-pink-200 focus:border-pink-500 focus:ring-pink-500"
        required={required}
      />
      <Icon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      {showToggle && onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  </div>
)

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const validateForm = (): string | null => {
    const { firstName, lastName, username, email, password, confirmPassword } = formData
    
    if (!firstName.trim()) return 'First name is required'
    if (!lastName.trim()) return 'Last name is required'
    if (!username.trim()) return 'Username is required'
    if (!email.trim()) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address'
    
    const passwordValidation = getPasswordValidation(password)
    const isPasswordValid = Object.values(passwordValidation).every(({ valid }) => valid)
    if (!isPasswordValid) return 'Password does not meet requirements'
    
    if (password !== confirmPassword) return 'Passwords do not match'
    if (!acceptTerms) return 'Please accept the terms and conditions'
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authService.register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })

      if (response?.success || response?.message?.toLowerCase().includes('successfully')) {
        router.push('/login')
      } else {
        throw new Error(response?.message || 'Registration failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordValidation = getPasswordValidation(formData.password)
  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Join Us Today</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <Card className="glass-effect shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-gray-800">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Fill in your information to create a new account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-pink-200 bg-pink-50">
                  <AlertDescription className="text-pink-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  id="firstName" 
                  name="firstName" 
                  type="text" 
                  placeholder="John" 
                  icon={User}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <InputField 
                  id="lastName" 
                  name="lastName" 
                  type="text" 
                  placeholder="Doe" 
                  icon={User}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <InputField 
                id="username" 
                name="username" 
                type="text" 
                placeholder="johndoe" 
                icon={User}
                value={formData.username}
                onChange={handleInputChange}
                required
              />

              <InputField 
                id="email" 
                name="email" 
                type="email" 
                placeholder="john@example.com" 
                icon={Mail}
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <InputField 
                id="phone" 
                name="phone" 
                type="tel" 
                placeholder="+1 (555) 123-4567" 
                icon={Phone}
                value={formData.phone}
                onChange={handleInputChange}
              />

              <div className="space-y-2">
                <InputField 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="Create a strong password" 
                  icon={Lock}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  showToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
                
                {formData.password && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                      </div>
                      <span className={`text-xs ${
                        passwordStrength.score < 2 ? 'text-red-500' :
                        passwordStrength.score < 4 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1 p-2 bg-gray-50 rounded">
                      {Object.entries(passwordValidation).map(([key, { valid, text }]) => (
                        <ValidationItem key={key} valid={valid} text={text} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <InputField 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your password" 
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  showToggle
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />
                
                {passwordsMatch && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    Passwords match
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-pink-600 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-pink-600 hover:underline">Privacy Policy</Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-6">
            <div className="w-full text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}