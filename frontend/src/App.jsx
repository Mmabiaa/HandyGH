// src/App.jsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </Router>
    </Provider>
  );
}

export default App;