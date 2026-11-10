import { Producto, Cliente } from '../types';

export const PRODUCTOS_INICIALES: Producto[] = [
  // --- BEBIDAS ---
  { id: "P001", nombre: "Inca Kola 1.5L", categoria: "Bebidas", precioRegular: 7.50, precioOferta: 7.50, stock: 25, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&q=80" },
  { id: "P002", nombre: "Coca Cola 1.5L", categoria: "Bebidas", precioRegular: 7.80, precioOferta: 7.80, stock: 20, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80" },
  { id: "P003", nombre: "Pack (2 Coca Cola Sin Azúcar Lata 350ml)", categoria: "Bebidas", precioRegular: 14.99, precioOferta: 10.90, stock: 20, porcentajeDescuento: 27, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80" },
  { id: "P004", nombre: "Pack (2 Sprite Lata 350ml)", categoria: "Bebidas", precioRegular: 14.99, precioOferta: 10.90, stock: 18, porcentajeDescuento: 27, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80" },
  { id: "P005", nombre: "Pack 2 Gaseosa Coca Cola 600ml", categoria: "Bebidas", precioRegular: 7.38, precioOferta: 6.00, stock: 25, porcentajeDescuento: 19, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80" },
  { id: "P006", nombre: "Pack 2 Gaseosa Coca Cola Zero 600ml", categoria: "Bebidas", precioRegular: 7.38, precioOferta: 6.00, stock: 30, porcentajeDescuento: 19, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80" },
  { id: "P007", nombre: "Pack 2 Gaseosa Inca Kola 600ml", categoria: "Bebidas", precioRegular: 7.38, precioOferta: 6.00, stock: 22, porcentajeDescuento: 19, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&q=80" },
  { id: "P008", nombre: "Pack 2 Gaseosa Inca Kola Zero 600ml", categoria: "Bebidas", precioRegular: 7.38, precioOferta: 6.00, stock: 20, porcentajeDescuento: 19, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&q=80" },
  { id: "P009", nombre: "Pack (1 Hey Fit Piña Colada 350ml)", categoria: "Bebidas", precioRegular: 5.60, precioOferta: 5.60, stock: 15, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80" },
  { id: "P010", nombre: "Sporade Cítrico 500ml", categoria: "Bebidas", precioRegular: 3.00, precioOferta: 3.00, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&q=80" },
  { id: "P011", nombre: "Red Bull 250ml", categoria: "Bebidas", precioRegular: 8.50, precioOferta: 8.50, stock: 40, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&q=80" },
  { id: "P012", "nombre": "Cerveza Pilsen Callao 630ml", categoria: "Bebidas", precioRegular: 7.00, precioOferta: 7.00, stock: 35, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80" },

  // --- SNACKS ---
  { id: "P013", nombre: "Papas Lays Clásicas 160g", categoria: "Snacks", precioRegular: 5.20, precioOferta: 5.20, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80" },
  { id: "P014", nombre: "Doritos Mega Queso 140g", categoria: "Snacks", precioRegular: 4.80, precioOferta: 4.80, stock: 15, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80" },
  { id: "P015", nombre: "Cheetos Queso Crocantes 120g", categoria: "Snacks", precioRegular: 4.20, precioOferta: 4.20, stock: 20, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80" },
  { id: "P016", nombre: "Cuates Picante 80g", categoria: "Snacks", precioRegular: 2.00, precioOferta: 2.00, stock: 45, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80" },
  { id: "P017", nombre: "Cheese Tris Familiar 150g", categoria: "Snacks", precioRegular: 4.00, precioOferta: 4.00, stock: 25, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80" },
  { id: "P018", nombre: "Pringles Original 124g", categoria: "Snacks", precioRegular: 10.50, precioOferta: 10.50, stock: 12, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80" },
  { id: "P019", nombre: "Galletas Casino Menta", categoria: "Snacks", precioRegular: 2.50, precioOferta: 2.50, stock: 40, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80" },
  { id: "P020", nombre: "Galletas Oreo Tubo 126g", categoria: "Snacks", precioRegular: 3.20, precioOferta: 3.20, stock: 35, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80" },
  { id: "P021", nombre: "Chocolate Sublime Clásico 30g", categoria: "Snacks", precioRegular: 2.20, precioOferta: 2.20, stock: 50, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1582176647440-3b137b3156e3?w=400&q=80" },
  { id: "P022", nombre: "Chocolate Triángulo D'Onofrio 30g", categoria: "Snacks", precioRegular: 2.20, precioOferta: 2.20, stock: 48, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1582176647440-3b137b3156e3?w=400&q=80" },
  { id: "P023", nombre: "Bizcocho Chocman 33g", categoria: "Snacks", precioRegular: 1.80, precioOferta: 1.80, stock: 60, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80" },
  { id: "P024", nombre: "Maní Moto Salado 90g", categoria: "Snacks", precioRegular: 3.00, precioOferta: 3.00, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80" },

  // --- COMIDA RÁPIDA ---
  { id: "P025", nombre: "Hamburguesa Prime Chicken", categoria: "Comida Rápida", precioRegular: 12.90, precioOferta: 12.90, stock: 15, porcentajeDescuento: 0, esPrime: true, imagenUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { id: "P026", nombre: "Hamburguesa Prime de Res", categoria: "Comida Rápida", precioRegular: 13.90, precioOferta: 13.90, stock: 15, porcentajeDescuento: 0, esPrime: true, imagenUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { id: "P027", nombre: "Hamburguesa Prime Black Brangus", categoria: "Comida Rápida", precioRegular: 12.90, precioOferta: 12.90, stock: 10, porcentajeDescuento: 0, esPrime: true, imagenUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { id: "P028", nombre: "Pack (1 Coca Cola 1L + 2 Hamburguesas Doble)", categoria: "Comida Rápida", precioRegular: 19.00, precioOferta: 15.90, stock: 12, porcentajeDescuento: 16, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&q=80" },
  { id: "P029", nombre: "Pack (2 Hamburguesas a lo Pobre + 1 Coca Cola 1L)", categoria: "Comida Rápida", precioRegular: 21.49, precioOferta: 14.90, stock: 10, porcentajeDescuento: 31, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&q=80" },
  { id: "P030", nombre: "Empanada Criolla de Carne", categoria: "Comida Rápida", precioRegular: 4.50, precioOferta: 4.50, stock: 10, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80" },
  { id: "P031", nombre: "Sandwich de Pollo Deshilachado", categoria: "Comida Rápida", precioRegular: 5.50, precioOferta: 5.50, stock: 12, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
  { id: "P032", nombre: "Hot Dog Tambo Clásico", categoria: "Comida Rápida", precioRegular: 6.00, precioOferta: 6.00, stock: 20, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=400&q=80" },
  { id: "P033", nombre: "Hot Dog Tambo Gigante", categoria: "Comida Rápida", precioRegular: 8.50, precioOferta: 8.50, stock: 15, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=400&q=80" },
  { id: "P034", nombre: "Pizza Personal Pepperoni", categoria: "Comida Rápida", precioRegular: 9.90, precioOferta: 9.90, stock: 8, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" },
  { id: "P035", nombre: "Papa Rellena Casera", categoria: "Comida Rápida", precioRegular: 5.00, precioOferta: 5.00, stock: 10, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&q=80" },
  { id: "P036", nombre: "Donut Glaseada con Chocolate", categoria: "Comida Rápida", precioRegular: 3.50, precioOferta: 3.50, stock: 25, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80" },

  // --- ABARROTES ---
  { id: "P037", nombre: "Arroz Costeño Extra 1kg", categoria: "Abarrotes", precioRegular: 4.90, precioOferta: 4.90, stock: 40, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
  { id: "P038", nombre: "Aceite Vegetal Primor 1L", categoria: "Abarrotes", precioRegular: 9.50, precioOferta: 9.50, stock: 18, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" },
  { id: "P039", nombre: "Atún Florida Trozos en Aceite 140g", categoria: "Abarrotes", precioRegular: 6.20, precioOferta: 6.20, stock: 25, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" },
  { id: "P040", nombre: "Fideos Don Vittorio Spaghetti 500g", categoria: "Abarrotes", precioRegular: 3.20, precioOferta: 3.20, stock: 50, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
  { id: "P041", nombre: "Leche Gloria Azul Evaporada 395g", categoria: "Abarrotes", precioRegular: 4.20, precioOferta: 4.20, stock: 60, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&q=80" },
  { id: "P042", nombre: "Sugar Blond Azúcar Rubia 1kg", categoria: "Abarrotes", precioRegular: 4.50, precioOferta: 4.50, stock: 35, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
  { id: "P043", nombre: "Avena 3 Ositos Tradicional 400g", categoria: "Abarrotes", precioRegular: 3.80, precioOferta: 3.80, stock: 28, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
  { id: "P044", nombre: "Café Nescafé Tradición 50g", categoria: "Abarrotes", precioRegular: 7.50, precioOferta: 7.50, stock: 22, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80" },
  { id: "P045", nombre: "Mayonesa Alacena Doypack 200g", categoria: "Abarrotes", precioRegular: 4.80, precioOferta: 4.80, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" },
  { id: "P046", nombre: "Ketchup Alacena Doypack 200g", categoria: "Abarrotes", precioRegular: 3.90, precioOferta: 3.90, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" },
  { id: "P047", nombre: "Salsa de Tomate Pomarola Molitalia", categoria: "Abarrotes", precioRegular: 2.80, precioOferta: 2.80, stock: 40, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
  { id: "P048", nombre: "Sal Marina Yodada Lobos 1kg", categoria: "Abarrotes", precioRegular: 2.00, precioOferta: 2.00, stock: 50, porcentajeDescuento: 0, esPrime: false, imagenUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" }
];

export const CLIENTES_MOCK: Cliente[] = [
  { tipoDoc: 'DNI', numDoc: '72839401', nombreCompleto: 'Piero Franco', direccion: 'Av. Larco 450, Miraflores, Lima', esSocioPrime: true },
  { tipoDoc: 'DNI', numDoc: '45678912', nombreCompleto: 'Ana María Torres', direccion: 'Jr. de la Unión 820, Lima Cercado', esSocioPrime: true },
  { tipoDoc: 'DNI', numDoc: '10293847', nombreCompleto: 'Carlos Eduardo Mendoza', direccion: 'Av. Arequipa 1420, Lince', esSocioPrime: false },
  { tipoDoc: 'RUC', numDoc: '20601234567', nombreCompleto: 'CORPORACION TAMBO PERU S.A.C.', direccion: 'Av. Javier Prado Este 4200, Surco', esSocioPrime: true },
  { tipoDoc: 'RUC', numDoc: '20554433221', nombreCompleto: 'INVERSIONES LIMA DIGITAL E.I.R.L.', direccion: 'Av. Benavides 1230, Miraflores', esSocioPrime: false },
  { tipoDoc: 'CE', numDoc: '001239845', nombreCompleto: 'Jean-Luc Dupont', direccion: 'Calle Schell 310, Miraflores', esSocioPrime: false },
  { tipoDoc: 'PASAPORTE', numDoc: 'AB987654', nombreCompleto: 'Sarah Jessica Miller', direccion: 'Hotel Marriott, Miraflores', esSocioPrime: false }
];

// Helper para almacenamiento local sincronizado
const STORAGE_KEY_PRODUCTS = 'tambo_pos_productos_db';

export function getProductosPersistidos(): Producto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(PRODUCTOS_INICIALES));
      return [...PRODUCTOS_INICIALES];
    }
    return JSON.parse(raw);
  } catch {
    return [...PRODUCTOS_INICIALES];
  }
}

export function saveProductosPersistidos(productos: Producto[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(productos));
  } catch (err) {
    console.error("Error guardando en localStorage", err);
  }
}

