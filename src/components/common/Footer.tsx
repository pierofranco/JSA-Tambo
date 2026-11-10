import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto border-top border-secondary">
      <div className="container">
        <div className="row gy-3 align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <h6 className="fw-bold mb-1 text-tambo-yellow">
              <i className="bi bi-shop me-2"></i>TAMBO POS - Arquitectura React Avanzada
            </h6>
            <p className="text-secondary small mb-0">
              Integración total: JSX/TSX • Bootstrap 5 • React Router • Hooks (State, Context, Ref, Resource) • Servicios REST (Fetch API, Axios, Alova)
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <span className="badge bg-secondary me-2">React 18</span>
            <span className="badge bg-secondary me-2">TypeScript</span>
            <span className="badge bg-secondary me-2">Vite</span>
            <span className="badge bg-secondary">Bootstrap 5.3</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

