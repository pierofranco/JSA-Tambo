import { Producto, Venta, NuevoProductoInput, ActualizarProductoInput } from '../types/pos';

const BASE_URL = '/api';

/**
 * SERVICIO REST CON FETCH API
 * Demuestra el uso nativo de Fetch API en React:
 * - Peticiones HTTP reales contra el backend mock de TAMBOPOS (/api/*)
 * - Promesas nativas con async/await, headers y métodos GET, POST, PUT, DELETE
 * - Deserialización manual (`res.json()`) y control de errores HTTP (res.ok)
 */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Fetch error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export class FetchRestService {
  static async getProductos(categoria?: string, search?: string): Promise<Producto[]> {
    const params = new URLSearchParams();
    if (categoria) params.set('categoria', categoria);
    if (search) params.set('search', search);
    const qs = params.toString();
    return request<Producto[]>(`/productos${qs ? `?${qs}` : ''}`);
  }

  static async getProductoById(id: string): Promise<Producto> {
    return request<Producto>(`/productos/${encodeURIComponent(id)}`);
  }

  static async createProducto(prod: NuevoProductoInput): Promise<Producto> {
    return request<Producto>('/productos', { method: 'POST', body: JSON.stringify(prod) });
  }

  static async updateProducto(id: string, updates: ActualizarProductoInput): Promise<Producto> {
    return request<Producto>(`/productos/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  static async deleteProducto(id: string): Promise<{ success: boolean; id: string }> {
    return request(`/productos/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  static async getVentas(): Promise<Venta[]> {
    return request<Venta[]>('/ventas');
  }

  static async createVenta(venta: Omit<Venta, 'id' | 'correlativo' | 'fecha' | 'hora'>): Promise<Venta> {
    return request<Venta>('/ventas', { method: 'POST', body: JSON.stringify(venta) });
  }

  static async validarCupon(codigo: string) {
    return request<{ valido: boolean; descuento: number; mensaje: string }>(
      `/cupones/${encodeURIComponent(codigo)}`
    );
  }

  static async consultarRuc(ruc: string) {
    return request<{ ruc: string; razonSocial: string; estado: string }>(
      `/consulta-ruc/${encodeURIComponent(ruc)}`
    );
  }

  static async consultarDni(dni: string) {
    return request<{ dni: string; nombreCompleto: string }>(`/consulta-dni/${encodeURIComponent(dni)}`);
  }
}
