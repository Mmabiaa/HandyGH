// In src/pages/providers/ProviderProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle, Calendar, MessageSquare, Phone, Mail, ArrowLeft, Share2, Heart, Award, Shield, Clock as ClockIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ProviderProfile = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  // Mock data - replace with API call
  useEffect(() => {
    const fetchProvider = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const mockProvider = {
        id,
        name: 'Elite Cleaners',
        rating: 4.9,
        reviews: 124,
        category: 'Home Cleaning',
        location: 'Accra, Ghana',
        priceRange: 'GHS 150 - 300',
        description: 'Professional cleaning services for homes and offices. We provide deep cleaning, regular maintenance, and specialized cleaning services with eco-friendly products.',
        services: [
          { name: 'Standard Cleaning', price: 'GHS 150', duration: '2-3 hours' },
          { name: 'Deep Cleaning', price: 'GHS 300', duration: '4-5 hours' },
          { name: 'Office Cleaning', price: 'GHS 200', duration: '3-4 hours' },
        ],
        availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        workingHours: '8:00 AM - 6:00 PM',
        images: [
          '/images/providers/cleaner-1.jpg',
          '/images/providers/cleaner-2.jpg',
          '/images/providers/cleaner-3.jpg',
        ],
        isAvailable: true,
        isVerified: true,
        yearsInBusiness: 5,
        completedJobs: 342,
        responseRate: '98%',
        responseTime: 'within 1 hour',
      };
      
      setProvider(mockProvider);
      setLoading(false);
    };

    fetchProvider();
  }, [id]);

  // Generate time slots
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-white rounded-xl shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="h-96 bg-white rounded-xl shadow-sm p-6">
                <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-600 mb-6">The service provider you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/search"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link
              to="/search"
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">{provider.name}</h1>
            <div className="ml-auto flex space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-700">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-700">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-96 bg-gray-100 relative">
                <img
                  src={provider.images?.[0] || '/images/providers/default.jpg'}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 flex space-x-2 overflow-x-auto">
                  {provider.images?.map((img, index) => (
                    <div key={index} className="flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 border-white shadow-sm">
                      <img
                        src={img}
                        alt={`${provider.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{provider.name}</h2>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{provider.location}</span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{provider.rating} ({provider.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                {provider.isVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px space-x-8">
                  {['about', 'services', 'reviews', 'portfolio'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="prose max-w-none">
                {activeTab === 'about' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">About {provider.name}</h3>
                    <p className="text-gray-600 mb-6">{provider.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Award className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Years in Business</h4>
                          <p className="text-sm text-gray-600">{provider.yearsInBusiness}+ years</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Completed Jobs</h4>
                          <p className="text-sm text-gray-600">{provider.completedJobs}+ jobs</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Response Rate</h4>
                          <p className="text-sm text-gray-600">{provider.responseRate} response rate</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <ClockIcon className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">Avg. Response Time</h4>
                          <p className="text-sm text-gray-600">{provider.responseTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Services Offered</h3>
                    <div className="space-y-4">
                      {provider.services.map((service, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{service.name}</h4>
                              <p className="text-sm text-gray-500">{service.duration}</p>
                            </div>
                            <span className="text-lg font-semibold text-gray-900">{service.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Customer Reviews</h3>
                    <div className="space-y-6">
                      {[1, 2, 3].map((review) => (
                        <div key={review} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              {['A', 'B', 'C'][review - 1]}
                            </div>
                            <div className="ml-4">
                              <h4 className="font-medium text-gray-900">Customer {review}</h4>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= 5 - review ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                                <span className="ml-2 text-sm text-gray-500">2 weeks ago</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-2">
                            Great service! The team was professional and did an excellent job cleaning my apartment.
                            I would definitely hire them again.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Portfolio</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {provider.images?.map((img, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={img}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Book an Appointment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <div className="mt-1 grid grid-cols-7 gap-1 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={index} className="text-xs text-gray-500 py-1">{day}</div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const dayOfWeek = date.getDay();
                      const dayOfMonth = date.getDate();
                      const isAvailable = provider.availability.includes(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]);
                      const isSelected = selectedDate === i;
                      
                      return (
                        <button
                          key={i}
                          disabled={!isAvailable}
                          onClick={() => setSelectedDate(i)}
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : isAvailable
                              ? 'text-gray-900 hover:bg-gray-100'
                              : 'text-gray-300'
                          }`}
                        >
                          {dayOfMonth}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate !== null && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 text-sm rounded-md ${
                            selectedTime === time
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Service Options</h4>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg">
                    {provider.services.map((service, index) => (
                      <option key={index} value={service.name}>
                        {service.name} - {service.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-medium text-gray-900">GHS 150.00</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Service Fee</span>
                    <span className="text-sm text-gray-600">GHS 15.00</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 border-t border-gray-200 pt-2 mt-2">
                    <span>Total</span>
                    <span>GHS 165.00</span>
                  </div>
                </div>

                <button
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors ${
                    !selectedDate || !selectedTime ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!selectedDate || !selectedTime}
                >
                  Book Now
                </button>

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{provider.workingHours}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>Message</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">+233 20 123 4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">contact@elitecleaners.com</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    123 Service Lane, East Legon<br />
                    Accra, Ghana
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;