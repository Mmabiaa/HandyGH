// src/App.jsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import AppRoutes from './Routes';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div
      className={`min-h-screen ${
        isLandingPage
          ? "bg-gradient-to-r from-primary to-primary/80 text-white"
          : "bg-gray-50"
      }`}
    >
      <AppRoutes />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
