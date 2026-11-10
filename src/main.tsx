import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import './index.css';

// Montaje principal en el DOM mediante React 18 createRoot
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento raíz #root no encontrado en el DOM');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);

