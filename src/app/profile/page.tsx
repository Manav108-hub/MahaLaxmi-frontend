'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { User, Mail, MapPin, Calendar, Shield, Edit3, Save, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'

type ProfileForm = {
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading profile...</p>
    </div>
  </div>
)

const NotFoundState = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
    <Card className="glass-effect border-pink-200 w-full max-w-md">
      <CardContent className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Not Found</h2>
        <p className="text-gray-600">Unable to load your profile information.</p>
      </CardContent>
    </Card>
  </div>
)

const ProfileHeader = ({ user, isEditing, isSaving, onEdit, onSave, onCancel }: {
  user: any
  isEditing: boolean
  isSaving: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}) => (
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
            <Button onClick={onEdit} className="bg-pink-500 hover:bg-pink-600 text-white">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button onClick={onSave} disabled={isSaving} className="bg-pink-500 hover:bg-pink-600 text-white">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={onCancel} variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

const FormField = ({ 
  id, 
  label, 
  value, 
  isEditing, 
  onChange, 
  type = 'text', 
  placeholder = '',
  rows
}: {
  id: string
  label: string
  value: string
  isEditing: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  type?: string
  placeholder?: string
  rows?: number
}) => (
  <div>
    <Label htmlFor={id} className="text-gray-700">{label}</Label>
    {isEditing ? (
      rows ? (
        <Textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1"
          rows={rows}
        />
      ) : (
        <Input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1"
        />
      )
    ) : (
      <p className="mt-1 text-gray-600">{value || 'Not provided'}</p>
    )}
  </div>
)

const InfoCard = ({ title, icon: Icon, children }: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) => (
  <Card className="glass-effect border-pink-200">
    <CardHeader>
      <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
        <Icon className="h-5 w-5 text-pink-600" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
)

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<ProfileForm>({
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  const initializeFormData = useCallback((userData: any) => {
    setFormData({
      email: userData?.email || '',
      phone: userData?.phone || '',
      address: userData?.address || '',
      city: userData?.city || '',
      state: userData?.state || '',
      pincode: userData?.pincode || ''
    })
  }, [])

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await authService.getProfile()
      if (response.data?.user) {
        updateUser(response.data.user)
        initializeFormData(response.data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    }
  }, [updateUser, initializeFormData])

  useEffect(() => {
    if (user?.id) {
      fetchUserDetails()
    }
  }, [user?.id, fetchUserDetails])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
    initializeFormData(user)
    setIsEditing(false)
  }

  if (loading) return <LoadingState />
  if (!user) return <NotFoundState />

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">My Profile</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your account information and personal details
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ProfileHeader
            user={user}
            isEditing={isEditing}
            isSaving={isSaving}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <InfoCard title="Contact Information" icon={Mail}>
              <FormField
                id="email"
                label="Email Address"
                value={formData.email}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="email"
                placeholder="Enter your email"
              />
              <FormField
                id="phone"
                label="Phone Number"
                value={formData.phone}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="tel"
                placeholder="Enter your phone number"
              />
            </InfoCard>

            <InfoCard title="Address Information" icon={MapPin}>
              <FormField
                id="city"
                label="City"
                value={formData.city}
                isEditing={isEditing}
                onChange={handleInputChange}
                placeholder="Enter your city"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  id="state"
                  label="State"
                  value={formData.state}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  placeholder="State"
                />
                <FormField
                  id="pincode"
                  label="Pincode"
                  value={formData.pincode}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  placeholder="Pincode"
                />
              </div>
            </InfoCard>
          </div>

          <Card className="glass-effect border-pink-200">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Full Address</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                id="address"
                label="Street Address"
                value={formData.address}
                isEditing={isEditing}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}