import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  Producto,
  ItemCarrito,
  Venta,
  ClienteComprobante,
  TotalesCalculados,
  CategoriaInfo,
  NuevoProductoInput,
  ActualizarProductoInput
} from '../types/pos';
import { useCartReducer } from '../hooks/useCartReducer';
import { ApiClient, ServiceDriver, RequestMetrics } from '../services/apiClient';
import { calcularImpuestoDesdeTotal } from '../../shared/tax';
import { rucChecksumValido } from '../../shared/validators';

interface PosContextType {
  // Productos & Filtros
  productos: Producto[];
  loadingProductos: boolean;
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (cat: string) => void;
  busqueda: string;
  setBusqueda: (q: string) => void;
  recargarProductos: () => Promise<void>;

  // Categorías (dinámicas, el administrador puede crear nuevas)
  categorias: CategoriaInfo[];
  recargarCategorias: () => Promise<void>;
  crearCategoria: (nombre: string, prefijo: string) => Promise<CategoriaInfo>;

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
  crearProducto: (prod: NuevoProductoInput) => Promise<Producto>;
  actualizarProducto: (id: string, updates: ActualizarProductoInput) => Promise<Producto>;
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
  const [categorias, setCategorias] = useState<CategoriaInfo[]>([]);

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

  // Categorías dinámicas (el admin puede crear más desde Gestión de Inventario)
  const recargarCategorias = useCallback(async () => {
    try {
      const res = await fetch('/api/categorias');
      if (res.ok) setCategorias(await res.json());
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  }, []);

  const crearCategoria = async (nombre: string, prefijo: string): Promise<CategoriaInfo> => {
    const res = await fetch('/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, prefijo })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'No se pudo crear la categoría.');
    await recargarCategorias();
    return data;
  };

  // Inicialización con useEffect (Lifecycle Hook)
  useEffect(() => {
    recargarProductos();
    recargarVentas();
    recargarCategorias();
  }, [recargarProductos, recargarVentas, recargarCategorias]);

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
    // El IGV va INCLUIDO en subtotalFinal (precio final al cliente), no se
    // suma aparte: se extrae con la fórmula 18/118, nunca total * 18%.
    const { igv } = calcularImpuestoDesdeTotal(subtotalFinal);

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
    const codigoLimpio = codigo.trim().toUpperCase().slice(0, 30);
    if (!codigoLimpio) {
      setMensajeCupon({ texto: 'Ingresa un código de cupón.', tipo: 'danger' });
      return false;
    }
    try {
      const resp = await ApiClient.validarCupon(codigoLimpio);
      if (resp.valido) {
        setCuponCodigo(codigoLimpio);
        setCuponMonto(resp.descuento);
        setMensajeCupon({ texto: resp.mensaje, tipo: 'success' });
        return true;
      } else {
        setMensajeCupon({ texto: resp.mensaje, tipo: 'danger' });
        return false;
      }
    } catch (e: any) {
      // Distingue un código mal formado (400, mensaje propio del backend) de
      // un error real de red/servidor — no todo catch es "no hay conexión".
      const texto =
        e?.message === 'Código de cupón inválido.' ? e.message : 'Error al conectar con el servicio de cupones.';
      setMensajeCupon({ texto, tipo: 'danger' });
      return false;
    }
  };

  const quitarCupon = () => {
    setCuponCodigo(null);
    setCuponMonto(0);
    setMensajeCupon(null);
  };

  // Consultas externas (SUNAT / RENIEC vía Servicio REST). No atrapan el
  // error: el llamador (CartSection) lo muestra en la UI, igual que con DNI.
  const consultarRucAuto = async (ruc: string) => {
    const res = await ApiClient.consultarRuc(ruc);
    setDatosCliente((prev) => (prev.ruc === ruc ? { ...prev, razonSocial: res.razonSocial } : prev));
  };

  const consultarDniAuto = async (dni: string) => {
    const res = await ApiClient.consultarDni(dni);
    setDatosCliente((prev) =>
      prev.numDoc === dni ? { ...prev, nombreCliente: res.nombreCompleto, dniVerificado: dni } : prev
    );
  };

  // Procesar Transacción de Pago. No usa alert(): la validación de campos la
  // hace CartSection ANTES de llamar aquí (mensajes inline, campo en rojo).
  // Estas comprobaciones quedan como respaldo silencioso por si algo más
  // llama a procesarVenta en un estado inválido.
  const procesarVenta = async (): Promise<Venta | null> => {
    if (cart.length === 0) {
      console.warn('procesarVenta: carrito vacío.');
      return null;
    }

    // Validar comprobante
    if (datosCliente.tipoComprobante === 'FACTURA') {
      if (!/^\d{11}$/.test(datosCliente.ruc) || !rucChecksumValido(datosCliente.ruc)) {
        console.warn('procesarVenta: RUC inválido.');
        return null;
      }
      if (!datosCliente.razonSocial.trim()) {
        console.warn('procesarVenta: falta Razón Social.');
        return null;
      }
    } else {
      // Boleta
      if (datosCliente.tipoDoc === 'DNI') {
        if (!datosCliente.numDoc || !/^\d{8}$/.test(datosCliente.numDoc)) {
          console.warn('procesarVenta: DNI inválido.');
          return null;
        }
        if (datosCliente.dniVerificado !== datosCliente.numDoc) {
          console.warn('procesarVenta: DNI no verificado con RENIEC.');
          return null;
        }
      }
      if (datosCliente.tipoDoc === 'CE' && (!datosCliente.numDoc || !/^\d{9}$/.test(datosCliente.numDoc))) {
        console.warn('procesarVenta: Carné de Extranjería inválido.');
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
      // No usa alert(): se relanza para que CartSection lo muestre inline.
      throw new Error(err?.message || 'No se pudo registrar la venta.');
    }
  };

  // CRUD Inventario
  const crearProducto = async (prod: NuevoProductoInput): Promise<Producto> => {
    const nuevo = await ApiClient.createProducto(prod);
    await recargarProductos();
    return nuevo;
  };

  const actualizarProducto = async (id: string, updates: ActualizarProductoInput): Promise<Producto> => {
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
        categorias,
        recargarCategorias,
        crearCategoria,
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

