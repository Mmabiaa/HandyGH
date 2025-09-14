import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ProviderCard = ({ 
  id, 
  name, 
  rating, 
  reviews, 
  category, 
  location, 
  priceRange, 
  image, 
  isVerified = true,
  isAvailable = true,
  className = ''
}) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="h-48 bg-gray-200 relative">
        <img 
          src={image || '/images/providers/default.jpg'} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/images/providers/default.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl">{name}</h3>
              {isVerified && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-200">{category}</p>
          </div>
        </div>
        
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-sm font-semibold px-2 py-1 rounded flex items-center">
          <Star className="w-3 h-3 fill-current mr-1" />
          {rating} ({reviews})
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{location || 'Accra, Ghana'}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-sm text-gray-600">
              {isAvailable ? 'Available Now' : 'Not Available'}
            </span>
          </div>
          {priceRange && (
            <span className="text-sm font-semibold text-gray-900">
              {priceRange}
            </span>
          )}
        </div>
        
        <Link 
          to={`/providers/${id}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
};

// Default props for the component
ProviderCard.defaultProps = {
  id: '',
  name: 'Service Provider',
  rating: 0,
  reviews: 0,
  category: 'General Service',
  location: '',
  priceRange: 'Contact for pricing',
  image: '',
  isVerified: true,
  isAvailable: true,
};

export default ProviderCard;
