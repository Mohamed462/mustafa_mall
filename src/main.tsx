import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <StoreSettingsProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
              <AuthModal />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </StoreSettingsProvider>
    </BrowserRouter>
  </StrictMode>
);
