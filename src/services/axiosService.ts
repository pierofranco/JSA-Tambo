import axios, { AxiosError, AxiosInstance } from 'axios';
import { Producto, Venta, NuevoProductoInput, ActualizarProductoInput } from '../types/pos';

/**
 * SERVICIO REST CON AXIOS
 * Demuestra el uso de Axios en React:
 * - Instancia personalizada (AxiosInstance) contra el backend mock de TAMBOPOS (/api)
 * - Interceptores de solicitud (Request) y respuesta (Response) reales
 * - Serialización JSON y manejo de errores HTTP automáticos
 * - Medición de tiempos de respuesta / latencia
 */
export const axiosClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Agent': 'TamboPOS-React-Axios'
  }
});

// Interceptor de Request: marca el instante de inicio para medir latencia
axiosClient.interceptors.request.use(
  (config) => {
    (config as any).metadata = { startTime: performance.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: telemetría y normalización de errores
axiosClient.interceptors.response.use(
  (response) => {
    const start = (response.config as any).metadata?.startTime || 0;
    const duration = Math.round(performance.now() - start);
    console.debug(`[Axios ${response.config.method?.toUpperCase()} ${response.config.url}] completado en ${duration}ms`);
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    console.error('[Axios Error Interceptor]', error.message);
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export class AxiosRestService {
  static async getProductos(categoria?: string, search?: string): Promise<Producto[]> {
    const { data } = await axiosClient.get<Producto[]>('/productos', { params: { categoria, search } });
    return data;
  }

  static async getProductoById(id: string): Promise<Producto> {
    const { data } = await axiosClient.get<Producto>(`/productos/${encodeURIComponent(id)}`);
    return data;
  }

  static async createProducto(prod: NuevoProductoInput): Promise<Producto> {
    const { data } = await axiosClient.post<Producto>('/productos', prod);
    return data;
  }

  static async updateProducto(id: string, updates: ActualizarProductoInput): Promise<Producto> {
    const { data } = await axiosClient.put<Producto>(`/productos/${encodeURIComponent(id)}`, updates);
    return data;
  }

  static async deleteProducto(id: string): Promise<{ success: boolean; id: string }> {
    const { data } = await axiosClient.delete<{ success: boolean; id: string }>(
      `/productos/${encodeURIComponent(id)}`
    );
    return data;
  }

  static async getVentas(): Promise<Venta[]> {
    const { data } = await axiosClient.get<Venta[]>('/ventas');
    return data;
  }

  static async createVenta(venta: Omit<Venta, 'id' | 'correlativo' | 'fecha' | 'hora'>): Promise<Venta> {
    const { data } = await axiosClient.post<Venta>('/ventas', venta);
    return data;
  }

  static async validarCupon(codigo: string) {
    const { data } = await axiosClient.get<{ valido: boolean; descuento: number; mensaje: string }>(
      `/cupones/${encodeURIComponent(codigo)}`
    );
    return data;
  }

  static async consultarRuc(ruc: string) {
    const { data } = await axiosClient.get<{ ruc: string; razonSocial: string; estado: string }>(
      `/consulta-ruc/${encodeURIComponent(ruc)}`
    );
    return data;
  }

  static async consultarDni(dni: string) {
    const { data } = await axiosClient.get<{ dni: string; nombreCompleto: string }>(
      `/consulta-dni/${encodeURIComponent(dni)}`
    );
    return data;
  }
}
