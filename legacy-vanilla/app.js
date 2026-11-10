// ==========================================
// 1. CLASES Y CONFIGURACIÓN INICIAL
// ==========================================
class Producto {
    constructor(id, nombre, categoria, precioRegular, precioOferta, stock, porcentajeDescuento = 0, esPrime = false, imagenUrl = "") {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precioRegular = Number(precioRegular);
        this.precioOferta = Number(precioOferta);
        this.stock = Number(stock);
        this.porcentajeDescuento = porcentajeDescuento;
        this.esPrime = esPrime;
        this.imagenUrl = imagenUrl || 'https://via.placeholder.com/120';
    }

    descontarStock(cantidad) {
        if (cantidad <= this.stock) {
            this.stock -= cantidad;
            return true;
        }
        return false;
    }
}

// Constantes y Banderas Bitwise
const IGV_RATE = 0.18;
const FLAG_SIN_PROMO = 0;       // 0000
const FLAG_COMBO_BEBIDA = 1;    // 0001
const FLAG_MONTO_SUPERIOR = 2;  // 0010

const inventarioMap = new Map();
let carrito = [];

// ==========================================
// MAPPING DE IMÁGENES DE PRODUCTOS (TAMBO)
// ==========================================
function obtenerImagenProducto(nombre, categoria) {
    const nombreMin = nombre.toLowerCase();

    // Bebidas
    if (nombreMin.includes("coca cola")) return "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80";
    if (nombreMin.includes("inca kola")) return "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=200&q=80";
    if (nombreMin.includes("sprite")) return "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=200&q=80";
    if (nombreMin.includes("cerveza") || nombreMin.includes("pilsen")) return "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&q=80";
    if (nombreMin.includes("red bull") || nombreMin.includes("sporade")) return "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=200&q=80";

    // Comida Rápida
    if (nombreMin.includes("hamburguesa")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80";
    if (nombreMin.includes("empanada")) return "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&q=80";
    if (nombreMin.includes("hot dog")) return "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=200&q=80";
    if (nombreMin.includes("pizza")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80";
    if (nombreMin.includes("donut")) return "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&q=80";

    // Snacks
    if (nombreMin.includes("papas") || nombreMin.includes("lays") || nombreMin.includes("doritos") || nombreMin.includes("pringles")) {
        return "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&q=80";
    }
    if (nombreMin.includes("chocolate") || nombreMin.includes("sublime")) return "https://images.unsplash.com/photo-1582176647440-3b137b3156e3?w=200&q=80";
    if (nombreMin.includes("galleta") || nombreMin.includes("oreo")) return "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80";

    // Abarrotes
    if (nombreMin.includes("arroz") || nombreMin.includes("aceite") || nombreMin.includes("fideos")) return "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80";
    if (nombreMin.includes("café")) return "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&q=80";

    // Imágenes genéricas según categoría
    switch (categoria) {
        case "Bebidas": return "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=200&q=80";
        case "Snacks": return "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&q=80";
        case "Comida Rápida": return "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&q=80";
        case "Abarrotes": return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80";
        default: return "https://via.placeholder.com/120";
    }
}

// ==========================================
// 2. CARGA DE INVENTARIO (12 Productos x Categoría + Packs)
// ==========================================
function cargarInventarioInicial() {
    const listaRaw = [
        // --- BEBIDAS (12) ---
        ["P001", "Inca Kola 1.5L", "Bebidas", 7.50, 7.50, 25, 0, false],
        ["P002", "Coca Cola 1.5L", "Bebidas", 7.80, 7.80, 20, 0, false],
        ["P003", "Pack (2 Coca Cola Sin Azúcar Lata 350ml)", "Bebidas", 14.99, 10.90, 20, 27, false],
        ["P004", "Pack (2 Sprite Lata 350ml)", "Bebidas", 14.99, 10.90, 18, 27, false],
        ["P005", "Pack 2 Gaseosa Coca Cola 600ml", "Bebidas", 7.38, 6.00, 25, 19, false],
        ["P006", "Pack 2 Gaseosa Coca Cola Zero 600ml", "Bebidas", 7.38, 6.00, 30, 19, false],
        ["P007", "Pack 2 Gaseosa Inca Kola 600ml", "Bebidas", 7.38, 6.00, 22, 19, false],
        ["P008", "Pack 2 Gaseosa Inca Kola Zero 600ml", "Bebidas", 7.38, 6.00, 20, 19, false],
        ["P009", "Pack (1 Hey Fit Piña Colada 350ml)", "Bebidas", 5.60, 5.60, 15, 0, false],
        ["P010", "Sporade Cítrico 500ml", "Bebidas", 3.00, 3.00, 30, 0, false],
        ["P011", "Red Bull 250ml", "Bebidas", 8.50, 8.50, 40, 0, false],
        ["P012", "Cerveza Pilsen Callao 630ml", "Bebidas", 7.00, 7.00, 35, 0, false],

        // --- SNACKS (12) ---
        ["P013", "Papas Lays 160g", "Snacks", 5.20, 5.20, 30, 0, false],
        ["P014", "Doritos Queso 140g", "Snacks", 4.80, 4.80, 15, 0, false],
        ["P015", "Cheetos Queso 120g", "Snacks", 4.20, 4.20, 20, 0, false],
        ["P016", "Cuates Picante 80g", "Snacks", 2.00, 2.00, 45, 0, false],
        ["P017", "Cheese Tris 150g", "Snacks", 4.00, 4.00, 25, 0, false],
        ["P018", "Pringles Original 124g", "Snacks", 10.50, 10.50, 12, 0, false],
        ["P019", "Galletas Casino Menta", "Snacks", 2.50, 2.50, 40, 0, false],
        ["P020", "Galletas Oreo 126g", "Snacks", 3.20, 3.20, 35, 0, false],
        ["P021", "Chocolate Sublime 30g", "Snacks", 2.20, 2.20, 50, 0, false],
        ["P022", "Chocolate Triángulo 30g", "Snacks", 2.20, 2.20, 48, 0, false],
        ["P023", "Chocman 33g", "Snacks", 1.80, 1.80, 60, 0, false],
        ["P024", "Maní Moto Salado 90g", "Snacks", 3.00, 3.00, 30, 0, false],

        // --- COMIDA RÁPIDA (12) ---
        ["P025", "Hamburguesa Prime Chicken", "Comida Rápida", 12.90, 12.90, 15, 0, true],
        ["P026", "Hamburguesa Prime de Res", "Comida Rápida", 13.90, 13.90, 15, 0, true],
        ["P027", "Hamburguesa Prime Black Brangus", "Comida Rápida", 12.90, 12.90, 10, 0, true],
        ["P028", "Pack (1 Coca Cola 1L + 2 Hamburguesas Doble)", "Comida Rápida", 19.00, 15.90, 12, 16, false],
        ["P029", "Pack (2 Hamburguesas a lo Pobre + 1 Coca Cola 1L)", "Comida Rápida", 21.49, 14.90, 10, 31, false],
        ["P030", "Empanada de Carne", "Comida Rápida", 4.50, 4.50, 10, 0, false],
        ["P031", "Sandwich de Pollo", "Comida Rápida", 5.50, 5.50, 12, 0, false],
        ["P032", "Hot Dog Tambo Clásico", "Comida Rápida", 6.00, 6.00, 20, 0, false],
        ["P033", "Hot Dog Tambo Gigante", "Comida Rápida", 8.50, 8.50, 15, 0, false],
        ["P034", "Pizza Personal Pepperoni", "Comida Rápida", 9.90, 9.90, 8, 0, false],
        ["P035", "Papa Rellena", "Comida Rápida", 5.00, 5.00, 10, 0, false],
        ["P036", "Donut Glaseada", "Comida Rápida", 3.50, 3.50, 25, 0, false],

        // --- ABARROTES (12) ---
        ["P037", "Arroz Costeño 1kg", "Abarrotes", 4.90, 4.90, 40, 0, false],
        ["P038", "Aceite Primor 1L", "Abarrotes", 9.50, 9.50, 18, 0, false],
        ["P039", "Atún Florida Trozos 140g", "Abarrotes", 6.20, 6.20, 25, 0, false],
        ["P040", "Fideos Don Vittorio 500g", "Abarrotes", 3.20, 3.20, 50, 0, false],
        ["P041", "Leche Gloria Azul 395g", "Abarrotes", 4.20, 4.20, 60, 0, false],
        ["P042", "Sugar Blond Azúcar 1kg", "Abarrotes", 4.50, 4.50, 35, 0, false],
        ["P043", "Avena 3 Ositos 400g", "Abarrotes", 3.80, 3.80, 28, 0, false],
        ["P044", "Café Nescafé Tradición 50g", "Abarrotes", 7.50, 7.50, 22, 0, false],
        ["P045", "Mayonesa Alacena 200g", "Abarrotes", 4.80, 4.80, 30, 0, false],
        ["P046", "Ketchup Alacena 200g", "Abarrotes", 3.90, 3.90, 30, 0, false],
        ["P047", "Salsa de Tomate Pomarola", "Abarrotes", 2.80, 2.80, 40, 0, false],
        ["P048", "Sal Marina Lobos 1kg", "Abarrotes", 2.00, 2.00, 50, 0, false]
    ];

    listaRaw.forEach(item => {
        const [id, nombre, categoria, pReg, pOf, stock, desc, prime] = item;
        const imgUrl = obtenerImagenProducto(nombre, categoria);
        const prod = new Producto(id, nombre, categoria, pReg, pOf, stock, desc, prime, imgUrl);
        inventarioMap.set(prod.id, prod);
    });
}

// ==========================================
// 3. RENDERIZADO DEL CATÁLOGO
// ==========================================
function renderizarCatalogo(productos) {
    const contenedor = document.getElementById("gridProductos");
    if (!contenedor) return;
    
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        const itemEnCarrito = carrito.find(i => i.id === prod.id);
        const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
        const tieneDescuento = prod.porcentajeDescuento > 0;

        contenedor.innerHTML += `
            <div class="card-producto">
                <div class="card-badges">
                    ${prod.esPrime ? `<span class="badge-prime">PRIME</span>` : ''}
                    ${tieneDescuento ? `<span class="badge-descuento">-${prod.porcentajeDescuento}%</span>` : ''}
                </div>
                
                <div class="card-img-container">
                    <img src="${prod.imagenUrl}" alt="${prod.nombre}" />
                </div>

                <h3 class="card-titulo" title="${prod.nombre}">${prod.nombre}</h3>

                <div class="card-footer">
                    <div class="precios-container">
                        <span class="precio-actual">S/ ${prod.precioOferta.toFixed(2)}</span>
                        ${tieneDescuento ? `<span class="precio-anterior">S/ ${prod.precioRegular.toFixed(2)}</span>` : ''}
                    </div>

                    <div class="accion-container">
                        ${cantidadEnCarrito === 0 ? `
                            <button class="btn-add-tambo" onclick="agregarAlCarrito('${prod.id}')">+</button>
                        ` : `
                            <div class="counter-tambo">
                                <button onclick="cambiarCantidad('${prod.id}', -1)">🗑️</button>
                                <span>${cantidadEnCarrito}</span>
                                <button onclick="cambiarCantidad('${prod.id}', 1)">+</button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    });
}

