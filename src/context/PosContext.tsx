import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Producto, ItemCarrito, Venta, ClienteComprobante, TotalesCalculados } from '../types/pos';
import { useCartReducer } from '../hooks/useCartReducer';
import { ApiClient, ServiceDriver, RequestMetrics } from '../services/apiClient';
import { IGV_RATE } from '../data/initialProducts';

interface PosContextType {
  // Productos & Filtros
  productos: Producto[];
  loadingProductos: boolean;
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (cat: string) => void;
  busqueda: string;
  setBusqueda: (q: string) => void;
  recargarProductos: () => Promise<void>;

  // Carrito (gestionado con useCartReducer - State Hook)
  cart: ItemCarrito[];
  agregarAlCarrito: (prod: Producto) => boolean;
  cambiarCantidadCarrito: (id: string, delta: number) => void;
  eliminarDelCarrito: (id: string) => void;
  vaciarCarrito: () => void;

  // Cupones
  cuponCodigo: string | null;
  cuponMonto: number;
  mensajeCupon: { texto: string; tipo: 'success' | 'danger' | 'info' } | null;
  aplicarCupon: (codigo: string) => Promise<boolean>;
  quitarCupon: () => void;

  // Comprobante & Cliente (Formularios Controlados)
  datosCliente: ClienteComprobante;
  setDatosCliente: React.Dispatch<React.SetStateAction<ClienteComprobante>>;
  consultarRucAuto: (ruc: string) => Promise<void>;
  consultarDniAuto: (dni: string) => Promise<void>;

  // Totales (Cálculos de negocio: ofertas, combos y cupones)
  totales: TotalesCalculados;

  // Transacción y Ventas
  procesarVenta: () => Promise<Venta | null>;
  ventas: Venta[];
  recargarVentas: () => Promise<void>;
  ultimaVenta: Venta | null;
  setUltimaVenta: (v: Venta | null) => void;

  // CRUD Inventario (consumiendo Servicios REST)
  crearProducto: (prod: Omit<Producto, 'id'>) => Promise<Producto>;
  actualizarProducto: (id: string, updates: Partial<Producto>) => Promise<Producto>;
  eliminarProducto: (id: string) => Promise<void>;

  // Gestión de Servicios (Fetch API, Axios, Alova)
  driverServicio: ServiceDriver;
  setDriverServicio: (driver: ServiceDriver) => void;
  metricasRecientes: RequestMetrics[];
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. STATE HOOKS: Productos y Filtros
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState<boolean>(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todas');
  const [busqueda, setBusqueda] = useState<string>('');

  // 2. STATE HOOK (useReducer): Carrito
  const { cart, dispatch } = useCartReducer();

  // 3. STATE HOOKS: Cupones
  const [cuponCodigo, setCuponCodigo] = useState<string | null>(null);
  const [cuponMonto, setCuponMonto] = useState<number>(0);
  const [mensajeCupon, setMensajeCupon] = useState<{ texto: string; tipo: 'success' | 'danger' | 'info' } | null>(null);

  // 4. STATE HOOKS: Formulario de Cliente / Facturación
  const [datosCliente, setDatosCliente] = useState<ClienteComprobante>({
    tipoComprobante: 'BOLETA',
    tipoDoc: 'SIN_DOC',
    numDoc: '',
    ruc: '',
    razonSocial: ''
  });

  // 5. STATE HOOKS: Historial de Ventas y Última Venta Emitida
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ultimaVenta, setUltimaVenta] = useState<Venta | null>(null);

  // 6. STATE HOOKS: Servicio activo y Métricas (Fetch / Axios / Alova)
  const [driverServicio, setDriverState] = useState<ServiceDriver>(ApiClient.getDriver());
  const [metricasRecientes, setMetricasRecientes] = useState<RequestMetrics[]>([]);

  // Escuchar métricas de red generadas por ApiClient
  useEffect(() => {
    const unsub = ApiClient.onMetric((metric) => {
      setMetricasRecientes((prev) => [metric, ...prev].slice(0, 15));
    });
    return unsub;
  }, []);

  const setDriverServicio = (driver: ServiceDriver) => {
    ApiClient.setDriver(driver);
    setDriverState(driver);
  };

