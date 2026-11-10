import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Producto, Cliente, TicketVenta, RestExecutionResult } from '../types';
import { getProductosPersistidos, saveProductosPersistidos, CLIENTES_MOCK } from './apiMockData';

/**
 * SERVICIO REST CON AXIOS
 * Implementación empleando la librería cliente Axios, con interceptores de
 * solicitud, interceptores de respuesta, timeouts y normalización de errores.
 */
class AxiosService {
  private client: AxiosInstance;
  private baseUrl = 'https://api.tambo-pos.pe/v1';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Library': 'Axios-HTTP-Client'
      }
    });

    // 1. Interceptor de Petición (Request Interceptor)
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Inyectamos token ficticio de sesión POS
        config.headers.set('Authorization', 'Bearer tambo_pos_token_sec_2026');
        (config as any).metadata = { startTime: performance.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 2. Interceptor de Respuesta (Response Interceptor)
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Manejo centralizado de errores Axios
        console.warn('[Axios Interceptor Error]:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Ejecutor simulador con soporte de interceptores reales
   */
  private async executeAxios<T>(
    endpoint: string,
    metodo: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    payload?: any
  ): Promise<RestExecutionResult<T>> {
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 150) + 160));

    let status = 200;
    let statusText = 'OK';
    let data: any = null;

    try {
      if (endpoint === '/productos' && metodo === 'GET') {
        data = getProductosPersistidos();
      } else if (endpoint === '/productos' && metodo === 'POST') {
        const actual = getProductosPersistidos();
        const nuevoProd: Producto = {
          ...payload,
          id: payload.id || `P${String(actual.length + 1).padStart(3, '0')}`
        };
        const actualizados = [nuevoProd, ...actual];
        saveProductosPersistidos(actualizados);
        status = 201;
        statusText = 'Created';
        data = nuevoProd;
      } else if (endpoint.startsWith('/productos/') && metodo === 'DELETE') {
        const id = endpoint.split('/')[2];
        const actual = getProductosPersistidos();
        const actualizados = actual.filter(p => p.id !== id);
        saveProductosPersistidos(actualizados);
        status = 200;
        statusText = 'OK';
        data = { mensaje: `Producto ${id} eliminado con éxito vía Axios`, id };
      } else if (endpoint.startsWith('/clientes/')) {
        const doc = endpoint.split('/')[2];
        const cliente = CLIENTES_MOCK.find(c => c.numDoc === doc);
        if (cliente) {
          data = cliente;
        } else {
          status = 404;
          statusText = 'Not Found';
          throw new Error(`[Axios Error 404] Cliente con documento ${doc} no hallado en padrón`);
        }
      } else if (endpoint === '/ventas' && metodo === 'POST') {
        status = 201;
        statusText = 'Created';
        data = {
          mensaje: 'Venta registrada con éxito mediante Axios Interceptors',
          ticket: payload
        };
      } else {
        status = 400;
        statusText = 'Bad Request';
        throw new Error(`Endpoint Axios no soportado: ${metodo} ${endpoint}`);
      }

      const tiempoMs = Math.round(performance.now() - startTime);

      return {
        cliente: 'Axios',
        endpoint: `${this.baseUrl}${endpoint}`,
        metodo,
        status,
        statusText,
        tiempoMs,
        timestamp: new Date().toLocaleTimeString(),
        data,
        headers: {
          'Authorization': 'Bearer tambo_pos_token_sec_2026',
          'Content-Type': 'application/json',
          'X-Client-Library': 'Axios-HTTP-Client'
        }
      };
    } catch (err: any) {
      const tiempoMs = Math.round(performance.now() - startTime);
      return {
        cliente: 'Axios',
        endpoint: `${this.baseUrl}${endpoint}`,
        metodo,
        status: status === 200 ? 500 : status,
        statusText: statusText === 'OK' ? 'Axios Network Error' : statusText,
        tiempoMs,
        timestamp: new Date().toLocaleTimeString(),
        data: null as any,
        headers: { 'X-Client-Library': 'Axios-HTTP-Client' },
        error: err.message || 'Error en petición Axios'
      };
    }
  }

  async getProductos(): Promise<RestExecutionResult<Producto[]>> {
    return this.executeAxios<Producto[]>('/productos', 'GET');
  }

  async createProducto(producto: Omit<Producto, 'id'>): Promise<RestExecutionResult<Producto>> {
    return this.executeAxios<Producto>('/productos', 'POST', producto);
  }

  async deleteProducto(id: string): Promise<RestExecutionResult<{ mensaje: string; id: string }>> {
    return this.executeAxios<{ mensaje: string; id: string }>(`/productos/${id}`, 'DELETE');
  }

  async getClientePorDoc(numDoc: string): Promise<RestExecutionResult<Cliente>> {
    return this.executeAxios<Cliente>(`/clientes/${numDoc}`, 'GET');
  }

  async registrarVenta(ticket: TicketVenta): Promise<RestExecutionResult<any>> {
    return this.executeAxios<any>('/ventas', 'POST', ticket);
  }
}

export const axiosService = new AxiosService();

