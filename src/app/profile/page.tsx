'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Save, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  // Memoized fetch function
  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await authService.getProfile()
      if (response.data?.user) {
        updateUser(response.data.user)
        setFormData({
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          address: response.data.user.address || '',
          city: response.data.user.city || '',
          state: response.data.user.state || '',
          pincode: response.data.user.pincode || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    }
  }, [updateUser])

  // Initialize form data when user loads
  useEffect(() => {
    if (user?.id) {
      fetchUserDetails()
    }
  }, [user?.id, fetchUserDetails])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await authService.updateProfile(formData)
      
      if (response.data?.user) {
        updateUser(response.data.user)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
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
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <Card className="glass-effect border-pink-200 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">Unable to load your profile information.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            My Profile
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your account information and personal details
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="glass-effect border-pink-200 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
                  <p className="text-gray-600 mb-3">@{user.username}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.role === 'ADMIN' && (
                      <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-pink-200 text-pink-700">
                      <Calendar className="h-3 w-3 mr-1" />
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        onClick={handleCancel}
                        variant="outline"
                        className="border-pink-200 text-pink-700 hover:bg-pink-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="glass-effect border-pink-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-pink-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-600">{formData.email || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-600">{formData.phone || 'Not provided'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-pink-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-pink-600" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="city" className="text-gray-700">City</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-600">{formData.city || 'Not provided'}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state" className="text-gray-700">State</Label>
                    {isEditing ? (
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-600">{formData.state || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="pincode" className="text-gray-700">Pincode</Label>
                    {isEditing ? (
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Pincode"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-600">{formData.pincode || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect border-pink-200">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Full Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="address" className="text-gray-700">Street Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-gray-600 min-h-[60px] flex items-center">
                    {formData.address || 'No address provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}