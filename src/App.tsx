import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PosProvider } from './context/PosContext';
import { HeaderNavbar } from './components/common/HeaderNavbar';
import { RequireAuth } from './components/common/RequireAuth';
import { RoleSelector } from './pages/RoleSelector';
import { CajeroPOS } from './pages/CajeroPOS';
import { AdminDashboard } from './pages/AdminDashboard';
import { ServicesPage } from './pages/ServicesPage';
import { GuidePage } from './pages/GuidePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PosProvider>
          <div className="d-flex flex-column min-vh-100 tambo-app-wrapper">
            <HeaderNavbar />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<RoleSelector />} />
                <Route
                  path="/cajero"
                  element={
                    <RequireAuth roles={['ADMIN', 'CAJERO']}>
                      <CajeroPOS />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RequireAuth roles={['ADMIN']}>
                      <AdminDashboard />
                    </RequireAuth>
                  }
                />
                <Route path="/servicios-rest" element={<ServicesPage />} />
                <Route path="/guia-educativa" element={<GuidePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="bg-dark text-white text-center py-2 mt-auto small">
              <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>🏪 <strong>TAMBOPOS</strong> © 2026 - Sistema POS con React</span>
                <span className="text-secondary">
                  Tecnologías: React 18/19 | TSX & JSX | Bootstrap 5 | Hooks | Fetch · Axios · Alova
                </span>
              </div>
            </footer>
          </div>
        </PosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