function filtrarPorCategoria() {
    const catSelec = document.getElementById("selectCategoria").value;
    const items = Array.from(inventarioMap.values());
    
    if (catSelec === "TODAS") {
        renderizarCatalogo(items);
    } else {
        const filtrados = items.filter(p => p.categoria === catSelec);
        renderizarCatalogo(filtrados);
    }
}

// ==========================================
// 4. LÓGICA DEL CARRITO Y CONTADORES
// ==========================================
function agregarAlCarrito(id) {
    const prod = inventarioMap.get(id);
    if (!prod) return;

    const itemExistente = carrito.find(i => i.id === id);

    if (itemExistente) {
        if (itemExistente.cantidad + 1 > prod.stock) {
            alert("No hay más stock disponible de este producto.");
            return;
        }
        itemExistente.cantidad++;
    } else {
        if (prod.stock < 1) {
            alert("Producto agotado.");
            return;
        }
        carrito.push({
            id: prod.id,
            nombre: prod.nombre,
            categoria: prod.categoria,
            precioRegular: prod.precioRegular,
            precioOferta: prod.precioOferta,
            cantidad: 1
        });
    }

    actualizarInterfaz();
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;

    const prodOriginal = inventarioMap.get(id);

    if (item.cantidad + cambio <= 0) {
        eliminarDelCarrito(id);
    } else if (item.cantidad + cambio > prodOriginal.stock) {
        alert("Supera el stock máximo disponible.");
    } else {
        item.cantidad += cambio;
        actualizarInterfaz();
    }
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(i => i.id !== id);
    actualizarInterfaz();
}

