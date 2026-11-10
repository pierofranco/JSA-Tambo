export type CategoriaProducto = 'Bebidas' | 'Snacks' | 'Comida Rápida' | 'Abarrotes' | 'TODAS';

export type TipoDocumento = 'DNI' | 'RUC' | 'CE' | 'PASAPORTE';

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precioRegular: number;
  precioOferta: number;
  stock: number;
  porcentajeDescuento: number;
  esPrime: boolean;
  imagenUrl: string;
}

export interface CartItem {
  id: string;
  nombre: string;
  categoria: string;
  precioRegular: number;
  precioOferta: number;
  cantidad: number;
  imagenUrl?: string;
}

export interface Cliente {
  tipoDoc: TipoDocumento;
  numDoc: string;
  nombreCompleto: string;
  direccion?: string;
  esSocioPrime?: boolean;
}

export interface TotalesCarrito {
  totalProductos: number;
  descuentoTotal: number;
  subtotalFinal: number;
  igvCalculado: number;
  promoBebidaAplicada: boolean;
  promoMontoMayorAplicada: boolean;
}

export type MetodoPago = 'Yape' | 'Plin' | 'Efectivo' | 'Tarjeta';

export interface TicketVenta {
  idVenta: string;
  fecha: string;
  cliente: Cliente;
  items: CartItem[];
  totales: TotalesCarrito;
  cajero: string;
  sucursal: string;
  metodoPago: MetodoPago;
  pagoCon?: number;
  vuelto?: number;
}

export type RestClientType = 'Fetch API' | 'Axios' | 'Alova';

export interface RestExecutionResult<T = any> {
  cliente: RestClientType;
  endpoint: string;
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: number;
  statusText: string;
  tiempoMs: number;
  timestamp: string;
  data: T;
  headers?: Record<string, string>;
  error?: string;
}

