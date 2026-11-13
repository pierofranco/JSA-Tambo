import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { RolUsuario } from '../types/pos';

interface SessionUser {
  id: number;
  username: string;
  rol: 'ADMIN' | 'CAJERO';
  nombreCompleto: string;
}

interface AuthContextType {
  rol: RolUsuario;
  nombreRol: string;
  username: string | null;
  nombreCompleto: string | null;
  cargandoSesion: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; mensaje?: string; rol?: 'ADMIN' | 'CAJERO' }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isCajero: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<SessionUser | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);

  const cargarSesion = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        setUsuario(await res.json());
      } else {
        setUsuario(null);
      }
    } catch {
      setUsuario(null);
    } finally {
      setCargandoSesion(false);
    }
  }, []);

  useEffect(() => {
    cargarSesion();
  }, [cargarSesion]);

  const login = async (
    username: string,
    password: string
  ): Promise<{ ok: boolean; mensaje?: string; rol?: 'ADMIN' | 'CAJERO' }> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, mensaje: data.message || 'No se pudo iniciar sesión.' };
    }
    setUsuario(data);
    return { ok: true, rol: data.rol };
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUsuario(null);
  };

  const rol: RolUsuario = usuario?.rol || 'INVITADO';
  const nombreRol = rol === 'ADMIN' ? 'Administrador' : rol === 'CAJERO' ? 'Cajero Activo' : 'Sin Sesión';

  return (
    <AuthContext.Provider
      value={{
        rol,
        nombreRol,
        username: usuario?.username ?? null,
        nombreCompleto: usuario?.nombreCompleto ?? null,
        cargandoSesion,
        login,
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