function actualizarInterfaz() {
    filtrarPorCategoria();
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const contenedorItems = document.getElementById("tblCarritoBody");
    if (!contenedorItems) return;
    
    contenedorItems.innerHTML = "";

    const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const lblCantidad = document.getElementById("lblCantidadCarrito");
    if (lblCantidad) lblCantidad.innerText = `(${totalUnidades})`;

    carrito.forEach(item => {
        const tieneOferta = item.precioRegular > item.precioOferta;

        contenedorItems.innerHTML += `
            <div class="carrito-item">
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    <div class="precios-box">
                        <span class="precio-oferta">S/ ${item.precioOferta.toFixed(2)}</span>
                        ${tieneOferta ? `<span class="precio-tachado">S/ ${item.precioRegular.toFixed(2)}</span>` : ''}
                    </div>
                </div>
                <div class="item-controles">
                    <div class="counter-btn">
                        <button onclick="cambiarCantidad('${item.id}', -1)">🗑️</button>
                        <span>${item.cantidad}</span>
                        <button onclick="cambiarCantidad('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
        `;
    });

    calcularTotales();
}

// ==========================================
// 5. CÁLCULOS FINANCIEROS Y PROCESAMIENTO
// ==========================================
function calcularTotales() {
    const totalProductos = carrito.reduce((sum, item) => sum + (item.precioRegular * item.cantidad), 0);
    const totalRealOfertas = carrito.reduce((sum, item) => sum + (item.precioOferta * item.cantidad), 0);

    let descuentoTotal = totalProductos - totalRealOfertas;

    let flagPromociones = FLAG_SIN_PROMO;
    const tieneBebida = carrito.some(i => i.categoria === "Bebidas");
    
    if (tieneBebida) flagPromociones = flagPromociones | FLAG_COMBO_BEBIDA;
    if (totalRealOfertas > 50.00) flagPromociones = flagPromociones | FLAG_MONTO_SUPERIOR;

    if ((flagPromociones & FLAG_COMBO_BEBIDA) !== 0) {
        descuentoTotal += 1.00; // Descuento adicional por bebidas
    }

    const subtotalFinal = Math.max(0, totalProductos - descuentoTotal);
    const igvCalculado = Math.round((subtotalFinal * IGV_RATE) * 100) / 100;

    const lblTotal = document.getElementById("lblTotalProductos");
    const lblDesc = document.getElementById("lblDescuentoTotal");
    const lblSub = document.getElementById("lblSubtotalFinal");

    if (lblTotal) lblTotal.innerText = `S/ ${totalProductos.toFixed(2)}`;
    if (lblDesc) lblDesc.innerText = `- S/ ${descuentoTotal.toFixed(2)}`;
    if (lblSub) lblSub.innerText = `S/ ${subtotalFinal.toFixed(2)}`;

    return { totalProductos, descuentoTotal, subtotalFinal, igvCalculado };
}

