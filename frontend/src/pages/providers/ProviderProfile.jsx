import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchProviderDetails();
  }, [id]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      const providerData = await bookingService.getProviderById(id);
      setProvider(providerData);
      
      // Fetch provider's services
      const servicesData = await bookingService.getAvailableServices();
      const providerServices = servicesData.filter(service => service.providerId === id);
      setServices(providerServices);
      
      // Mock reviews data - in real app, this would come from API
      setReviews([
        {
          id: 1,
          customerName: 'Ama Serwaa',
          rating: 5,
          comment: 'Excellent work! Very professional and punctual.',
          date: '2024-01-15'
        },
        {
          id: 2,
          customerName: 'Kofi Mensah',
          rating: 4,
          comment: 'Good service, would recommend to others.',
          date: '2024-01-10'
        },
        {
          id: 3,
          customerName: 'Efua Adjei',
          rating: 5,
          comment: 'Outstanding quality and attention to detail.',
          date: '2024-01-05'
        }
      ]);
    } catch (err) {
      setError('Failed to load provider details');
      console.error('Error fetching provider:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    navigate('/service-booking-flow', { 
      state: { 
        selectedService: service,
        selectedProvider: provider 
      } 
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name={i < rating ? "Star" : "Star"}
        size={16}
        className={i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The provider you are looking for does not exist.'}</p>
          <Link to="/search" className="text-primary hover:text-primary/80">
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Icon name="Wrench" size={24} className="text-primary" />
              <span className="text-xl font-bold text-gray-900">HandyGH</span>
            </Link>
            <Link 
              to="/search" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Back to Search
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Provider Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {/* Provider Image */}
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                <img 
                  src={provider.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'} 
                  alt={provider.businessName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Provider Details */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{provider.businessName}</h1>
                <p className="text-gray-600 mb-4">{provider.businessDescription}</p>
                
                {/* Rating */}
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="flex">
                    {renderStars(Math.round(provider.rating || 4.5))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {provider.rating || 4.5} ({provider.totalReviews || 24} reviews)
                  </span>
                </div>

                {/* Verification Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 mb-4">
                  <Icon name="Shield" size={16} className="mr-1" />
                  Verified Provider
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Icon name="MapPin" size={16} className="mr-3 text-gray-400" />
                  <span>{provider.location || 'Accra, Ghana'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Icon name="Phone" size={16} className="mr-3 text-gray-400" />
                  <span>{provider.phone || '+233 123 456 789'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Icon name="Mail" size={16} className="mr-3 text-gray-400" />
                  <span>{provider.email || 'contact@provider.com'}</span>
                </div>
              </div>

              {/* Experience */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Experience</span>
                  <span className="text-sm text-gray-900">{provider.experienceYears || 5}+ years</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-600">Jobs Completed</span>
                  <span className="text-sm text-gray-900">{provider.jobsCompleted || 150}+</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/service-booking-flow', { 
                    state: { selectedProvider: provider } 
                  })}
                >
                  <Icon name="Calendar" size={16} className="mr-2" />
                  Book Service
                </Button>
                <Button variant="outline" className="w-full">
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Icon name="Heart" size={16} className="mr-2" />
                  Add to Favorites
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Services and Reviews */}
          <div className="lg:col-span-2">
            {/* Services Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Offered</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.length > 0 ? services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <span className="text-sm font-semibold text-primary">
                        {bookingService.formatAmount(service.basePrice)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Duration: {service.duration || 60} mins
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleBookService(service)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <Icon name="Wrench" size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No services available at the moment</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>
              
              {/* Average Rating */}
              <div className="flex items-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mr-4">
                  {provider.rating || 4.5}
                </div>
                <div>
                  <div className="flex mb-1">
                    {renderStars(Math.round(provider.rating || 4.5))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Based on {provider.totalReviews || 24} reviews
                  </p>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary">
                            {review.customerName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.customerName}</p>
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-600 ml-11">{review.comment}</p>
                  </div>
                ))}
              </div>

              {/* Load More Reviews */}
              <div className="text-center mt-6">
                <Button variant="outline">
                  Load More Reviews
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;