// Migración/seed único de TAMBOPOS. Ejecutar con:
//   node --env-file=.env db/migrate.mjs
//
// Crea el esquema (idempotente) y, solo si las tablas están vacías, siembra
// las 4 categorías, los 48 productos originales (con código nuevo por
// categoría: BEB-001.., SNK-001.., CR-001.., ABA-001..) y el usuario
// administrador inicial. Usa `pg` con consultas parametrizadas en todo el
// seed de datos (nunca concatenación de strings).

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Client } = pg;

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const ADMIN_NOMBRE = process.env.SEED_ADMIN_NOMBRE || 'Administrador Tambo';

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL. Corre con: node --env-file=.env db/migrate.mjs');
  process.exit(1);
}
if (!ADMIN_PASSWORD) {
  console.error('Falta SEED_ADMIN_PASSWORD en el entorno.');
  process.exit(1);
}

const CATEGORIAS = [
  { nombre: 'Bebidas', prefijo: 'BEB' },
  { nombre: 'Snacks', prefijo: 'SNK' },
  { nombre: 'Comida Rápida', prefijo: 'CR' },
  { nombre: 'Abarrotes', prefijo: 'ABA' }
];

// Mismos 48 productos que src/data/initialProducts.ts, agrupados por
// categoría en el mismo orden; solo cambia el código (id) asignado.
const PRODUCTOS = {
  Bebidas: [
    ['Inca Kola 1.5L', 7.5, 7.5, 25, 0, false, '/assets/img/productos/P001.jpg'],
    ['Coca Cola 1.5L', 7.8, 7.8, 20, 0, false, '/assets/img/productos/P002.jpg'],
    ['Pack (2 Coca Cola Sin Azúcar Lata 350ml)', 14.99, 10.9, 20, 27, false, '/assets/img/productos/P003.jpg'],
    ['Pack (2 Sprite Lata 350ml)', 14.99, 10.9, 18, 27, false, '/assets/img/productos/P004.jpg'],
    ['Pack 2 Gaseosa Coca Cola 600ml', 7.38, 6.0, 25, 19, false, '/assets/img/productos/P005.JPG'],
    ['Pack 2 Gaseosa Coca Cola Zero 600ml', 7.38, 6.0, 30, 19, false, '/assets/img/productos/P006.JPG'],
    ['Pack 2 Gaseosa Inca Kola 600ml', 7.38, 6.0, 22, 19, false, '/assets/img/productos/P007.JPG'],
    ['Pack 2 Gaseosa Inca Kola Zero 600ml', 7.38, 6.0, 20, 19, false, '/assets/img/productos/P008.JPG'],
    ['Pack (1 Hey Fit Piña Colada 350ml)', 5.6, 5.6, 15, 0, false, '/assets/img/productos/P009.JPG'],
    ['Sporade Cítrico 500ml', 3.0, 3.0, 30, 0, false, '/assets/img/productos/P010.JPG'],
    ['Red Bull 250ml', 8.5, 8.5, 40, 0, false, '/assets/img/productos/P011.jpg'],
    ['Cerveza Pilsen Callao 630ml', 7.0, 7.0, 35, 0, false, '/assets/img/productos/P012.jpg']
  ],
  Snacks: [
    ['Papas Lays 160g', 5.2, 5.2, 30, 0, false, '/assets/img/productos/P013.jpg'],
    ['Doritos Queso 140g', 4.8, 4.8, 15, 0, false, '/assets/img/productos/P014.jpg'],
    ['Cheetos Queso 120g', 4.2, 4.2, 20, 0, false, '/assets/img/productos/P015.jpg'],
    ['Cuates Picante 80g', 2.0, 2.0, 45, 0, false, '/assets/img/productos/P016.jpg'],
    ['Cheese Tris 150g', 4.0, 4.0, 25, 0, false, '/assets/img/productos/P017.JPG'],
    ['Pringles Original 124g', 10.5, 10.5, 12, 0, false, '/assets/img/productos/P018.JPG'],
    ['Galletas Casino Menta', 2.5, 2.5, 40, 0, false, '/assets/img/productos/P019.jpg'],
    ['Galletas Oreo 126g', 3.2, 3.2, 35, 0, false, '/assets/img/productos/P020.jpg'],
    ['Chocolate Sublime 30g', 2.2, 2.2, 50, 0, false, '/assets/img/productos/P021.jpg'],
    ['Chocolate Triángulo 30g', 2.2, 2.2, 48, 0, false, '/assets/img/productos/P022.JPG'],
    ['Chocman 33g', 1.8, 1.8, 60, 0, false, '/assets/img/productos/P023.JPG'],
    ['Maní Moto Salado 90g', 3.0, 3.0, 30, 0, false, '/assets/img/productos/P024.JPG']
  ],
  'Comida Rápida': [
    ['Hamburguesa Prime Chicken', 12.9, 12.9, 15, 0, true, '/assets/img/productos/P025.JPG'],
    ['Hamburguesa Prime de Res', 13.9, 13.9, 15, 0, true, '/assets/img/productos/P026.JPG'],
    ['Hamburguesa Prime Black Brangus', 12.9, 12.9, 10, 0, true, '/assets/img/productos/P027.JPG'],
    ['Pack (1 Coca Cola 1L + 2 Hamburguesas Doble)', 19.0, 15.9, 12, 16, false, '/assets/img/productos/P028.JPG'],
    ['Pack (2 Hamburguesas a lo Pobre + 1 Coca Cola 1L)', 21.49, 14.9, 10, 31, false, '/assets/img/productos/P029.JPG'],
    ['Empanada de Carne', 4.5, 4.5, 10, 0, false, '/assets/img/productos/P030.JPG'],
    ['Sandwich de Pollo', 5.5, 5.5, 12, 0, false, '/assets/img/productos/P031.JPG'],
    ['Hot Dog Tambo Clásico', 6.0, 6.0, 20, 0, false, '/assets/img/productos/P032.JPG'],
    ['Hot Dog Tambo Gigante', 8.5, 8.5, 15, 0, false, '/assets/img/productos/P033.JPG'],
    ['Pizza Personal Pepperoni', 9.9, 9.9, 8, 0, false, '/assets/img/productos/P034.JPG'],
    ['Papa Rellena', 5.0, 5.0, 10, 0, false, '/assets/img/productos/P035.JPG'],
    ['Donut Glaseada', 3.5, 3.5, 25, 0, false, '/assets/img/productos/P036.JPG']
  ],
  Abarrotes: [
    ['Arroz Costeño 1kg', 4.9, 4.9, 40, 0, false, '/assets/img/productos/P037.jpg'],
    ['Aceite Primor 1L', 9.5, 9.5, 18, 0, false, '/assets/img/productos/P038.jpg'],
    ['Atún Florida Trozos 140g', 6.2, 6.2, 25, 0, false, '/assets/img/productos/P039.jpg'],
    ['Fideos Don Vittorio 500g', 3.2, 3.2, 50, 0, false, '/assets/img/productos/P040.JPG'],
    ['Leche Gloria Azul 395g', 4.2, 4.2, 60, 0, false, '/assets/img/productos/P041.JPG'],
    ['Sugar Blond Azúcar 1kg', 4.5, 4.5, 35, 0, false, '/assets/img/productos/P042.JPG'],
    ['Avena 3 Ositos 400g', 3.8, 3.8, 28, 0, false, '/assets/img/productos/P043.JPG'],
    ['Café Nescafé Tradición 50g', 7.5, 7.5, 22, 0, false, '/assets/img/productos/P044.JPG'],
    ['Mayonesa Alacena 200g', 4.8, 4.8, 30, 0, false, '/assets/img/productos/P045.JPG'],
    ['Ketchup Alacena 200g', 3.9, 3.9, 30, 0, false, '/assets/img/productos/P046.JPG'],
    ['Salsa de Tomate Pomarola', 2.8, 2.8, 40, 0, false, '/assets/img/productos/P047.JPG'],
    ['Sal Marina Lobos 1kg', 2.0, 2.0, 50, 0, false, '/assets/img/productos/P048.JPG']
  ]
};

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const schema = fs.readFileSync(path.resolve(process.cwd(), 'db', 'schema.sql'), 'utf-8');
    await client.query(schema);
    console.log('✔ Esquema aplicado.');

    const categoriaIds = {};
    for (const cat of CATEGORIAS) {
      const result = await client.query(
        `INSERT INTO categorias (nombre, prefijo) VALUES ($1, $2)
         ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
         RETURNING id`,
        [cat.nombre, cat.prefijo]
      );
      categoriaIds[cat.nombre] = result.rows[0].id;
    }
    console.log('✔ Categorías sembradas:', Object.keys(categoriaIds).join(', '));

    const { rows: countRows } = await client.query('SELECT COUNT(*)::int AS count FROM productos');
    if (countRows[0].count > 0) {
      console.log(`… Ya hay ${countRows[0].count} productos, se omite el seed de catálogo.`);
    } else {
      let totalInsertados = 0;
      for (const [categoriaNombre, items] of Object.entries(PRODUCTOS)) {
        const categoriaId = categoriaIds[categoriaNombre];
        const prefijo = CATEGORIAS.find((c) => c.nombre === categoriaNombre).prefijo;
        let seq = 1;
        for (const [nombre, precioRegular, precioOferta, stock, descuento, esPrime, imagenUrl] of items) {
          const id = `${prefijo}-${String(seq).padStart(3, '0')}`;
          await client.query(
            `INSERT INTO productos (id, nombre, categoria_id, precio_regular, precio_oferta, stock, porcentaje_descuento, es_prime, imagen_url)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [id, nombre, categoriaId, precioRegular, precioOferta, stock, descuento, esPrime, imagenUrl]
          );
          seq += 1;
          totalInsertados += 1;
        }
      }
      console.log(`✔ ${totalInsertados} productos sembrados.`);
    }

    const { rows: adminRows } = await client.query('SELECT id FROM usuarios WHERE username = $1', [ADMIN_USERNAME]);
    if (adminRows.length > 0) {
      console.log(`… El usuario "${ADMIN_USERNAME}" ya existe, no se vuelve a crear.`);
    } else {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await client.query(
        `INSERT INTO usuarios (username, password_hash, rol, nombre_completo, activo)
         VALUES ($1, $2, 'ADMIN', $3, true)`,
        [ADMIN_USERNAME, passwordHash, ADMIN_NOMBRE]
      );
      console.log(`✔ Usuario administrador "${ADMIN_USERNAME}" creado.`);
    }

    console.log('Migración completa.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Error en la migración:', err);
  process.exit(1);
});