function procesarPago() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const txtDni = document.getElementById("txtDni");
    const docCliente = txtDni ? txtDni.value.trim() : "ANÓNIMO";
    
    const { totalProductos, descuentoTotal, subtotalFinal, igvCalculado } = calcularTotales();

    // Descontar stock del inventario
    carrito.forEach(item => {
        const prod = inventarioMap.get(item.id);
        if (prod) prod.descontarStock(item.cantidad);
    });

    const ticket = `
========================================
           TAMBO - TICKET DE VENTA      
========================================
Cliente Doc: ${docCliente || "00000000"}
Fecha: ${new Date().toLocaleString()}
----------------------------------------
${carrito.map(i => `${i.cantidad}x ${i.nombre.slice(0, 22)}... S/ ${(i.precioOferta * i.cantidad).toFixed(2)}`).join('\n')}
----------------------------------------
Total Productos:  S/ ${totalProductos.toFixed(2)}
Descuentos:      -S/ ${descuentoTotal.toFixed(2)}
----------------------------------------
SUBTOTAL (INC IGV): S/ ${subtotalFinal.toFixed(2)}
IGV (18% Incluido): S/ ${igvCalculado.toFixed(2)}
========================================
        ¡Gracias por tu compra!
`;

    const salidaTicket = document.getElementById("salidaTicket");
    if (salidaTicket) salidaTicket.innerText = ticket;

    // Vaciar carrito tras la venta exitosa
    carrito = [];
    actualizarInterfaz();
}

function exportarEImprimirJSON() {
    // 1. Convertimos el Map de inventario a un Array para poder serializarlo
    const inventarioArray = Array.from(inventarioMap.values());

    // 2. Creamos la estructura de datos
    const reporteEstructurado = {
        fechaExportacion: new Date().toISOString(),
        resumenCarrito: {
            totalItems: carrito.reduce((acc, item) => acc + item.cantidad, 0),
            items: carrito
        },
        inventarioCompleto: inventarioArray
    };

    // 3. Convertimos el objeto a una cadena JSON formateada (con sangría de 2 espacios)
    const jsonString = JSON.stringify(reporteEstructurado, null, 2);

    // 4. Imprimimos en la consola del navegador (F12)
    console.clear();
    console.log("%c=== DATOS EN FORMATO JSON ===", "color: #00ff00; font-weight: bold; font-size: 14px;");
    console.log(jsonString);

    return jsonString;
}

// ==========================================
// 6. INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    cargarInventarioInicial();
    filtrarPorCategoria();
});