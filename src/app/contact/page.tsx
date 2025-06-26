import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-center gradient-text mb-12">Contact Us</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Our Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Address</h3>
                      <p className="text-gray-600">123 Hardware Street, Mumbai, Maharashtra, India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Phone</h3>
                      <p className="text-gray-600">+91 98765 43210</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Email</h3>
                      <p className="text-gray-600">info@mahalaxmihardware.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Working Hours</h3>
                      <p className="text-gray-600">Monday - Saturday: 9 AM - 7 PM</p>
                      <p className="text-gray-600">Sunday: 10 AM - 4 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Visit Us</h2>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map will be shown here</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Form */}
          <div>
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input id="email" placeholder="Your email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input id="subject" placeholder="Subject of your message" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea id="message" placeholder="Your message..." rows={6} />
                  </div>
                  <Button className="bg-pink-500 hover:bg-pink-600">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}