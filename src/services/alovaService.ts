import { createAlova, invalidateCache, Method } from 'alova';
import adapterFetch from 'alova/fetch';
import { Producto, Venta, NuevoProductoInput, ActualizarProductoInput } from '../types/pos';

/**
 * SERVICIO REST CON ALOVA.JS (librería real, no simulada)
 * Demuestra el uso de Alova en React:
 * - Instancia creada con `createAlova` + adaptador oficial `alova/fetch`
 * - Method Instances (`alovaInstance.Get/Post/Put/Delete`) contra /api/*
 * - Caché reactivo en memoria con TTL (`cacheFor`) administrado por la propia librería
 * - Invalidación automática de caché (`invalidateCache`) tras mutaciones (ventas, CRUD)
 */
const alovaInstance = createAlova({
  baseURL: '/api',
  timeout: 5000,
  requestAdapter: adapterFetch(),
  cacheFor: {
    GET: 30000 // 30 segundos de caché reactivo en memoria, igual que el diseño original
  },
  responded: {
    onSuccess: async (response: Response) => {
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Alova error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    onError: (error) => {
      console.error('[Alova Error]', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
});

export type AlovaMethod<T> = Method<any> & { send: (forceRequest?: boolean) => Promise<T> };

export class AlovaRestService {
  /**
   * Method Instance de productos: cacheada 30s por Alova de fábrica.
   */
  static getProductosMethod(categoria?: string, search?: string): AlovaMethod<Producto[]> {
    return alovaInstance.Get<Producto[]>('/productos', {
      params: { categoria, search },
      name: `productos-${categoria || 'Todas'}-${search || ''}`
    }) as AlovaMethod<Producto[]>;
  }

  /**
   * Method Instance de venta: al completarse invalida la caché de productos (nuevo stock).
   */
  static createVentaMethod(venta: Omit<Venta, 'id' | 'correlativo' | 'fecha' | 'hora'>): AlovaMethod<Venta> {
    return alovaInstance.Post<Venta>('/ventas', venta) as AlovaMethod<Venta>;
  }

  static async getProductos(categoria?: string, search?: string): Promise<Producto[]> {
    return this.getProductosMethod(categoria, search).send();
  }

  static async getProductoById(id: string): Promise<Producto> {
    return alovaInstance.Get<Producto>(`/productos/${encodeURIComponent(id)}`).send();
  }

  static async createProducto(prod: NuevoProductoInput): Promise<Producto> {
    const nuevo = await alovaInstance.Post<Producto>('/productos', prod).send();
    await invalidateCache();
    return nuevo;
  }

  static async updateProducto(id: string, updates: ActualizarProductoInput): Promise<Producto> {
    const actualizado = await alovaInstance.Put<Producto>(`/productos/${encodeURIComponent(id)}`, updates).send();
    await invalidateCache();
    return actualizado;
  }

  static async deleteProducto(id: string): Promise<{ success: boolean; id: string }> {
    const resultado = await alovaInstance
      .Delete<{ success: boolean; id: string }>(`/productos/${encodeURIComponent(id)}`)
      .send();
    await invalidateCache();
    return resultado;
  }

  static async getVentas(): Promise<Venta[]> {
    return alovaInstance.Get<Venta[]>('/ventas').send();
  }

  static async createVenta(venta: Omit<Venta, 'id' | 'correlativo' | 'fecha' | 'hora'>): Promise<Venta> {
    const resultado = await this.createVentaMethod(venta).send();
    // Invalida la caché de productos: la venta descontó stock en el servidor
    await invalidateCache();
    return resultado;
  }

  static async validarCupon(codigo: string) {
    return alovaInstance
      .Get<{ valido: boolean; descuento: number; mensaje: string }>(`/cupones/${encodeURIComponent(codigo)}`)
      .send();
  }

  static async consultarRuc(ruc: string) {
    return alovaInstance
      .Get<{ ruc: string; razonSocial: string; estado: string }>(`/consulta-ruc/${encodeURIComponent(ruc)}`)
      .send();
  }

  static async consultarDni(dni: string) {
    return alovaInstance
      .Get<{ dni: string; nombreCompleto: string }>(`/consulta-dni/${encodeURIComponent(dni)}`)
      .send();
  }
}
