export type Categoria = string;

export interface CategoriaInfo {
  id: number;
  nombre: string;
  prefijo: string;
}

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

export interface NuevoProductoInput {
  nombre: string;
  categoriaId: number;
  precioRegular: number;
  precioOferta: number;
  stock: number;
  esPrime: boolean;
  imagenUrl?: string;
}

export type ActualizarProductoInput = Partial<Omit<NuevoProductoInput, 'categoriaId'>> & { categoriaId?: number };

export interface ItemCarrito {
  id: string;
  nombre: string;
  categoria: string;
  precioRegular: number;
  precioOferta: number;
  cantidad: number;
}

export type TipoComprobante = 'BOLETA' | 'FACTURA';
export type TipoDoc = 'SIN_DOC' | 'DNI' | 'CE';

export interface ClienteComprobante {
  tipoComprobante: TipoComprobante;
  tipoDoc: TipoDoc;
  numDoc: string;
  /** DNI exacto ya verificado contra RENIEC; se limpia si numDoc cambia. */
  dniVerificado?: string;
  nombreCliente?: string;
  ruc: string;
  razonSocial: string;
}

export interface ItemVentaDetalle {
  id: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotalItem: number;
}

export interface Venta {
  id: string;
  correlativo: string;
  fecha: string;
  hora: string;
  comprobante: TipoComprobante;
  cliente: {
    tipoDoc?: TipoDoc;
    numeroDoc?: string;
    ruc?: string;
    razonSocial?: string;
  };
  itemsComprados: ItemVentaDetalle[];
  totalProductos: number;
  descuentoTotal: number;
  descuentoCupon: number;
  cuponCodigo?: string | null;
  subtotalFinal: number;
  igv: number;
}

export type RolUsuario = 'INVITADO' | 'CAJERO' | 'ADMIN';

export interface TotalesCalculados {
  totalProductos: number;
  descuentoBase: number;
  descuentoCupon: number;
  descuentoTotal: number;
  subtotalFinal: number;
  igv: number;
}

export interface Usuario {
  id: number;
  username: string;
  rol: 'ADMIN' | 'CAJERO';
  nombreCompleto: string;
  activo: boolean;
  createdAt: string;
}

export interface ProveedorProducto {
  proveedorId: number;
  productoId: string;
  precioReferencial: number | null;
  nombre: string;
  codigo: string;
}

export interface Proveedor {
  id: number;
  ruc: string;
  razonSocial: string;
  telefono: string | null;
  email: string | null;
  productos: ProveedorProducto[];
}

export interface CompraResumen {
  id: number;
  numeroDocumento: string | null;
  total: number;
  createdAt: string;
  proveedorRazonSocial: string;
  registradoPor: string;
}

