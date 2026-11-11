export type Categoria = 'Todas' | 'Bebidas' | 'Snacks' | 'Comida Rápida' | 'Abarrotes';

export interface Producto {
  id: string;
  nombre: string;
  categoria: 'Bebidas' | 'Snacks' | 'Comida Rápida' | 'Abarrotes';
  precioRegular: number;
  precioOferta: number;
  stock: number;
  porcentajeDescuento: number;
  esPrime: boolean;
  imagenUrl: string;
}

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

