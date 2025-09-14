import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Shield, Clock, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - replace with actual API calls
const categories = [
  { id: 1, name: 'Home Cleaning', icon: '🧹' },
  { id: 2, name: 'Plumbing', icon: '🚰' },
  { id: 3, name: 'Electrical', icon: '💡' },
  { id: 4, name: 'Carpentry', icon: '📦' },
];

const featuredProviders = [
    {
        id: 1,
        name: 'Elite Cleaners',
        rating: 4.9,
        reviews: 124,
        category: 'Cleaning',
        image: 'https://i.pinimg.com/736x/bc/a5/32/bca532dae317b32b15e1d8e66978b568.jpg',
      },
      {
        id: 2,
        name: 'ProFix Plumbing',
        rating: 4.7,
        reviews: 89,
        category: 'Plumbing',
        image: 'https://i.pinimg.com/736x/f6/76/1d/f6761db73758139be3247097595433b5.jpg',
      },
      {
        id: 3,
        name: 'Crafted Carpentry',
        rating: 4.8,
        reviews: 102,
        category: 'Carpentry',
        image: 'https://i.pinimg.com/736x/60/5e/5c/605e5c6a4e9831c7b98501ae6497ef8b.jpg',
      },
  // Add more providers
];

const testimonials = [
  {
    id: 1,
    name: 'Ama K.',
    role: 'Homeowner',
    content: 'Found a reliable plumber within minutes. The service was excellent!',
    rating: 5,
    src: 'https://i.pinimg.com/736x/ca/53/8d/ca538d479d5d54352be7733a701956c9.jpg'
  },
  // Add more testimonials
];

const features = [
  {
    icon: <Search className="w-8 h-8 text-blue-600" />,
    title: 'Easy Search',
    description: 'Find the perfect service provider in just a few clicks.',
  },
  {
    icon: <Shield className="w-8 h-8 text-green-600" />,
    title: 'Verified Pros',
    description: 'All providers are thoroughly vetted and background checked.',
  },
  {
    icon: <Clock className="w-8 h-8 text-purple-600" />,
    title: '24/7 Support',
    description: 'Our team is always here to help with any questions.',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🏠</span>
              </div>
              <span className="text-xl font-bold text-gray-900">HandyGH</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link to="/search" className="text-gray-700 hover:text-blue-600">Services</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
              <Link to="/user-login" className="text-gray-700 hover:text-blue-600">Login</Link>
            </nav>
            <div className="flex space-x-4"> 
              <Link 
                to="/user-registration" 
                className="bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              >
                Find Trusted Service Providers in Ghana
              </motion.h1>
              <p className="text-xl mb-8 text-blue-100">
                Book skilled professionals for all your home service needs. Quick, reliable, and hassle-free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/user-registration" 
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Get Started
                </Link>
                <Link 
                  to="/search" 
                  className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Browse Services
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://i.pinimg.com/736x/18/e1/b5/18e1b58b3094b5d5dfc68908a87fa8a2.jpg" 
                alt="Service professionals" 
                className="w-full max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="container mx-auto px-4 -mt-8 z-10 relative">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">What service do you need?</label>
              <div className="relative">
                <input
                  type="text"
                  id="service"
                  placeholder="e.g. Plumber, Electrician, Cleaner"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  placeholder="Enter location"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex items-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg w-full md:w-auto transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md text-center cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-800">{category.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-blue-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Getting the help you need is simple with our three-step process
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: '1', title: 'Search & Compare', description: 'Browse profiles, read reviews, and compare prices.' },
              { number: '2', title: 'Book Instantly', description: 'Schedule a service at a time that works for you.' },
              { number: '3', title: 'Get It Done', description: 'Relax while we connect you with the right professional.' },
            ].map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm text-center"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Top-Rated Service Providers</h2>
            <Link to="/search" className="text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <motion.div
                key={provider.id}
                whileHover={{ y: -5 }}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={provider.image} 
                    alt={provider.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-sm font-semibold px-2 py-1 rounded flex items-center">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    {provider.rating}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{provider.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{provider.category}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="mr-2">{provider.rating} ({provider.reviews} reviews)</span>
                  </div>
                  <Link 
                    to={`/providers/${provider.id}`}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors block text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-blue-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose HandyGH?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl text-center"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Join thousands of satisfied customers who trust HandyGH for their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/user-registration"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-500 mr-2" />
              <span className="font-medium">Verified Professionals</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-500 mr-2" />
              <span className="font-medium">24/7 Customer Support</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-8 h-8 text-purple-500 mr-2" />
              <span className="font-medium">Easy Booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
