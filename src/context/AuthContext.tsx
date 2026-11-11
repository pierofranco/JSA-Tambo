import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RolUsuario } from '../types/pos';
import { ADMIN_PIN } from '../data/initialProducts';

interface AuthContextType {
  rol: RolUsuario;
  nombreRol: string;
  loginCajero: () => void;
  loginAdmin: (pin: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isCajero: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rol, setRol] = useState<RolUsuario>(() => {
    const saved = localStorage.getItem('tambopos_rol');
    return (saved as RolUsuario) || 'INVITADO';
  });

  useEffect(() => {
    localStorage.setItem('tambopos_rol', rol);
  }, [rol]);

  const loginCajero = () => {
    setRol('CAJERO');
  };

  const loginAdmin = (pin: string): boolean => {
    if (pin === ADMIN_PIN) {
      setRol('ADMIN');
      return true;
    }
    return false;
  };

  const logout = () => {
    setRol('INVITADO');
  };

  const nombreRol = rol === 'ADMIN' ? 'Administrador' : rol === 'CAJERO' ? 'Cajero Activo' : 'Sin Sesión';

  return (
    <AuthContext.Provider
      value={{
        rol,
        nombreRol,
        loginCajero,
        loginAdmin,
        logout,
        isAdmin: rol === 'ADMIN',
        isCajero: rol === 'CAJERO'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider (Context Hook)');
  }
  return context;
};

