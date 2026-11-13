import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { RolUsuario } from '../../types/pos';

interface RequireAuthProps {
  roles: RolUsuario[];
  children: ReactNode;
}

/**
 * Protege rutas en el cliente (mejor experiencia de navegación), pero la
 * seguridad real está en el backend: cada endpoint sensible revalida la
 * sesión y el rol contra la base de datos (ver server/auth.ts#requireAuth).
 * Este componente nunca debe considerarse la única barrera de seguridad.
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ roles, children }) => {
  const { rol, cargandoSesion } = useAuth();

  if (cargandoSesion) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="purple" />
      </div>
    );
  }

  if (!roles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
