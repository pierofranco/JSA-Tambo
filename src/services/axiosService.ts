import axios, { AxiosInstance } from 'axios';
import { MockRestServer } from './mockRestServer';
import { Producto, Venta } from '../types/pos';

/**
 * SERVICIO REST CON AXIOS
 * Demuestra el uso de Axios en React:
 * - Instancia personalizada (AxiosInstance)
 * - Interceptores de solicitud (Request) y respuesta (Response)
 * - Manejo automático de serialización JSON y timeouts
 * - Medición de tiempos de respuesta / latencia
 */
export const axiosClient: AxiosInstance = axios.create({
  baseURL: 'https://api.tambopos.com/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Agent': 'TamboPOS-React-Axios'
  }
});

// Interceptor de Request para agregar tokens o logs
axiosClient.interceptors.request.use(
  (config) => {
    (config as any).metadata = { startTime: performance.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response para registrar telemetría
axiosClient.interceptors.response.use(
  (response) => {
    const start = (response.config as any).metadata?.startTime || 0;
    const duration = Math.round(performance.now() - start);
    console.debug(`[Axios ${response.config.method?.toUpperCase()} ${response.config.url}] completado en ${duration}ms`);
    return response;
  },
  (error) => {
    console.error('[Axios Error Interceptor]', error.message);
    return Promise.reject(error);
  }
);

export class AxiosRestService {
  static async getProductos(categoria?: string, search?: string): Promise<Producto[]> {
    // Al usar mock server respaldado:
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
