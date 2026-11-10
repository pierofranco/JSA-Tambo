import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, Producto, TotalesCarrito, TicketVenta, Cliente, MetodoPago } from '../types';

// Banderas Bitwise (de la versión JSA-Tambo original)
const IGV_RATE = 0.18;
const FLAG_SIN_PROMO = 0;       // 0000
const FLAG_COMBO_BEBIDA = 1;    // 0001
const FLAG_MONTO_SUPERIOR = 2;  // 0010

// Acciones del useReducer
type CartAction =
  | { type: 'ADD_ITEM'; payload: Producto }
  | { type: 'CHANGE_QTY'; payload: { id: string; delta: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

interface CartState {
  items: CartItem[];
  ultimoTicket: TicketVenta | null;
  historialVentas: TicketVenta[];
}

const initialState: CartState = {
  items: [],
  ultimoTicket: null,
  historialVentas: []
};

function calcularTotales(items: CartItem[]): TotalesCarrito {
  const totalProductos = items.reduce((sum, item) => sum + (item.precioRegular * item.cantidad), 0);
  const totalRealOfertas = items.reduce((sum, item) => sum + (item.precioOferta * item.cantidad), 0);

  let descuentoTotal = totalProductos - totalRealOfertas;

  let flagPromociones = FLAG_SIN_PROMO;
  const tieneBebida = items.some(i => i.categoria === "Bebidas");

  if (tieneBebida) flagPromociones = flagPromociones | FLAG_COMBO_BEBIDA;
  if (totalRealOfertas > 50.00) flagPromociones = flagPromociones | FLAG_MONTO_SUPERIOR;

  // Promoción Tambo: S/ 1.00 de descuento adicional si lleva bebidas
  if ((flagPromociones & FLAG_COMBO_BEBIDA) !== 0 && items.length > 0) {
    descuentoTotal += 1.00;
  }

  // Promoción Tambo: S/ 3.00 si supera S/ 50.00
  if ((flagPromociones & FLAG_MONTO_SUPERIOR) !== 0) {
    descuentoTotal += 3.00;
  }

  const subtotalFinal = Math.max(0, totalProductos - descuentoTotal);
  const igvCalculado = Math.round((subtotalFinal * IGV_RATE) * 100) / 100;

  return {
    totalProductos,
    descuentoTotal,
    subtotalFinal,
    igvCalculado,
    promoBebidaAplicada: (flagPromociones & FLAG_COMBO_BEBIDA) !== 0,
    promoMontoMayorAplicada: (flagPromociones & FLAG_MONTO_SUPERIOR) !== 0
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const prod = action.payload;
      const index = state.items.findIndex(i => i.id === prod.id);

      if (index >= 0) {
        const itemActual = state.items[index];
        if (itemActual.cantidad + 1 > prod.stock) {
          return state; // No supera stock
        }
        const nuevosItems = [...state.items];
        nuevosItems[index] = {
          ...itemActual,
          cantidad: itemActual.cantidad + 1
        };
        return { ...state, items: nuevosItems };
      } else {
        if (prod.stock < 1) return state;
        const nuevoItem: CartItem = {
          id: prod.id,
          nombre: prod.nombre,
          categoria: prod.categoria,
          precioRegular: prod.precioRegular,
          precioOferta: prod.precioOferta,
          cantidad: 1,
          imagenUrl: prod.imagenUrl
        };
        return { ...state, items: [...state.items, nuevoItem] };
      }
    }

    case 'CHANGE_QTY': {
      const { id, delta } = action.payload;
      const index = state.items.findIndex(i => i.id === id);
      if (index === -1) return state;

      const item = state.items[index];
      const nuevaCantidad = item.cantidad + delta;

      if (nuevaCantidad <= 0) {
        return {
          ...state,
          items: state.items.filter(i => i.id !== id)
        };
      }

      const nuevosItems = [...state.items];
      nuevosItems[index] = { ...item, cantidad: nuevaCantidad };
      return { ...state, items: nuevosItems };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload)
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  totales: TotalesCarrito;
  totalUnidades: number;
  agregarAlCarrito: (producto: Producto) => void;
  cambiarCantidad: (id: string, delta: number) => void;
  eliminarDelCarrito: (id: string) => void;
  vaciarCarrito: () => void;
  procesarVenta: (cliente: Cliente, cajero: string, sucursal: string, metodoPago?: MetodoPago, pagoCon?: number, vuelto?: number) => TicketVenta;
  ultimoTicket: TicketVenta | null;
  historialVentas: TicketVenta[];
  despejarUltimoTicket: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [ultimoTicket, setUltimoTicket] = React.useState<TicketVenta | null>(null);
  const [historialVentas, setHistorialVentas] = React.useState<TicketVenta[]>([]);

  const totales = calcularTotales(state.items);
  const totalUnidades = state.items.reduce((acc, i) => acc + i.cantidad, 0);

  const agregarAlCarrito = (producto: Producto) => {
    dispatch({ type: 'ADD_ITEM', payload: producto });
  };

  const cambiarCantidad = (id: string, delta: number) => {
    dispatch({ type: 'CHANGE_QTY', payload: { id, delta } });
  };

  const eliminarDelCarrito = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const vaciarCarrito = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const procesarVenta = (
    cliente: Cliente,
    cajero: string,
    sucursal: string,
    metodoPago: MetodoPago = 'Efectivo',
    pagoCon?: number,
    vuelto?: number
  ): TicketVenta => {
    const ticket: TicketVenta = {
      idVenta: `TB-${Date.now().toString().slice(-6)}`,
      fecha: new Date().toLocaleString('es-PE'),
      cliente,
      items: [...state.items],
      totales,
      cajero,
      sucursal,
      metodoPago,
      pagoCon,
      vuelto
    };

    setUltimoTicket(ticket);
    setHistorialVentas(prev => [ticket, ...prev]);
    dispatch({ type: 'CLEAR_CART' });
    return ticket;
  };

  const despejarUltimoTicket = () => setUltimoTicket(null);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totales,
        totalUnidades,
        agregarAlCarrito,
        cambiarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        procesarVenta,
        ultimoTicket,
        historialVentas,
        despejarUltimoTicket
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext debe ser utilizado dentro de un CartProvider');
  }
  return context;
};

