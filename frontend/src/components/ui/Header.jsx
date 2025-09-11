import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ userType = 'customer', isAuthenticated = false, notificationCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: userType === 'customer' ? '/customer-dashboard' : '/provider-dashboard',
      icon: 'LayoutDashboard',
      roleAccess: 'both'
    },
    {
      label: 'Bookings',
      path: '/booking-management',
      icon: 'Calendar',
      roleAccess: 'both'
    },
    {
      label: 'Find Services',
      path: '/service-booking-flow',
      icon: 'Search',
      roleAccess: 'customer'
    }
  ];

  const filteredNavItems = navigationItems?.filter(item => 
    item?.roleAccess === 'both' || item?.roleAccess === userType
  );

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleAuth = (type) => {
    if (type === 'login') {
      navigate('/user-login');
    } else {
      navigate('/user-registration');
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event?.target?.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border nav-shadow z-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer micro-animation hover:opacity-80"
              onClick={() => navigate(isAuthenticated ? (userType === 'customer' ? '/customer-dashboard' : '/provider-dashboard') : '/')}
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3">
                <Icon name="Wrench" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-foreground">HandyGH</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6">
              {filteredNavItems?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium micro-animation relative ${
                    isActiveRoute(item?.path)
                      ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={16} className="mr-2" />
                  {item?.label}
                  {item?.label === 'Bookings' && notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          )}

          {/* Search for Customers */}
          {isAuthenticated && userType === 'customer' && (
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent micro-animation"
                  onClick={() => navigate('/service-booking-flow')}
                />
              </div>
            </div>
          )}

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <button className="relative p-2 text-muted-foreground hover:text-foreground micro-animation">
                  <Icon name="Bell" size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* User Menu */}
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted micro-animation"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="User" size={16} color="white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-foreground">John Doe</div>
                      <div className="text-xs text-muted-foreground capitalize">{userType}</div>
                    </div>
                    <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md modal-shadow animate-fade-in">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/account');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted micro-animation"
                        >
                          <Icon name="Settings" size={16} className="mr-3" />
                          Account Settings
                        </button>
                        <button
                          onClick={() => {
                            // Handle logout
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted micro-animation"
                        >
                          <Icon name="LogOut" size={16} className="mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => handleAuth('login')}>
                  Sign In
                </Button>
                <Button variant="default" onClick={() => handleAuth('register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted micro-animation"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-in">
          <div className="px-4 py-3 space-y-3">
            {/* Mobile Search for Customers */}
            {isAuthenticated && userType === 'customer' && (
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  onClick={() => {
                    navigate('/service-booking-flow');
                    setIsMobileMenuOpen(false);
                  }}
                />
              </div>
            )}

            {/* Mobile Navigation Items */}
            {isAuthenticated ? (
              <>
                {filteredNavItems?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium micro-animation ${
                      isActiveRoute(item?.path)
                        ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={16} className="mr-3" />
                    {item?.label}
                    {item?.label === 'Bookings' && notificationCount > 0 && (
                      <span className="ml-auto bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                ))}
                
                <hr className="border-border" />
                
                <button
                  onClick={() => {
                    navigate('/account');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted micro-animation"
                >
                  <Icon name="Settings" size={16} className="mr-3" />
                  Account Settings
                </button>
                
                <button
                  onClick={() => {
                    // Handle logout
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted micro-animation"
                >
                  <Icon name="LogOut" size={16} className="mr-3" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Button variant="ghost" fullWidth onClick={() => handleAuth('login')}>
                  Sign In
                </Button>
                <Button variant="default" fullWidth onClick={() => handleAuth('register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;