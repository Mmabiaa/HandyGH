import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Sliders, X, MapPin, Star, Filter, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProviderCard from '../../components/ProviderCard';
import Icon from '../../components/AppIcon';

// Mock data - replace with actual API calls
const mockProviders = [
  {
    id: '1',
    name: 'Elite Cleaners',
    rating: 4.9,
    reviews: 124,
    category: 'Home Cleaning',
    location: 'Accra, Ghana',
    priceRange: 'GHS 150 - 300',
    image: '/images/providers/cleaner.jpg',
    isAvailable: true,
    isVerified: true,
  },
  // Add more mock providers
];

const categories = [
  'All Categories',
  'Home Cleaning',
  'Plumbing',
  'Electrical',
  'Moving',
  'Gardening',
  'Pest Control',
  'Painting',
  'AC Repair',
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All Categories');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [rating, setRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    if (category && category !== 'All Categories') params.set('category', category);
    
    // Update URL without causing a navigation
    setSearchParams(params, { replace: true });
    
    // Simulate API call
    const fetchProviders = async () => {
      setIsLoading(true);
      // In a real app, you would make an API call here with the search parameters
      await new Promise(resolve => setTimeout(resolve, 500));
      setProviders(mockProviders);
      setIsLoading(false);
    };
    
    fetchProviders();
  }, [query, location, category, searchParams, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect will handle the search when query/location changes
  };

  const clearFilters = () => {
    setQuery('');
    setLocation('');
    setCategory('All Categories');
    setPriceRange([0, 1000]);
    setRating(0);
    setActiveFilters({});
  };

  const toggleFilter = (filterName) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Icon name="Wrench" size={24} className="text-primary" />
              <span className="text-xl font-bold text-gray-900">HandyGH</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-primary">About</Link>
              <Link to="/search" className="text-primary font-medium">Services</Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary">Contact</Link>
              <Link to="/user-login" className="text-gray-700 hover:text-primary">Login</Link>
            </nav>
            <div className="flex space-x-4">
              <Link 
                to="/user-login" 
                className="text-gray-700 hover:text-primary font-medium"
              >
                Sign In
              </Link>
              <Link 
                to="/user-registration" 
                className="bg-primary text-white hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What service are you looking for?"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Sliders className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </form>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white shadow-md overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (GHS)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min={priceRange[0]}
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 rounded-full ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star className={`h-6 w-6 ${rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                    {rating > 0 && (
                      <button
                        type="button"
                        onClick={() => setRating(0)}
                        className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Filters:</span>
            
            {query && (
              <button
                onClick={() => setQuery('')}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                {query}
                <X className="ml-1 h-3 w-3" />
              </button>
            )}
            
            {location && (
              <button
                onClick={() => setLocation('')}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                {location}
                <X className="ml-1 h-3 w-3" />
              </button>
            )}
            
            {category !== 'All Categories' && (
              <button
                onClick={() => setCategory('All Categories')}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                {category}
                <X className="ml-1 h-3 w-3" />
              </button>
            )}
            
            {rating > 0 && (
              <button
                onClick={() => setRating(0)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                {rating}+ Stars
                <X className="ml-1 h-3 w-3" />
              </button>
            )}
            
            {(query || location || category !== 'All Categories' || rating > 0) && (
              <button
                onClick={clearFilters}
                className="ml-2 text-sm text-blue-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLoading ? 'Searching...' : `${providers.length} Services Found`}
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-label="Grid view"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-label="Map view"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeleton
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : providers.length > 0 ? (
              providers.map((provider) => (
                <ProviderCard key={provider.id} {...provider} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No services found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : (
          // Map View
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[600px] relative">
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 text-gray-400">
                  <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Map View</h3>
                <p className="mt-1 text-gray-500">Map integration will be displayed here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {providers.length > 0 && !isLoading && (
          <div className="mt-10 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 rounded-md border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600">
                1
              </button>
              <button className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <span className="px-3 py-1 text-gray-500">...</span>
              <button className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                10
              </button>
              <button className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
