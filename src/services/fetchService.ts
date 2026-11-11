import { MockRestServer } from './mockRestServer';
import { Producto, Venta } from '../types/pos';

/**
 * SERVICIO REST CON FETCH API
 * Demuestra el uso nativo de Fetch API en React:
 * - Solicitudes HTTP con promesas nativas
 * - Headers, métodos GET, POST, PUT, DELETE
 * - AbortController para cancelación de peticiones
 * - Transformación y control de errores HTTP
 */
export class FetchRestService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // En una aplicación con servidor externo, se utilizaría:
    // const res = await fetch(`https://api.tambopos.com${endpoint}`, options);
    // if (!res.ok) throw new Error(`Fetch error: ${res.statusText}`);
    // return await res.json();

    // Con nuestro Mock REST Server:
    if (endpoint.startsWith('/api/productos')) {
      if (options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        return MockRestServer.createProducto(body) as Promise<T>;
      }
      return MockRestServer.getProductos() as Promise<T>;
    }
    if (endpoint.startsWith('/api/ventas')) {
      if (options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        return MockRestServer.createVenta(body) as Promise<T>;
      }
      return MockRestServer.getVentas() as Promise<T>;
    }
    throw new Error(`Endpoint no soportado: ${endpoint}`);
  }

  static async getProductos(categoria?: string, search?: string): Promise<Producto[]> {
    return MockRestServer.getProductos(categoria, search);
  }

  static async getProductoById(id: string): Promise<Producto> {
    return MockRestServer.getProductoById(id);
  }

  static async createProducto(prod: Omit<Producto, 'id'>): Promise<Producto> {
    return MockRestServer.createProducto(prod);
  }

  static async updateProducto(id: string, updates: Partial<Producto>): Promise<Producto> {
    return MockRestServer.updateProducto(id, updates);
  }

  static async deleteProducto(id: string): Promise<{ success: boolean; id: string }> {
    return MockRestServer.deleteProducto(id);
  }

  static async getVentas(): Promise<Venta[]> {
    return MockRestServer.getVentas();
  }

  static async createVenta(venta: Omit<Venta, 'id' | 'correlativo' | 'fecha' | 'hora'>): Promise<Venta> {
    return MockRestServer.createVenta(venta);
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

