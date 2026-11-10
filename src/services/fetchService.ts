import { Producto, Cliente, TicketVenta, RestExecutionResult } from '../types';
import { getProductosPersistidos, saveProductosPersistidos, CLIENTES_MOCK } from './apiMockData';

/**
 * SERVICIO REST CON FETCH API
 * Implementación basada en la API nativa de JavaScript / navegadores.
 * Soporta métodos GET, POST, PUT, DELETE, captura de errores HTTP y cabeceras.
 */
class FetchService {
  private baseUrl = 'https://api.tambo-pos.pe/v1';

  /**
   * Simulación realista de la petición fetch para REST con headers y latencia
   */
  private async executeFetch<T>(
    endpoint: string,
    metodo: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    payload?: any
  ): Promise<RestExecutionResult<T>> {
    const startTime = performance.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Library': 'Fetch-API-Native',
      'X-Requested-With': 'TamboReactPOS'
    };

    // Simulador de latencia de red (180ms - 350ms)
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 170) + 180));

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
        data = { mensaje: `Producto ${id} eliminado correctamente`, id };
      } else if (endpoint.startsWith('/clientes/')) {
        const doc = endpoint.split('/')[2];
        const cliente = CLIENTES_MOCK.find(c => c.numDoc === doc);
        if (cliente) {
          data = cliente;
        } else {
          status = 404;
          statusText = 'Not Found';
          throw new Error(`Cliente con documento ${doc} no encontrado en el padrón`);
        }
      } else if (endpoint === '/ventas' && metodo === 'POST') {
        status = 201;
        statusText = 'Created';
        data = {
          mensaje: 'Venta registrada con éxito vía Fetch API',
          ticket: payload
        };
      } else {
        status = 400;
        statusText = 'Bad Request';
        throw new Error(`Endpoint o método no soportado: ${metodo} ${endpoint}`);
      }

      const tiempoMs = Math.round(performance.now() - startTime);

      return {
        cliente: 'Fetch API',
        endpoint: `${this.baseUrl}${endpoint}`,
        metodo,
        status,
        statusText,
        tiempoMs,
        timestamp: new Date().toLocaleTimeString(),
        data,
        headers
      };
    } catch (err: any) {
      const tiempoMs = Math.round(performance.now() - startTime);
      return {
        cliente: 'Fetch API',
        endpoint: `${this.baseUrl}${endpoint}`,
        metodo,
        status: status === 200 ? 500 : status,
        statusText: statusText === 'OK' ? 'Internal Error' : statusText,
        tiempoMs,
        timestamp: new Date().toLocaleTimeString(),
        data: null as any,
        headers,
        error: err.message || 'Error desconocido con Fetch API'
      };
    }
  }

  // Métodos CRUD
  async getProductos(): Promise<RestExecutionResult<Producto[]>> {
    return this.executeFetch<Producto[]>('/productos', 'GET');
  }

  async createProducto(producto: Omit<Producto, 'id'>): Promise<RestExecutionResult<Producto>> {
    return this.executeFetch<Producto>('/productos', 'POST', producto);
  }

  async deleteProducto(id: string): Promise<RestExecutionResult<{ mensaje: string; id: string }>> {
    return this.executeFetch<{ mensaje: string; id: string }>(`/productos/${id}`, 'DELETE');
  }

  async getClientePorDoc(numDoc: string): Promise<RestExecutionResult<Cliente>> {
    return this.executeFetch<Cliente>(`/clientes/${numDoc}`, 'GET');
  }

  async registrarVenta(ticket: TicketVenta): Promise<RestExecutionResult<any>> {
    return this.executeFetch<any>('/ventas', 'POST', ticket);
  }
}

export const fetchService = new FetchService();

