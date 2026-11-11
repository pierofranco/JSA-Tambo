import { MockRestServer } from './mockRestServer';
import { Producto, Venta } from '../types/pos';

/**
 * SERVICIO REST CON ALOVA.JS
 * Demuestra el uso de Alova en React:
 * - Solicitudes basadas en Method Instances
 * - Caché automático y deduplicación de peticiones en memoria
 * - Arquitectura reactiva y ligera
 * - Adaptadores para requests de alta eficiencia
 */

export interface AlovaMethod<T> {
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  send: () => Promise<T>;
}

// Emulación del patrón de diseño de Alova Method
function createAlovaMethod<T>(type: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, executor: () => Promise<T>): AlovaMethod<T> {
  return {
    type,
    url,
    send: executor
  };
}

// Caché en memoria propio del ciclo de vida de Alova
const memoryCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 30000; // 30 segundos

async function cachedExecutor<T>(cacheKey: string, fetcher: () => Promise<T>, useCache = true): Promise<T> {
  const now = Date.now();
  if (useCache && memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    if (now < cached.expiry) {
      console.debug(`[Alova Cache Hit] ${cacheKey}`);
      return cached.data;
    }
  }

  const fresh = await fetcher();
  if (useCache) {
    memoryCache.set(cacheKey, { data: fresh, expiry: now + CACHE_TTL_MS });
  }
  return fresh;
}

export class AlovaRestService {
  /**
   * Obtiene la lista de productos con soporte de caching reactivo de Alova
   */
  static getProductosMethod(categoria?: string, search?: string): AlovaMethod<Producto[]> {
    const cacheKey = `alova_products_${categoria || 'Todas'}_${search || ''}`;
    return createAlovaMethod('GET', `/api/productos?cat=${categoria || ''}`, () =>
      cachedExecutor(cacheKey, () => MockRestServer.getProductos(categoria, search))
    );
  }

  /**
   * Envía una venta y automáticamente invalida la caché de inventario
   */
  static createVentaMethod(venta: Omit<Venta, 'id' | 'correlativo' | 'fecha' | 'hora'>): AlovaMethod<Venta> {
    return createAlovaMethod('POST', '/api/ventas', async () => {
      const res = await MockRestServer.createVenta(venta);
      // Invalidar caché de productos
      memoryCache.clear();
      return res;
    });
  }

  static async getProductos(categoria?: string, search?: string): Promise<Producto[]> {
    return this.getProductosMethod(categoria, search).send();
  }

  static async getProductoById(id: string): Promise<Producto> {
    return MockRestServer.getProductoById(id);
  }

  static async createProducto(prod: Omit<Producto, 'id'>): Promise<Producto> {
    memoryCache.clear();
    return MockRestServer.createProducto(prod);
  }

  static async updateProducto(id: string, updates: Partial<Producto>): Promise<Producto> {
    memoryCache.clear();
    return MockRestServer.updateProducto(id, updates);
  }

  static async deleteProducto(id: string): Promise<{ success: boolean; id: string }> {
    memoryCache.clear();
    return MockRestServer.deleteProducto(id);
  }

  static async getVentas(): Promise<Venta[]> {
    return MockRestServer.getVentas();
  }

  static async createVenta(venta: Omit<Venta, 'id' | 'correlativo' | 'fecha' | 'hora'>): Promise<Venta> {
    return this.createVentaMethod(venta).send();
  }

  static async validarCupon(codigo: string) {
    return MockRestServer.validarCupon(codigo);
  }

  static async consultarRuc(ruc: string) {
    return MockRestServer.consultarRucSunat(ruc);
  }

  static async consultarDni(dni: string) {
    return MockRestServer.consultarDniReniec(dni);
  }
}

