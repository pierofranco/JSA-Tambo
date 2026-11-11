import { FetchRestService } from './fetchService';
import { AxiosRestService } from './axiosService';
import { AlovaRestService } from './alovaService';
import { Producto, Venta } from '../types/pos';

export type ServiceDriver = 'Fetch' | 'Axios' | 'Alova';

export interface RequestMetrics {
  driver: ServiceDriver;
  endpoint: string;
  method: string;
  durationMs: number;
  timestamp: string;
  status: 'OK' | 'ERROR';
}

class ApiManager {
  private activeDriver: ServiceDriver = 'Fetch';
  private metricsListeners: Array<(metric: RequestMetrics) => void> = [];

  constructor() {
    const saved = localStorage.getItem('tambopos_service_driver');
    if (saved === 'Axios' || saved === 'Alova' || saved === 'Fetch') {
      this.activeDriver = saved;
    }
  }

  getDriver(): ServiceDriver {
    return this.activeDriver;
  }

  setDriver(driver: ServiceDriver) {
    this.activeDriver = driver;
    localStorage.setItem('tambopos_service_driver', driver);
  }

  onMetric(listener: (metric: RequestMetrics) => void) {
    this.metricsListeners.push(listener);
    return () => {
      this.metricsListeners = this.metricsListeners.filter((l) => l !== listener);
    };
  }

  private notifyMetric(driver: ServiceDriver, endpoint: string, method: string, durationMs: number, status: 'OK' | 'ERROR') {
    const metric: RequestMetrics = {
      driver,
      endpoint,
      method,
      durationMs,
      timestamp: new Date().toLocaleTimeString(),
      status
    };
    this.metricsListeners.forEach((l) => l(metric));
  }

  private async executeWithMetrics<T>(endpoint: string, method: string, executor: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await executor();
      const duration = Math.round(performance.now() - start);
      this.notifyMetric(this.activeDriver, endpoint, method, duration, 'OK');
      return result;
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      this.notifyMetric(this.activeDriver, endpoint, method, duration, 'ERROR');
      throw err;
    }
  }

  async getProductos(categoria?: string, search?: string): Promise<Producto[]> {
    return this.executeWithMetrics(`/api/productos?cat=${categoria || 'Todas'}`, 'GET', () => {
      if (this.activeDriver === 'Axios') return AxiosRestService.getProductos(categoria, search);
      if (this.activeDriver === 'Alova') return AlovaRestService.getProductos(categoria, search);
      return FetchRestService.getProductos(categoria, search);
    });
  }

  async createProducto(prod: Omit<Producto, 'id'>): Promise<Producto> {
    return this.executeWithMetrics('/api/productos', 'POST', () => {
      if (this.activeDriver === 'Axios') return AxiosRestService.createProducto(prod);
      if (this.activeDriver === 'Alova') return AlovaRestService.createProducto(prod);
      return FetchRestService.createProducto(prod);
    });
  }

  async updateProducto(id: string, updates: Partial<Producto>): Promise<Producto> {
    return this.executeWithMetrics(`/api/productos/${id}`, 'PUT', () => {
      if (this.activeDriver === 'Axios') return AxiosRestService.updateProducto(id, updates);
      if (this.activeDriver === 'Alova') return AlovaRestService.updateProducto(id, updates);
      return FetchRestService.updateProducto(id, updates);
    });
  }

  async deleteProducto(id: string): Promise<{ success: boolean; id: string }> {
    return this.executeWithMetrics(`/api/productos/${id}`, 'DELETE', () => {
      if (this.activeDriver === 'Axios') return AxiosRestService.deleteProducto(id);
      if (this.activeDriver === 'Alova') return AlovaRestService.deleteProducto(id);
      return FetchRestService.deleteProducto(id);
    });
  }

  async getVentas(): Promise<Venta[]> {
    return this.executeWithMetrics('/api/ventas', 'GET', () => {
      if (this.activeDriver === 'Axios') return AxiosRestService.getVentas();
      if (this.activeDriver === 'Alova') return AlovaRestService.getVentas();
      return FetchRestService.getVentas();
    });
  }

  async createVenta(venta: Omit<Venta, 'id' | 'correlativo' | 'fecha' | 'hora'>): Promise<Venta> {
    return this.executeWithMetrics('/api/ventas', 'POST', () => {
      if (this.activeDriver === 'Axios') return AxiosRestService.createVenta(venta);
      if (this.activeDriver === 'Alova') return AlovaRestService.createVenta(venta);
      return FetchRestService.createVenta(venta);
    });
  }

  async validarCupon(codigo: string) {
    return this.executeWithMetrics(`/api/cupones/${codigo}`, 'GET', () => {
      if (this.activeDriver === 'Axios') return AxiosRestService.validarCupon(codigo);
      if (this.activeDriver === 'Alova') return AlovaRestService.validarCupon(codigo);
      return FetchRestService.validarCupon(codigo);
    });
  }

  async consultarRuc(ruc: string) {
    return this.executeWithMetrics(`/api/consulta-ruc/${ruc}`, 'GET', () => {
      if (this.activeDriver === 'Axios') return AxiosRestService.consultarRuc(ruc);
      if (this.activeDriver === 'Alova') return AlovaRestService.consultarRuc(ruc);
      return FetchRestService.consultarRuc(ruc);
    });
  }

  async consultarDni(dni: string) {
    return this.executeWithMetrics(`/api/consulta-dni/${dni}`, 'GET', () => {
      if (this.activeDriver === 'Axios') return AxiosRestService.consultarDni(dni);
      if (this.activeDriver === 'Alova') return AlovaRestService.consultarDni(dni);
      return FetchRestService.consultarDni(dni);
    });
  }
}

export const ApiClient = new ApiManager();

