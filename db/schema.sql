-- Esquema de TAMBOPOS. Se aplica con CREATE TABLE IF NOT EXISTS desde
-- db/migrate.mjs, así que correr este script o el migrador más de una vez es
-- seguro (idempotente).

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(10) NOT NULL CHECK (rol IN ('ADMIN', 'CAJERO')),
  nombre_completo VARCHAR(120) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evita "admin" y "ADMIN" como cuentas distintas (riesgo de suplantación).
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_username_lower_idx ON usuarios (LOWER(username));

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(40) UNIQUE NOT NULL,
  prefijo VARCHAR(5) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id TEXT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  precio_regular NUMERIC(10, 2) NOT NULL CHECK (precio_regular > 0),
  precio_oferta NUMERIC(10, 2) NOT NULL CHECK (precio_oferta > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  CONSTRAINT productos_oferta_check CHECK (precio_oferta <= precio_regular),
  porcentaje_descuento INTEGER NOT NULL DEFAULT 0,
  es_prime BOOLEAN NOT NULL DEFAULT false,
  imagen_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS proveedores (
  id SERIAL PRIMARY KEY,
  ruc VARCHAR(11) UNIQUE NOT NULL,
  razon_social VARCHAR(200) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS proveedor_productos (
  proveedor_id INTEGER NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  producto_id TEXT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  precio_referencial NUMERIC(10, 2),
  PRIMARY KEY (proveedor_id, producto_id)
);

CREATE TABLE IF NOT EXISTS compras (
  id SERIAL PRIMARY KEY,
  proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
  numero_documento VARCHAR(40),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compras_items (
  id SERIAL PRIMARY KEY,
  compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  producto_id TEXT NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario > 0),
  subtotal NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ventas (
  id TEXT PRIMARY KEY,
  correlativo VARCHAR(20) NOT NULL,
  fecha VARCHAR(10) NOT NULL,
  hora VARCHAR(8) NOT NULL,
  comprobante VARCHAR(10) NOT NULL CHECK (comprobante IN ('BOLETA', 'FACTURA')),
  cliente_tipo_doc VARCHAR(10),
  cliente_num_doc VARCHAR(20),
  cliente_ruc VARCHAR(11),
  cliente_razon_social VARCHAR(200),
  total_productos NUMERIC(10, 2) NOT NULL DEFAULT 0,
  descuento_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  descuento_cupon NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cupon_codigo VARCHAR(20),
  subtotal_final NUMERIC(10, 2) NOT NULL DEFAULT 0,
  igv NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sin FK a productos: una venta debe conservar su historial aunque el
-- producto vendido se elimine más tarde del catálogo.
CREATE TABLE IF NOT EXISTS ventas_items (
  id SERIAL PRIMARY KEY,
  venta_id TEXT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id TEXT NOT NULL,
  nombre_producto VARCHAR(120) NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL
);
