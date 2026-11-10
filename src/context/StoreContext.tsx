import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Cliente, RestClientType } from '../types';
import { CLIENTES_MOCK } from '../services/apiMockData';

interface StoreContextType {
  clienteActivo: Cliente;
  setClienteActivo: (cliente: Cliente) => void;
  resetCliente: () => void;
  cajeroActivo: string;
  setCajeroActivo: (cajero: string) => void;
  sucursalActiva: string;
  servicioRestActivo: RestClientType;
  setServicioRestActivo: (servicio: RestClientType) => void;
}

const clienteInicial: Cliente = {
  tipoDoc: 'DNI',
  numDoc: '72839401',
  nombreCompleto: 'Piero Franco',
  direccion: 'Av. Larco 450, Miraflores',
  esSocioPrime: true
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clienteActivo, setClienteActivo] = useState<Cliente>(clienteInicial);
  const [cajeroActivo, setCajeroActivo] = useState<string>('Piero Franco (Caja 01)');
  const [sucursalActiva] = useState<string>('Tambo+ Miraflores Larco');
  const [servicioRestActivo, setServicioRestActivo] = useState<RestClientType>('Fetch API');

  const resetCliente = () => {
    setClienteActivo({
      tipoDoc: 'DNI',
      numDoc: '',
      nombreCompleto: 'CLIENTE ANÓNIMO',
      esSocioPrime: false
    });
  };

  return (
    <StoreContext.Provider
      value={{
        clienteActivo,
        setClienteActivo,
        resetCliente,
        cajeroActivo,
        setCajeroActivo,
        sucursalActiva,
        servicioRestActivo,
        setServicioRestActivo
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext debe usarse dentro de StoreProvider');
  }
  return context;
};

