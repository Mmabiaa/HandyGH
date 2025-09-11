import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { StripeProvider } from './contexts/StripeContext';
import Routes from './Routes';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StripeProvider>
          <Routes />
        </StripeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;