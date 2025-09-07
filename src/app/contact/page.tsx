'use client'

import { useState, memo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

// Static contact data cached outside component
const contactInfo = [
  {
    icon: MapPin,
    title: 'Address',
    content: '123 Hardware Street, Mumbai, Maharashtra, India'
  },
  {
    icon: Phone,
    title: 'Phone',
    content: '+91 98765 43210'
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'info@mahalaxmihardware.com'
  },
  {
    icon: Clock,
    title: 'Working Hours',
    content: ['Monday - Saturday: 9 AM - 7 PM', 'Sunday: 10 AM - 4 PM']
  }
]

// Memoized contact info card
const ContactInfoCard = memo(() => (
  <Card className="glass-effect">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Our Contact Information</h2>
      <div className="space-y-4">
        {contactInfo.map((info, index) => {
          const IconComponent = info.icon
          return (
            <div key={index} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{info.title}</h3>
                {Array.isArray(info.content) ? (
                  info.content.map((line, lineIndex) => (
                    <p key={lineIndex} className="text-gray-600">{line}</p>
                  ))
                ) : (
                  <p className="text-gray-600">{info.content}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </CardContent>
  </Card>
))
ContactInfoCard.displayName = 'ContactInfoCard'

// Memoized map placeholder
const MapPlaceholder = memo(() => (
  <Card className="glass-effect">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Visit Us</h2>
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Interactive Map</p>
          <p className="text-gray-400 text-sm">Coming Soon</p>
        </div>
      </div>
    </CardContent>
  </Card>
))
MapPlaceholder.displayName = 'MapPlaceholder'

// Contact form component
const ContactForm = memo(() => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsSubmitted(true)
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      
      // Reset form after success
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' })
        setIsSubmitted(false)
      }, 2000)
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData])

  const isFormValid = formData.name && formData.email && formData.subject && formData.message

  if (isSubmitted) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
          <p className="text-gray-600">Thank you for contacting us. We'll respond within 24 hours.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-effect">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name *</label>
              <Input 
                id="name" 
                name="name"
                placeholder="Your name" 
                value={formData.name}
                onChange={handleInputChange}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email *</label>
              <Input 
                id="email" 
                name="email"
                type="email"
                placeholder="Your email" 
                value={formData.email}
                onChange={handleInputChange}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">Subject *</label>
            <Input 
              id="subject" 
              name="subject"
              placeholder="Subject of your message" 
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">Message *</label>
            <Textarea 
              id="message" 
              name="message"
              placeholder="Your message..." 
              rows={6} 
              value={formData.message}
              onChange={handleInputChange}
              required
              className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50"
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
})
ContactForm.displayName = 'ContactForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center gradient-text mb-12">Contact Us</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <ContactInfoCard />
            <MapPlaceholder />
          </div>
          
          {/* Contact Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}