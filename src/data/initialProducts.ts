import { Producto } from '../types/pos';

export const INITIAL_PRODUCTS: Producto[] = [
  // --- BEBIDAS ---
  { id: 'P001', nombre: 'Inca Kola 1.5L', categoria: 'Bebidas', precioRegular: 7.50, precioOferta: 7.50, stock: 25, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P001.jpg' },
  { id: 'P002', nombre: 'Coca Cola 1.5L', categoria: 'Bebidas', precioRegular: 7.80, precioOferta: 7.80, stock: 20, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P002.jpg' },
  { id: 'P003', nombre: 'Pack (2 Coca Cola Sin Azúcar Lata 350ml)', categoria: 'Bebidas', precioRegular: 14.99, precioOferta: 10.90, stock: 20, porcentajeDescuento: 27, esPrime: false, imagenUrl: '/assets/img/productos/P003.jpg' },
  { id: 'P004', nombre: 'Pack (2 Sprite Lata 350ml)', categoria: 'Bebidas', precioRegular: 14.99, precioOferta: 10.90, stock: 18, porcentajeDescuento: 27, esPrime: false, imagenUrl: '/assets/img/productos/P004.jpg' },
  { id: 'P005', nombre: 'Pack 2 Gaseosa Coca Cola 600ml', categoria: 'Bebidas', precioRegular: 7.38, precioOferta: 6.00, stock: 25, porcentajeDescuento: 19, esPrime: false, imagenUrl: '/assets/img/productos/P005.JPG' },
  { id: 'P006', nombre: 'Pack 2 Gaseosa Coca Cola Zero 600ml', categoria: 'Bebidas', precioRegular: 7.38, precioOferta: 6.00, stock: 30, porcentajeDescuento: 19, esPrime: false, imagenUrl: '/assets/img/productos/P006.JPG' },
  { id: 'P007', nombre: 'Pack 2 Gaseosa Inca Kola 600ml', categoria: 'Bebidas', precioRegular: 7.38, precioOferta: 6.00, stock: 22, porcentajeDescuento: 19, esPrime: false, imagenUrl: '/assets/img/productos/P007.JPG' },
  { id: 'P008', nombre: 'Pack 2 Gaseosa Inca Kola Zero 600ml', categoria: 'Bebidas', precioRegular: 7.38, precioOferta: 6.00, stock: 20, porcentajeDescuento: 19, esPrime: false, imagenUrl: '/assets/img/productos/P008.JPG' },
  { id: 'P009', nombre: 'Pack (1 Hey Fit Piña Colada 350ml)', categoria: 'Bebidas', precioRegular: 5.60, precioOferta: 5.60, stock: 15, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P009.JPG' },
  { id: 'P010', nombre: 'Sporade Cítrico 500ml', categoria: 'Bebidas', precioRegular: 3.00, precioOferta: 3.00, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P010.JPG' },
  { id: 'P011', nombre: 'Red Bull 250ml', categoria: 'Bebidas', precioRegular: 8.50, precioOferta: 8.50, stock: 40, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P011.jpg' },
  { id: 'P012', nombre: 'Cerveza Pilsen Callao 630ml', categoria: 'Bebidas', precioRegular: 7.00, precioOferta: 7.00, stock: 35, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P012.jpg' },

  // --- SNACKS ---
  { id: 'P013', nombre: 'Papas Lays 160g', categoria: 'Snacks', precioRegular: 5.20, precioOferta: 5.20, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P013.jpg' },
  { id: 'P014', nombre: 'Doritos Queso 140g', categoria: 'Snacks', precioRegular: 4.80, precioOferta: 4.80, stock: 15, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P014.jpg' },
  { id: 'P015', nombre: 'Cheetos Queso 120g', categoria: 'Snacks', precioRegular: 4.20, precioOferta: 4.20, stock: 20, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P015.jpg' },
  { id: 'P016', nombre: 'Cuates Picante 80g', categoria: 'Snacks', precioRegular: 2.00, precioOferta: 2.00, stock: 45, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P016.jpg' },
  { id: 'P017', nombre: 'Cheese Tris 150g', categoria: 'Snacks', precioRegular: 4.00, precioOferta: 4.00, stock: 25, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P017.JPG' },
  { id: 'P018', nombre: 'Pringles Original 124g', categoria: 'Snacks', precioRegular: 10.50, precioOferta: 10.50, stock: 12, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P018.JPG' },
  { id: 'P019', nombre: 'Galletas Casino Menta', categoria: 'Snacks', precioRegular: 2.50, precioOferta: 2.50, stock: 40, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P019.jpg' },
  { id: 'P020', nombre: 'Galletas Oreo 126g', categoria: 'Snacks', precioRegular: 3.20, precioOferta: 3.20, stock: 35, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P020.jpg' },
  { id: 'P021', nombre: 'Chocolate Sublime 30g', categoria: 'Snacks', precioRegular: 2.20, precioOferta: 2.20, stock: 50, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P021.jpg' },
  { id: 'P022', nombre: 'Chocolate Triángulo 30g', categoria: 'Snacks', precioRegular: 2.20, precioOferta: 2.20, stock: 48, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P022.JPG' },
  { id: 'P023', nombre: 'Chocman 33g', categoria: 'Snacks', precioRegular: 1.80, precioOferta: 1.80, stock: 60, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P023.JPG' },
  { id: 'P024', nombre: 'Maní Moto Salado 90g', categoria: 'Snacks', precioRegular: 3.00, precioOferta: 3.00, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P024.JPG' },

  // --- COMIDA RÁPIDA ---
  { id: 'P025', nombre: 'Hamburguesa Prime Chicken', categoria: 'Comida Rápida', precioRegular: 12.90, precioOferta: 12.90, stock: 15, porcentajeDescuento: 0, esPrime: true, imagenUrl: '/assets/img/productos/P025.JPG' },
  { id: 'P026', nombre: 'Hamburguesa Prime de Res', categoria: 'Comida Rápida', precioRegular: 13.90, precioOferta: 13.90, stock: 15, porcentajeDescuento: 0, esPrime: true, imagenUrl: '/assets/img/productos/P026.JPG' },
  { id: 'P027', nombre: 'Hamburguesa Prime Black Brangus', categoria: 'Comida Rápida', precioRegular: 12.90, precioOferta: 12.90, stock: 10, porcentajeDescuento: 0, esPrime: true, imagenUrl: '/assets/img/productos/P027.JPG' },
  { id: 'P028', nombre: 'Pack (1 Coca Cola 1L + 2 Hamburguesas Doble)', categoria: 'Comida Rápida', precioRegular: 19.00, precioOferta: 15.90, stock: 12, porcentajeDescuento: 16, esPrime: false, imagenUrl: '/assets/img/productos/P028.JPG' },
  { id: 'P029', nombre: 'Pack (2 Hamburguesas a lo Pobre + 1 Coca Cola 1L)', categoria: 'Comida Rápida', precioRegular: 21.49, precioOferta: 14.90, stock: 10, porcentajeDescuento: 31, esPrime: false, imagenUrl: '/assets/img/productos/P029.JPG' },
  { id: 'P030', nombre: 'Empanada de Carne', categoria: 'Comida Rápida', precioRegular: 4.50, precioOferta: 4.50, stock: 10, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P030.JPG' },
  { id: 'P031', nombre: 'Sandwich de Pollo', categoria: 'Comida Rápida', precioRegular: 5.50, precioOferta: 5.50, stock: 12, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P031.JPG' },
  { id: 'P032', nombre: 'Hot Dog Tambo Clásico', categoria: 'Comida Rápida', precioRegular: 6.00, precioOferta: 6.00, stock: 20, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P032.JPG' },
  { id: 'P033', nombre: 'Hot Dog Tambo Gigante', categoria: 'Comida Rápida', precioRegular: 8.50, precioOferta: 8.50, stock: 15, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P033.JPG' },
  { id: 'P034', nombre: 'Pizza Personal Pepperoni', categoria: 'Comida Rápida', precioRegular: 9.90, precioOferta: 9.90, stock: 8, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P034.JPG' },
  { id: 'P035', nombre: 'Papa Rellena', categoria: 'Comida Rápida', precioRegular: 5.00, precioOferta: 5.00, stock: 10, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P035.JPG' },
  { id: 'P036', nombre: 'Donut Glaseada', categoria: 'Comida Rápida', precioRegular: 3.50, precioOferta: 3.50, stock: 25, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P036.JPG' },

  // --- ABARROTES ---
  { id: 'P037', nombre: 'Arroz Costeño 1kg', categoria: 'Abarrotes', precioRegular: 4.90, precioOferta: 4.90, stock: 40, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P037.jpg' },
  { id: 'P038', nombre: 'Aceite Primor 1L', categoria: 'Abarrotes', precioRegular: 9.50, precioOferta: 9.50, stock: 18, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P038.jpg' },
  { id: 'P039', nombre: 'Atún Florida Trozos 140g', categoria: 'Abarrotes', precioRegular: 6.20, precioOferta: 6.20, stock: 25, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P039.jpg' },
  { id: 'P040', nombre: 'Fideos Don Vittorio 500g', categoria: 'Abarrotes', precioRegular: 3.20, precioOferta: 3.20, stock: 50, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P040.JPG' },
  { id: 'P041', nombre: 'Leche Gloria Azul 395g', categoria: 'Abarrotes', precioRegular: 4.20, precioOferta: 4.20, stock: 60, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P041.JPG' },
  { id: 'P042', nombre: 'Sugar Blond Azúcar 1kg', categoria: 'Abarrotes', precioRegular: 4.50, precioOferta: 4.50, stock: 35, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P042.JPG' },
  { id: 'P043', nombre: 'Avena 3 Ositos 400g', categoria: 'Abarrotes', precioRegular: 3.80, precioOferta: 3.80, stock: 28, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P043.JPG' },
  { id: 'P044', nombre: 'Café Nescafé Tradición 50g', categoria: 'Abarrotes', precioRegular: 7.50, precioOferta: 7.50, stock: 22, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P044.JPG' },
  { id: 'P045', nombre: 'Mayonesa Alacena 200g', categoria: 'Abarrotes', precioRegular: 4.80, precioOferta: 4.80, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P045.JPG' },
  { id: 'P046', nombre: 'Ketchup Alacena 200g', categoria: 'Abarrotes', precioRegular: 3.90, precioOferta: 3.90, stock: 30, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P046.JPG' },
  { id: 'P047', nombre: 'Salsa de Tomate Pomarola', categoria: 'Abarrotes', precioRegular: 2.80, precioOferta: 2.80, stock: 40, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P047.JPG' },
  { id: 'P048', nombre: 'Sal Marina Lobos 1kg', categoria: 'Abarrotes', precioRegular: 2.00, precioOferta: 2.00, stock: 50, porcentajeDescuento: 0, esPrime: false, imagenUrl: '/assets/img/productos/P048.JPG' }
];

export const CUPONES_VALIDOS: Record<string, number> = {
  '18892': 5.00,
  '18893': 10.00,
  '18894': 15.00,
  'TAMBO20': 20.00,
  'REACT2026': 25.00
};

export const IGV_RATE = 0.18;
export const UMBRAL_STOCK_BAJO = 15;
export const ADMIN_PIN = '1234';

