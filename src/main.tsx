import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Estilos de Bootstrap 5 y Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Estilos corporativos de TamboPOS
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