  // Cargar productos consumiendo el servicio REST activo
  const recargarProductos = useCallback(async () => {
    setLoadingProductos(true);
    try {
      const data = await ApiClient.getProductos();
      setProductos(data);
    } catch (err) {
      console.error('Error al cargar productos vía servicio REST:', err);
    } finally {
      setLoadingProductos(false);
    }
  }, []);

  // Cargar historial de ventas consumiendo el servicio REST activo
  const recargarVentas = useCallback(async () => {
    try {
      const data = await ApiClient.getVentas();
      setVentas(data);
    } catch (err) {
      console.error('Error al cargar historial de ventas vía servicio REST:', err);
    }
  }, []);

  // Inicialización con useEffect (Lifecycle Hook)
  useEffect(() => {
    recargarProductos();
    recargarVentas();
  }, [recargarProductos, recargarVentas]);

  // Acciones sobre el carrito (usando useReducer dispatch)
  const agregarAlCarrito = (prod: Producto): boolean => {
    if (prod.stock <= 0) return false;
    const itemEnCarrito = cart.find((i) => i.id === prod.id);
    if (itemEnCarrito && itemEnCarrito.cantidad >= prod.stock) {
      return false;
    }
    dispatch({ type: 'ADD_ITEM', payload: prod });
    return true;
  };

  const cambiarCantidadCarrito = (id: string, delta: number) => {
    const prod = productos.find((p) => p.id === id);
    const maxStock = prod ? prod.stock : 999;
    dispatch({ type: 'CHANGE_QUANTITY', payload: { id, delta, maxStock } });
  };

  const eliminarDelCarrito = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const vaciarCarrito = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Cálculos de Totales (useMemo para alto rendimiento reactivo)
  const totales: TotalesCalculados = useMemo(() => {
    const totalProductos = cart.reduce((sum, item) => sum + item.precioRegular * item.cantidad, 0);
    const totalRealOfertas = cart.reduce((sum, item) => sum + item.precioOferta * item.cantidad, 0);

    let descuentoBase = totalProductos - totalRealOfertas;

    // Regla de Negocio Tambo: Promo Combo Bebida (- S/ 1.00 adicional si incluye Bebidas)
    const tieneBebida = cart.some((i) => i.categoria === 'Bebidas');
    if (tieneBebida && cart.length > 0) {
      descuentoBase += 1.00;
    }

    // Regla de Descuento por Cupón (no puede exceder el subtotal disponible)
    const subtotalAntesCupon = Math.max(0, totalProductos - descuentoBase);
    const descuentoCuponReal = Math.min(cuponMonto, subtotalAntesCupon);

    const descuentoTotal = descuentoBase + descuentoCuponReal;
    const subtotalFinal = Math.max(0, totalProductos - descuentoTotal);
    const igv = Math.round(subtotalFinal * IGV_RATE * 100) / 100;

    return {
      totalProductos,
      descuentoBase,
      descuentoCupon: descuentoCuponReal,
      descuentoTotal,
      subtotalFinal,
      igv
    };
  }, [cart, cuponMonto]);

  // Cupones con consumo de Servicio REST
  const aplicarCupon = async (codigo: string): Promise<boolean> => {
    if (cuponCodigo) {
      setMensajeCupon({ texto: 'Ya tienes un cupón aplicado. Quítalo para cambiarlo.', tipo: 'danger' });
      return false;
    }
    try {
      const resp = await ApiClient.validarCupon(codigo);
      if (resp.valido) {
        setCuponCodigo(codigo.trim().toUpperCase());
        setCuponMonto(resp.descuento);
        setMensajeCupon({ texto: resp.mensaje, tipo: 'success' });
        return true;
      } else {
        setMensajeCupon({ texto: resp.mensaje, tipo: 'danger' });
        return false;
      }
    } catch {
      setMensajeCupon({ texto: 'Error al conectar con el servicio de cupones.', tipo: 'danger' });
      return false;
    }
  };

  const quitarCupon = () => {
    setCuponCodigo(null);
    setCuponMonto(0);
    setMensajeCupon(null);
  };

  // Consultas externas simuladas (SUNAT / RENIEC vía Servicio REST)
  const consultarRucAuto = async (ruc: string) => {
    try {
      const res = await ApiClient.consultarRuc(ruc);
      setDatosCliente((prev) => ({ ...prev, razonSocial: res.razonSocial }));
    } catch (e: any) {
      console.warn('Consulta RUC:', e.message);
    }
  };

