import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { PosView } from './views/PosView';
import { ProductManagerView } from './views/ProductManagerView';
import { ReactConceptsView } from './views/ReactConceptsView';
import { HooksPlaygroundView } from './views/HooksPlaygroundView';
import { ServicesView } from './views/ServicesView';
import { IntegrationView } from './views/IntegrationView';

export const App: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* 1. Barra de Navegación Global (Elementos de React: Navegación) */}
      <Navbar />

      {/* 2. Enrutador Principal SPA (React Router DOM) */}
      <main className="flex-grow-1">
        <Routes>
          {/* Ruta Principal: Sistema Punto de Venta Tambo */}
          <Route path="/" element={<PosView />} />

          {/* Gestión de Inventario y Formulario de Productos */}
          <Route path="/productos" element={<ProductManagerView />} />

          {/* Módulo 1 & 2: Introducción a React, JSX vs TSX, Bootstrap, Elementos */}
          <Route path="/conceptos-react" element={<ReactConceptsView />} />

          {/* Módulo 3: Hooks (State, Context, Ref, Resource) */}
          <Route path="/hooks" element={<HooksPlaygroundView />} />

          {/* Módulo 4: Servicios REST (Fetch API, Axios, Alova) */}
          <Route path="/servicios" element={<ServicesView />} />

          {/* Módulo 5: Integración Total de Temas */}
          <Route path="/integracion" element={<IntegrationView />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Pie de Página */}
      <Footer />
    </div>
  );
};

export default App;

