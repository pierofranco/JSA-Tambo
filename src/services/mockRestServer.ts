import { INITIAL_PRODUCTS, CUPONES_VALIDOS, IGV_RATE } from '../data/initialProducts';
import { Producto, Venta } from '../types/pos';

// Base de datos simulada en memoria (respaldada en localStorage)
const STORAGE_PROD_KEY = 'tambopos_db_products';
const STORAGE_SALES_KEY = 'tambopos_db_sales';

function getStoredProducts(): Producto[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROD_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [...INITIAL_PRODUCTS];
}

function saveStoredProducts(products: Producto[]): void {
  localStorage.setItem(STORAGE_PROD_KEY, JSON.stringify(products));
}

function getStoredSales(): Venta[] {
  try {
    const raw = localStorage.getItem(STORAGE_SALES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveStoredSales(sales: Venta[]): void {
  localStorage.setItem(STORAGE_SALES_KEY, JSON.stringify(sales));
}

// Simulación de latencia de red (150ms - 400ms)
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock REST API Server:
 * Emula un servidor backend REST completo para el consumo con Fetch API, Axios y Alova.
 */
export const MockRestServer = {
  // GET /api/productos
  async getProductos(categoria?: string, search?: string): Promise<Producto[]> {
    await delay(200);
    let list = getStoredProducts();
    if (categoria && categoria !== 'Todas') {
      list = list.filter((p) => p.categoria === categoria);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((p) => p.nombre.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    return list;
  },

  // GET /api/productos/:id
  async getProductoById(id: string): Promise<Producto> {
    await delay(150);
    const list = getStoredProducts();
    const item = list.find((p) => p.id === id);
    if (!item) throw new Error(`Producto con ID ${id} no encontrado (404)`);
    return item;
  },

  // POST /api/productos
  async createProducto(prod: Omit<Producto, 'id'> & { id?: string }): Promise<Producto> {
    await delay(300);
    const list = getStoredProducts();
    const newId = prod.id || `P${String(list.length + 1).padStart(3, '0')}`;
    const newProduct: Producto = {
      ...prod,
      id: newId,
      imagenUrl: prod.imagenUrl || `/assets/img/productos/${newId}.jpg`
    };
    list.unshift(newProduct);
    saveStoredProducts(list);
    return newProduct;
  },

  // PUT /api/productos/:id
  async updateProducto(id: string, updates: Partial<Producto>): Promise<Producto> {
    await delay(250);
    const list = getStoredProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Producto no encontrado para actualizar (404)`);
    list[index] = { ...list[index], ...updates };
    saveStoredProducts(list);
    return list[index];
  },

  // DELETE /api/productos/:id
  async deleteProducto(id: string): Promise<{ success: boolean; id: string }> {
    await delay(250);
    let list = getStoredProducts();
    list = list.filter((p) => p.id !== id);
    saveStoredProducts(list);
    return { success: true, id };
  },

  // GET /api/ventas
  async getVentas(): Promise<Venta[]> {
    await delay(200);
    return getStoredSales();
  },

  // POST /api/ventas
  async createVenta(ventaData: Omit<Venta, 'id' | 'correlativo' | 'fecha' | 'hora'>): Promise<Venta> {
    await delay(350);
    const sales = getStoredSales();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fecha = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const hora = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const numCorrelativo = sales.length + 1;
    const prefijo = ventaData.comprobante === 'FACTURA' ? 'F001' : 'B001';
    const correlativo = `${prefijo}-${String(numCorrelativo).padStart(8, '0')}`;

    const nuevaVenta: Venta = {
      ...ventaData,
      id: `VNT-${Date.now()}`,
      correlativo,
      fecha,
      hora
    };

    // Descontar stock de productos vendidos
    const products = getStoredProducts();
    ventaData.itemsComprados.forEach((item) => {
      const p = products.find((prod) => prod.id === item.id);
      if (p) {
        p.stock = Math.max(0, p.stock - item.cantidad);
      }
    });
    saveStoredProducts(products);

    sales.unshift(nuevaVenta);
    saveStoredSales(sales);
    return nuevaVenta;
  },

  // GET /api/cupones/:codigo
  async validarCupon(codigo: string): Promise<{ valido: boolean; descuento: number; mensaje: string }> {
    await delay(200);
    const codigoNormalizado = codigo.trim().toUpperCase();
    const descuento = CUPONES_VALIDOS[codigoNormalizado] || CUPONES_VALIDOS[codigo.trim()];
    if (descuento) {
      return { valido: true, descuento, mensaje: `Cupón válido: Descuento de S/ ${descuento.toFixed(2)}` };
    }
    return { valido: false, descuento: 0, mensaje: 'El código de cupón no existe o ha expirado.' };
  },

  // GET /api/consulta-ruc/:ruc (Simulación SUNAT)
  async consultarRucSunat(ruc: string): Promise<{ ruc: string; razonSocial: string; estado: string }> {
    await delay(300);
    if (!/^\d{11}$/.test(ruc)) {
      throw new Error('RUC inválido. Debe contener exactamente 11 dígitos.');
    }
    const mockEmpresas: Record<string, string> = {
      '20100070970': 'SUPERMERCADOS PERUANOS S.A.',
      '20100055237': 'TIENDAS POR DEPARTAMENTO RIPLEY S.A.C.',
      '20100047218': 'SAGA FALABELLA S.A.',
      '20601234567': 'INVERSIONES TAMBO RETAIL S.A.C.',
      '20555666777': 'CORPORACION GASTRONOMICA DEL SUR S.A.'
    };
    const razonSocial = mockEmpresas[ruc] || `EMPRESA COMERCIAL RUC ${ruc} S.A.C.`;
    return { ruc, razonSocial, estado: 'ACTIVO / HABIDO' };
  },

  // GET /api/consulta-dni/:dni (Simulación RENIEC)
  async consultarDniReniec(dni: string): Promise<{ dni: string; nombreCompleto: string }> {
    await delay(250);
    if (!/^\d{8}$/.test(dni)) {
      throw new Error('DNI inválido. Debe contener exactamente 8 dígitos.');
    }
    const nombres = ['JUAN CARLOS PÉREZ GÓMEZ', 'MARÍA ELENA LÓPEZ TORRES', 'ROBERTO CARLOS QUISPE MENDOZA', 'ANA SOFÍA DÍAZ RAMOS'];
    const index = parseInt(dni.slice(-1), 10) % nombres.length;
    return { dni, nombreCompleto: nombres[index] };
  }
};

