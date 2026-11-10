import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import { Producto, Cliente, TicketVenta, RestExecutionResult } from '../types';
import { getProductosPersistidos, saveProductosPersistidos, CLIENTES_MOCK } from './apiMockData';

/**
 * SERVICIO REST CON ALOVA
 * Alova es una biblioteca de última generación orientada a estados de petición,
 * con gestión automática de caché, sincronización de memoria y adaptadores modulares.
 */
export const alovaInstance = createAlova({
  baseURL: 'https://api.tambo-pos.pe/v1',
  requestAdapter: adapterFetch(),
  cacheLogger: false,
  beforeRequest(method) {
    method.config.headers['X-Engine'] = 'Alova-NextGen-Client';
    method.config.headers['X-Alova-Cache'] = 'In-Memory-L1';
  },
  responded: {
    onSuccess: async (response) => {
      // Interceptor de respuesta de Alova
      return response;
    },
    onError: (err) => {
      console.warn('[Alova Error]:', err);
      throw err;
    }
  }
});

// Definición declarativa de métodos Alova
export const alovaMethods = {
  getProductos: () => alovaInstance.Get<Producto[]>('/productos', {
    cacheFor: 60 * 1000 // 1 minuto de caché automática Alova
  }),
  createProducto: (data: Omit<Producto, 'id'>) => alovaInstance.Post<Producto>('/productos', data),
  deleteProducto: (id: string) => alovaInstance.Delete<{ mensaje: string; id: string }>(`/productos/${id}`),
  getCliente: (doc: string) => alovaInstance.Get<Cliente>(`/clientes/${doc}`),
  registrarVenta: (ticket: TicketVenta) => alovaInstance.Post<any>('/ventas', ticket)
};

class AlovaService {
  private baseUrl = 'https://api.tambo-pos.pe/v1';

  /**
   * Ejecutor con telemetría para comparativa en tiempo real
   */
  private async executeAlova<T>(
    endpoint: string,
    metodo: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    payload?: any
  ): Promise<RestExecutionResult<T>> {
    const startTime = performance.now();
    // Alova aprovecha optimización interna y caché rápida (100ms - 220ms)
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 120) + 100));

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
        data = { mensaje: `Producto ${id} eliminado con éxito vía Alova Cache Invalidation`, id };
      } else if (endpoint.startsWith('/clientes/')) {
        const doc = endpoint.split('/')[2];
        const cliente = CLIENTES_MOCK.find(c => c.numDoc === doc);
        if (cliente) {
          data = cliente;
        } else {
          status = 404;
          statusText = 'Not Found';
          throw new Error(`[Alova 404] Cliente con identificación ${doc} no registrado`);
        }
      } else if (endpoint === '/ventas' && metodo === 'POST') {
        status = 201;
        statusText = 'Created';
        data = {
          mensaje: 'Venta registrada con éxito mediante Alova Reactive Request',
          ticket: payload
        };
      } else {
        status = 400;
        statusText = 'Bad Request';
        throw new Error(`Endpoint Alova no configurado: ${metodo} ${endpoint}`);
      }

      const tiempoMs = Math.round(performance.now() - startTime);

      return {
        cliente: 'Alova',
        endpoint: `${this.baseUrl}${endpoint}`,
        metodo,
        status,
        statusText,
        tiempoMs,
        timestamp: new Date().toLocaleTimeString(),
        data,
        headers: {
          'X-Engine': 'Alova-NextGen-Client',
          'X-Alova-Cache': 'Hit (L1 In-Memory / IndexedDB)',
          'Content-Type': 'application/json'
        }
      };
    } catch (err: any) {
      const tiempoMs = Math.round(performance.now() - startTime);
      return {
        cliente: 'Alova',
        endpoint: `${this.baseUrl}${endpoint}`,
        metodo,
        status: status === 200 ? 500 : status,
        statusText: statusText === 'OK' ? 'Alova Request Error' : statusText,
        tiempoMs,
        timestamp: new Date().toLocaleTimeString(),
        data: null as any,
        headers: { 'X-Engine': 'Alova-NextGen-Client' },
        error: err.message || 'Error en cliente Alova'
      };
    }
  }

  async getProductos(): Promise<RestExecutionResult<Producto[]>> {
    return this.executeAlova<Producto[]>('/productos', 'GET');
  }

  async createProducto(producto: Omit<Producto, 'id'>): Promise<RestExecutionResult<Producto>> {
    return this.executeAlova<Producto>('/productos', 'POST', producto);
  }

  async deleteProducto(id: string): Promise<RestExecutionResult<{ mensaje: string; id: string }>> {
    return this.executeAlova<{ mensaje: string; id: string }>(`/productos/${id}`, 'DELETE');
  }

  async getClientePorDoc(numDoc: string): Promise<RestExecutionResult<Cliente>> {
    return this.executeAlova<Cliente>(`/clientes/${numDoc}`, 'GET');
  }

  async registrarVenta(ticket: TicketVenta): Promise<RestExecutionResult<any>> {
    return this.executeAlova<any>('/ventas', 'POST', ticket);
  }
}

export const alovaService = new AlovaService();

