import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/layout.css';
import './styles/components.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
