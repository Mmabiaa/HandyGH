import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import UserLogin from './pages/user-login';
import ServiceBookingFlow from './pages/service-booking-flow';
import BookingManagement from './pages/booking-management';
import UserRegistration from './pages/user-registration';
import ProviderDashboard from './pages/provider-dashboard';
import CustomerDashboard from './pages/customer-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<BookingManagement />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/service-booking-flow" element={<ServiceBookingFlow />} />
        <Route path="/booking-management" element={<BookingManagement />} />
        <Route path="/user-registration" element={<UserRegistration />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
