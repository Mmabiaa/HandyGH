// In src/Routes.jsx
import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import NotFound from "pages/NotFound";
import UserLogin from './pages/user-login/index';
import ServiceBookingFlow from './pages/service-booking-flow/index';
import BookingManagement from './pages/booking-management/index';
import UserRegistration from './pages/user-registration/index';
import ProviderDashboard from './pages/provider-dashboard/index';
import CustomerDashboard from './pages/customer-dashboard/index';
import LandingPage from './pages/landing-page/LandingPage';
import SearchPage from './pages/search/SearchPage';
import ProviderProfile from './pages/providers/ProviderProfile';
import AboutPage from './pages/about/AboutPage';
import ContactPage from './pages/contact/ContactPage';

const Routes = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/providers/:id" element={<ProviderProfile />} />
        
        {/* Authentication routes */}
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-registration" element={<UserRegistration />} />
        
        {/* Protected routes - Customer only */}
        <Route 
          path="/service-booking-flow" 
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <ServiceBookingFlow />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer-dashboard" 
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes - Provider only */}
        <Route 
          path="/provider-dashboard" 
          element={
            <ProtectedRoute requiredRole="PROVIDER">
              <ProviderDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected routes - Both Customer and Provider */}
        <Route 
          path="/booking-management" 
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER']}>
              <BookingManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

export default Routes;