  const consultarDniAuto = async (dni: string) => {
    try {
      await ApiClient.consultarDni(dni);
    } catch (e: any) {
      console.warn('Consulta DNI:', e.message);
    }
  };

  // Procesar Transacción de Pago
  const procesarVenta = async (): Promise<Venta | null> => {
    if (cart.length === 0) {
      alert('El carrito está vacío. Agrega productos para procesar la venta.');
      return null;
    }

    // Validar comprobante
    if (datosCliente.tipoComprobante === 'FACTURA') {
      if (!/^\d{11}$/.test(datosCliente.ruc)) {
        alert('El RUC debe tener exactamente 11 dígitos numéricos.');
        return null;
      }
      if (!datosCliente.razonSocial.trim()) {
        alert('Ingrese la Razón Social para la Factura.');
        return null;
      }
    } else {
      // Boleta
      if (datosCliente.tipoDoc === 'DNI' && datosCliente.numDoc && !/^\d{8}$/.test(datosCliente.numDoc)) {
        alert('El DNI debe tener 8 dígitos.');
        return null;
      }
      if (datosCliente.tipoDoc === 'CE' && datosCliente.numDoc && !/^\d{9}$/.test(datosCliente.numDoc)) {
        alert('El Carné de Extranjería debe tener 9 dígitos.');
        return null;
      }
    }

    const payload = {
      comprobante: datosCliente.tipoComprobante,
      cliente: {
        tipoDoc: datosCliente.tipoDoc,
        numeroDoc: datosCliente.numDoc || undefined,
        ruc: datosCliente.tipoComprobante === 'FACTURA' ? datosCliente.ruc : undefined,
        razonSocial: datosCliente.tipoComprobante === 'FACTURA' ? datosCliente.razonSocial : undefined
      },
      itemsComprados: cart.map((item) => ({
        id: item.id,
        producto: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioOferta,
        subtotalItem: item.precioOferta * item.cantidad
      })),
      totalProductos: totales.totalProductos,
      descuentoTotal: totales.descuentoTotal,
      descuentoCupon: totales.descuentoCupon,
      cuponCodigo: cuponCodigo,
      subtotalFinal: totales.subtotalFinal,
      igv: totales.igv
    };

    try {
      // Consumir servicio REST para registrar venta
      const ventaRegistrada = await ApiClient.createVenta(payload);
      setUltimaVenta(ventaRegistrada);

      // Limpiar estado de transacción
      vaciarCarrito();
      quitarCupon();

      // Recargar catálogo y ventas
      await recargarProductos();
      await recargarVentas();

      return ventaRegistrada;
    } catch (err: any) {
      alert(`Error al registrar venta: ${err.message}`);
      return null;
    }
  };

  // CRUD Inventario
  const crearProducto = async (prod: Omit<Producto, 'id'>): Promise<Producto> => {
    const nuevo = await ApiClient.createProducto(prod);
    await recargarProductos();
    return nuevo;
  };

  const actualizarProducto = async (id: string, updates: Partial<Producto>): Promise<Producto> => {
    const mod = await ApiClient.updateProducto(id, updates);
    await recargarProductos();
    return mod;
  };

  const eliminarProducto = async (id: string): Promise<void> => {
    await ApiClient.deleteProducto(id);
    await recargarProductos();
  };

  return (
    <PosContext.Provider
      value={{
        productos,
        loadingProductos,
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        busqueda,
        setBusqueda,
        recargarProductos,
        cart,
        agregarAlCarrito,
        cambiarCantidadCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        cuponCodigo,
        cuponMonto,
        mensajeCupon,
        aplicarCupon,
        quitarCupon,
        datosCliente,
        setDatosCliente,
        consultarRucAuto,
        consultarDniAuto,
        totales,
        procesarVenta,
        ventas,
        recargarVentas,
        ultimaVenta,
        setUltimaVenta,
        crearProducto,
        actualizarProducto,
        eliminarProducto,
        driverServicio,
        setDriverServicio,
        metricasRecientes
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = (): PosContextType => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos debe ser utilizado dentro de un PosProvider');
  }
  return context;
};

