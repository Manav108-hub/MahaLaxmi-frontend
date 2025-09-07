'use client'

import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { useProfile, useUpdateProfile } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Mail, Phone, MapPin, Building, Navigation, Hash, CheckCircle, AlertCircle } from 'lucide-react'

// Memoized loading state
const LoadingState = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex justify-center items-center">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
        <User className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-pink-400" />
      </div>
      <p className="text-pink-600 font-medium">Loading your profile...</p>
    </div>
  </div>
))
LoadingState.displayName = 'LoadingState'

// Memoized error state
const ErrorState = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex justify-center items-center p-6">
    <Card className="max-w-md w-full border-red-200 shadow-lg">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4">Failed to load your profile. Please try refreshing the page.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-pink-500 hover:bg-pink-600"
        >
          Refresh Page
        </Button>
      </CardContent>
    </Card>
  </div>
))
ErrorState.displayName = 'ErrorState'

// Memoized account overview card
const AccountOverviewCard = memo(({ user }: { user: any }) => {
  const userInitial = useMemo(() => 
    user?.name?.charAt(0) || user?.username?.charAt(0) || 'U', 
    [user?.name, user?.username]
  )

  return (
    <Card className="glass-effect border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-pink-700">
          <User className="h-5 w-5" />
          Account Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-800">{user?.name || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Hash className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-semibold text-gray-800">{user?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
AccountOverviewCard.displayName = 'AccountOverviewCard'

// Memoized input field component
const InputField = memo(({ 
  id, 
  name, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required, 
  icon: Icon, 
  borderColor 
}: {
  id: string
  name: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  icon: React.ComponentType<{ className?: string }>
  borderColor: string
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-gray-700 font-medium">
      {id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1')}
      {required && ' *'}
    </Label>
    <div className="relative">
      <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`pl-10 ${borderColor}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  </div>
))
InputField.displayName = 'InputField'

export default function ProfilePage() {
  const { data: user, isLoading, error } = useProfile()
  const updateProfile = useUpdateProfile()
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  const [showSuccess, setShowSuccess] = useState(false)

  // Memoized user initial for header
  const userInitial = useMemo(() => 
    user?.name?.charAt(0) || user?.username?.charAt(0) || 'U', 
    [user?.name, user?.username]
  )

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      })
    }
  }, [user])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuccess(false)

    try {
      const result = await updateProfile.mutateAsync(formData)
      if (result.success) {
        setShowSuccess(true)
        // Auto-hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }, [formData, updateProfile])

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState />

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 text-white text-2xl font-bold mb-4 shadow-lg">
            {userInitial}
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Overview Card */}
          <div className="lg:col-span-1">
            <AccountOverviewCard user={user} />
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-pink-700">
                  <Mail className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Update your contact details and address information
                </p>
              </CardHeader>
              
              <CardContent>
                {/* Success Alert */}
                {showSuccess && (
                  <Alert className="mb-6 border-green-200 bg-green-50 animate-in slide-in-from-top-2 duration-300">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Profile updated successfully! Your changes have been saved.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Alert */}
                {updateProfile.isError && (
                  <Alert className="mb-6 border-red-200 bg-red-50 animate-in slide-in-from-top-2 duration-300" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {updateProfile.error || 'Failed to update profile. Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={Mail}
                        borderColor="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                      <InputField
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        icon={Phone}
                        borderColor="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address Information
                    </h3>
                    <div className="space-y-4">
                      <InputField
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your street address"
                        icon={Navigation}
                        borderColor="border-green-200 focus:border-green-400 focus:ring-green-400"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          icon={Building}
                          borderColor="border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                        <InputField
                          id="state"
                          name="state"
                          type="text"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          icon={MapPin}
                          borderColor="border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                        <InputField
                          id="pincode"
                          name="pincode"
                          type="text"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="000000"
                          icon={Hash}
                          borderColor="border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}