// src/App.jsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ApiProvider } from '@reduxjs/toolkit/query/react';
import { apiSlice } from './store/slices/apiSlice';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Provider store={store}>
      <ApiProvider api={apiSlice}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <Toaster position="top-right" />
          </div>
        </Router>
      </ApiProvider>
    </Provider>
  );
}

export default App;