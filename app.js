class Producto {

    constructor(
        id,
        nombre,
        categoria,
        precioRegular,
        precioOferta,
        stock,
        porcentajeDescuento = 0,
        esPrime = false,
        imagenUrl = ""
    ) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precioRegular = Number(precioRegular);
        this.precioOferta = Number(precioOferta);
        this.stock = Number(stock);
        this.porcentajeDescuento = porcentajeDescuento;
        this.esPrime = esPrime;
        this.imagenUrl = imagenUrl || "assets/img/default.jpg";
    }

    descontarStock(cantidad) {

        if (cantidad <= this.stock) {
            this.stock -= cantidad;
            return true;
        }

        return false;
    }
}


const IGV_RATE = 0.18;

const FLAG_SIN_PROMO = 0;
const FLAG_COMBO_BEBIDA = 1;
const FLAG_MONTO_SUPERIOR = 2;

const UMBRAL_STOCK_BAJO = 15;

const ADMIN_PIN = "1234";

const CATEGORIAS = ["Bebidas", "Snacks", "Comida Rápida", "Abarrotes"];

const inventarioMap = new Map();

let carrito = [];

// Guarda SOLAMENTE la última venta
let ultimoVentaJSON = null;

// Historial completo de ventas (para el dashboard de administrador)
let historialVentas = [];

// Correlativos de comprobantes
let correlativoBoleta = 1;
let correlativoFactura = 1;

// Estado de la caja de cupones (solo visibilidad del formulario)
let cuponActivo = false;

// Cupones de descuento válidos: código -> monto en soles
const CUPONES_VALIDOS = {
    "18892": 5.00,
    "18893": 10.00,
    "18894": 15.00
};

// Cupón realmente aplicado a la venta (solo 1 activo por venta)
let cuponCodigoAplicado = null;
let cuponMontoDescuento = 0;

// Estado del Dashboard Administrador
let tabAdminActual = "resumen";
let paginaInventarioActual = 1;
const PRODUCTOS_POR_PAGINA = 8;
let ventaEnModal = null;


function obtenerImagenProducto(id, categoria) {

    return `assets/img/productos/${id}.jpg`;

}



function cargarInventarioInicial() {

    const listaRaw = [

        // --- BEBIDAS ---
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

        // --- SNACKS ---
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

        // --- COMIDA RÁPIDA ---
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

        // --- ABARROTES ---
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

        const [
            id,
            nombre,
            categoria,
            pReg,
            pOf,
            stock,
            desc,
            prime
        ] = item;

        const imgUrl = obtenerImagenProducto(id, categoria);

        const prod = new Producto(
            id,
            nombre,
            categoria,
            pReg,
            pOf,
            stock,
            desc,
            prime,
            imgUrl
        );

        inventarioMap.set(prod.id, prod);
    });
}


/* ==========================================
   INDICADORES DE STOCK
   ========================================== */

function obtenerEstadoStock(stock) {

    if (stock === 0) {

        return {
            clase: "stock-agotado",
            etiqueta: "Agotado"
        };
    }

    if (stock < UMBRAL_STOCK_BAJO) {

        return {
            clase: "stock-bajo",
            etiqueta: `Stock Bajo - Alerta (${stock})`
        };
    }

    return {
        clase: "stock-alto",
        etiqueta: `Stock Alto (${stock})`
    };
}


function renderizarCatalogo(productos) {

    const contenedor = document.getElementById("gridProductos");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    productos.forEach(prod => {

        const itemEnCarrito = carrito.find(i => i.id === prod.id);

        const cantidadEnCarrito =
            itemEnCarrito ? itemEnCarrito.cantidad : 0;

        const tieneDescuento =
            prod.porcentajeDescuento > 0;

        const estadoStock =
            obtenerEstadoStock(prod.stock);

        contenedor.innerHTML += `

            <div class="card-producto ${estadoStock.clase}">

                <div class="card-badges">

                    ${prod.esPrime
                        ? `<span class="badge-prime">PRIME</span>`
                        : ""}

                    ${tieneDescuento
                        ? `<span class="badge-descuento">
                            -${prod.porcentajeDescuento}%
                           </span>`
                        : ""}

                </div>

                <span class="badge-stock ${estadoStock.clase}">
                    ${estadoStock.etiqueta}
                </span>

                <div class="card-img-container">

                    <img
                        src="${prod.imagenUrl}"
                        alt="${prod.nombre}"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='assets/img/default.jpg';"
                    />

                </div>

                <h3
                    class="card-titulo"
                    title="${prod.nombre}"
                >
                    ${prod.nombre}
                </h3>

                <div class="card-footer">

                    <div class="precios-container">

                        <span class="precio-actual">
                            S/ ${prod.precioOferta.toFixed(2)}
                        </span>

                        ${
                            tieneDescuento
                                ? `<span class="precio-anterior">
                                    S/ ${prod.precioRegular.toFixed(2)}
                                   </span>`
                                : ""
                        }

                    </div>

                    <div class="accion-container">

                        ${
                            prod.stock === 0

                                ? `<span class="etiqueta-agotado">Agotado</span>`

                                : (
                                    cantidadEnCarrito === 0

                                        ? `
                                            <button
                                                class="btn-add-tambo"
                                                onclick="agregarAlCarrito('${prod.id}')"
                                            >
                                                +
                                            </button>
                                          `

                                        : `
                                            <div class="counter-tambo">

                                                <button
                                                    onclick="cambiarCantidad('${prod.id}', -1)"
                                                >
                                                    🗑️
                                                </button>

                                                <span>
                                                    ${cantidadEnCarrito}
                                                </span>

                                                <button
                                                    onclick="cambiarCantidad('${prod.id}', 1)"
                                                >
                                                    +
                                                </button>

                                            </div>
                                          `
                                )
                        }

                    </div>

                </div>

            </div>
        `;
    });
}


function filtrarPorCategoria() {

    const catSelec =
        document.getElementById("selectCategoria").value;

    const items =
        Array.from(inventarioMap.values());

    if (catSelec === "TODAS") {

        renderizarCatalogo(items);

    } else {

        const filtrados =
            items.filter(p => p.categoria === catSelec);

        renderizarCatalogo(filtrados);
    }
}

function agregarAlCarrito(id) {

    const prod = inventarioMap.get(id);

    if (!prod) return;

    if (prod.stock === 0) {

        alert("Producto agotado.");

        return;
    }

    const itemExistente =
        carrito.find(i => i.id === id);

    if (itemExistente) {

        if (itemExistente.cantidad + 1 > prod.stock) {

            alert(
                "No hay más stock disponible de este producto."
            );

            return;
        }

        itemExistente.cantidad++;

    } else {

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

    const item =
        carrito.find(i => i.id === id);

    if (!item) return;

    const prodOriginal =
        inventarioMap.get(id);

    if (item.cantidad + cambio <= 0) {

        eliminarDelCarrito(id);

    } else if (
        item.cantidad + cambio >
        prodOriginal.stock
    ) {

        alert(
            "Supera el stock máximo disponible."
        );

    } else {

        item.cantidad += cambio;

        actualizarInterfaz();
    }
}


function eliminarDelCarrito(id) {

    carrito =
        carrito.filter(i => i.id !== id);

    actualizarInterfaz();
}


function actualizarInterfaz() {

    filtrarPorCategoria();

    actualizarCarritoUI();
}

function actualizarCarritoUI() {

    const contenedorItems =
        document.getElementById("tblCarritoBody");

    if (!contenedorItems) return;

    contenedorItems.innerHTML = "";

    const totalUnidades =
        carrito.reduce(
            (acc, item) => acc + item.cantidad,
            0
        );

    const lblCantidad =
        document.getElementById("lblCantidadCarrito");

    if (lblCantidad) {

        lblCantidad.innerText =
            `(${totalUnidades})`;
    }


    carrito.forEach(item => {

        const tieneOferta =
            item.precioRegular >
            item.precioOferta;

        contenedorItems.innerHTML += `

            <div class="carrito-item">

                <div class="item-info">

                    <h4>
                        ${item.nombre}
                    </h4>

                    <div class="precios-box">

                        <span class="precio-oferta">
                            S/ ${item.precioOferta.toFixed(2)}
                        </span>

                        ${
                            tieneOferta
                                ? `<span class="precio-tachado">
                                    S/ ${item.precioRegular.toFixed(2)}
                                   </span>`
                                : ""
                        }

                    </div>

                </div>

                <div class="item-controles">

                    <div class="counter-btn">

                        <button
                            onclick="cambiarCantidad('${item.id}', -1)"
                        >
                            🗑️
                        </button>

                        <span>
                            ${item.cantidad}
                        </span>

                        <button
                            onclick="cambiarCantidad('${item.id}', 1)"
                        >
                            +
                        </button>

                    </div>

                </div>

            </div>
        `;
    });

    calcularTotales();
}

/* ==========================================
   COMPROBANTE: BOLETA / FACTURA
   ========================================== */

const configuracionDocumentos = {

    DNI: {
        max: 8,
        placeholder: "Ej: 72839401",
        mensaje: "Ingrese 8 dígitos (opcional)."
    },

    CE: {
        max: 9,
        placeholder: "Ej: 001234567",
        mensaje: "Ingrese 9 dígitos (opcional)."
    }

};


function obtenerTipoComprobante() {

    return document.getElementById("selectTipoComprobante").value;
}


function actualizarTipoComprobante() {

    const tipo = obtenerTipoComprobante();

    const camposBoleta =
        document.getElementById("camposBoleta");

    const camposFactura =
        document.getElementById("camposFactura");

    if (tipo === "FACTURA") {

        camposBoleta.classList.add("oculto");
        camposFactura.classList.remove("oculto");

    } else {

        camposFactura.classList.add("oculto");
        camposBoleta.classList.remove("oculto");
    }
}


function actualizarDocumento() {

    const tipo =
        document.getElementById("selectTipoDoc").value;

    const input =
        document.getElementById("txtDni");

    const mensaje =
        document.getElementById("mensajeDocumento");

    if (tipo === "SIN_DOC") {

        input.value = "";
        input.disabled = true;
        input.placeholder = "No requerido";

        mensaje.innerText =
            "Venta sin documento (Cliente Varios).";

        return;
    }

    input.disabled = false;

    const config =
        configuracionDocumentos[tipo];

    input.value =
        input.value
            .replace(/\D/g, "")
            .slice(0, config.max);

    input.maxLength = config.max;

    input.placeholder =
        config.placeholder;

    mensaje.innerText =
        config.mensaje;
}


// Solo permite números en el RUC (11 dígitos)
function validarEntradaRuc() {

    const input =
        document.getElementById("txtRuc");

    input.value =
        input.value
            .replace(/\D/g, "")
            .slice(0, 11);
}


function validarComprobante() {

    const tipoComprobante =
        obtenerTipoComprobante();

    if (tipoComprobante === "FACTURA") {

        const ruc =
            document.getElementById("txtRuc").value.trim();

        const razonSocial =
            document.getElementById("txtRazonSocial").value.trim();

        if (!/^\d{11}$/.test(ruc)) {

            alert(
                "El RUC debe contener exactamente 11 dígitos numéricos."
            );

            document.getElementById("txtRuc").focus();

            return false;
        }

        if (!razonSocial) {

            alert(
                "Ingrese la Razón Social del cliente."
            );

            document.getElementById("txtRazonSocial").focus();

            return false;
        }

        return true;
    }

    // BOLETA: el documento es opcional (Cliente Varios)
    const tipoDoc =
        document.getElementById("selectTipoDoc").value;

    if (tipoDoc === "SIN_DOC") {

        return true;
    }

    const input =
        document.getElementById("txtDni");

    const documento =
        input.value.trim();

    const config =
        configuracionDocumentos[tipoDoc];

    if (!documento) {

        alert(
            `Ingrese el número de ${tipoDoc} o seleccione "Sin documento".`
        );

        input.focus();

        return false;
    }

    if (!/^\d+$/.test(documento)) {

        alert(
            "El documento solo puede contener números."
        );

        input.focus();

        return false;
    }

    if (documento.length !== config.max) {

        alert(
            `${tipoDoc}: debe contener exactamente ${config.max} dígitos.`
        );

        input.focus();

        return false;
    }

    return true;
}

function alternarCupones() {

    const campo =
        document.getElementById("campoCupon");

    const boton =
        document.getElementById("btnCupon");

    const input =
        document.getElementById("txtCupon");

    cuponActivo = !cuponActivo;

    if (cuponActivo) {

        campo.classList.remove("oculto");

        boton.classList.add("cupon-activo");

        input.focus();

    } else {

        campo.classList.add("oculto");

        boton.classList.remove("cupon-activo");

        input.value = "";
    }
}


// Solo permite números en el cupón
function validarEntradaCupon() {

    const input =
        document.getElementById("txtCupon");

    input.value =
        input.value
            .replace(/\D/g, "")
            .slice(0, 12);
}


// Aplica el cupón ingresado. Solo se permite 1 cupón activo por venta,
// y el descuento nunca puede superar el monto total de la venta.
function aplicarCupon() {

    const input =
        document.getElementById("txtCupon");

    const mensaje =
        document.getElementById("mensajeCupon");

    const codigo =
        input.value.trim();

    if (cuponCodigoAplicado) {

        mensaje.textContent =
            "Ya tienes un cupón activo. Quítalo para aplicar otro.";

        mensaje.className = "mensaje-cupon error";

        return;
    }

    if (!codigo) {

        mensaje.textContent =
            "Ingresa un número de cupón.";

        mensaje.className = "mensaje-cupon error";

        return;
    }

    const valorCupon =
        CUPONES_VALIDOS[codigo];

    if (!valorCupon) {

        mensaje.textContent =
            "Cupón inválido o expirado.";

        mensaje.className = "mensaje-cupon error";

        return;
    }

    const { totalProductos, descuentoBase } =
        calcularDescuentosBase();

    const subtotalDisponible =
        Math.max(0, totalProductos - descuentoBase);

    if (subtotalDisponible <= 0) {

        mensaje.textContent =
            "El cupón no puede aplicarse: el total de la venta es S/ 0.00.";

        mensaje.className = "mensaje-cupon error";

        return;
    }

    // El descuento del cupón nunca puede superar el monto total de la venta.
    cuponMontoDescuento =
        Math.min(valorCupon, subtotalDisponible);

    cuponCodigoAplicado = codigo;

    mensaje.textContent =
        `Cupón aplicado: -S/ ${cuponMontoDescuento.toFixed(2)}`;

    mensaje.className = "mensaje-cupon exito";

    input.disabled = true;

    document.getElementById("btnAplicarCupon").classList.add("oculto");
    document.getElementById("btnQuitarCupon").classList.remove("oculto");

    actualizarInterfaz();
}


function quitarCupon() {

    cuponCodigoAplicado = null;
    cuponMontoDescuento = 0;

    const input =
        document.getElementById("txtCupon");

    input.value = "";
    input.disabled = false;

    document.getElementById("mensajeCupon").textContent = "";
    document.getElementById("mensajeCupon").className = "mensaje-cupon";

    document.getElementById("btnAplicarCupon").classList.remove("oculto");
    document.getElementById("btnQuitarCupon").classList.add("oculto");

    actualizarInterfaz();
}


// Calcula el total bruto y los descuentos "de catálogo" (ofertas + combo
// bebida), sin contar aún el cupón. Sirve tanto para calcularTotales()
// como para poder acotar el monto máximo que puede descontar un cupón.
function calcularDescuentosBase() {

    const totalProductos =
        carrito.reduce(
            (sum, item) =>
                sum +
                (item.precioRegular * item.cantidad),
            0
        );

    const totalRealOfertas =
        carrito.reduce(
            (sum, item) =>
                sum +
                (item.precioOferta * item.cantidad),
            0
        );

    let descuentoBase =
        totalProductos -
        totalRealOfertas;


    let flagPromociones =
        FLAG_SIN_PROMO;

    const tieneBebida =
        carrito.some(
            i => i.categoria === "Bebidas"
        );


    if (tieneBebida) {

        flagPromociones =
            flagPromociones |
            FLAG_COMBO_BEBIDA;
    }


    if (totalRealOfertas > 50) {

        flagPromociones =
            flagPromociones |
            FLAG_MONTO_SUPERIOR;
    }


    if (
        (flagPromociones &
            FLAG_COMBO_BEBIDA) !== 0
    ) {

        descuentoBase += 1.00;
    }

    return { totalProductos, descuentoBase };
}


function calcularTotales() {

    const { totalProductos, descuentoBase } =
        calcularDescuentosBase();

    const descuentoTotal =
        descuentoBase +
        cuponMontoDescuento;

    const subtotalFinal =
        Math.max(
            0,
            totalProductos -
            descuentoTotal
        );


    const igvCalculado =
        Math.round(
            (subtotalFinal * IGV_RATE) * 100
        ) / 100;


    const lblTotal =
        document.getElementById(
            "lblTotalProductos"
        );

    const lblDesc =
        document.getElementById(
            "lblDescuentoTotal"
        );

    const lblSub =
        document.getElementById(
            "lblSubtotalFinal"
        );


    if (lblTotal) {

        lblTotal.innerText =
            `S/ ${totalProductos.toFixed(2)}`;
    }


    if (lblDesc) {

        lblDesc.innerText =
            `- S/ ${descuentoTotal.toFixed(2)}`;
    }


    if (lblSub) {

        lblSub.innerText =
            `S/ ${subtotalFinal.toFixed(2)}`;
    }


    return {
        totalProductos,
        descuentoTotal,
        subtotalFinal,
        igvCalculado
    };
}

/* ==========================================
   TICKET ESTILO IMPRESORA TÉRMICA
   ========================================== */

function generarTicketHTML(venta) {

    const itemsHtml = venta.itemsComprados.map(i => `
        <div class="ticket-item-row">
            <span>${i.cantidad} x ${i.producto}</span>
            <span>S/ ${i.subtotalItem.toFixed(2)}</span>
        </div>
        <div class="ticket-item-detalle">
            P. Unit: S/ ${i.precioUnitario.toFixed(2)}
        </div>
    `).join("");

    const clienteHtml =
        venta.comprobante === "FACTURA"
            ? `
                <div class="ticket-linea">
                    <span>RUC:</span>
                    <span>${venta.cliente.ruc}</span>
                </div>
                <div class="ticket-linea">
                    <span>Razón Social:</span>
                    <span>${venta.cliente.razonSocial}</span>
                </div>
              `
            : `
                <div class="ticket-linea">
                    <span>Cliente:</span>
                    <span>${
                        venta.cliente.numeroDocumento
                            ? `${venta.cliente.tipoDocumento}: ${venta.cliente.numeroDocumento}`
                            : "Cliente Varios"
                    }</span>
                </div>
              `;

    return `
        <div class="ticket-papel">

            <div class="ticket-header">
                <div class="ticket-logo">TAMBO</div>
                <div class="ticket-subtitulo">Tienda de Conveniencia</div>
                <div class="ticket-tipo-comprobante">
                    ${
                        venta.comprobante === "FACTURA"
                            ? "FACTURA ELECTRÓNICA"
                            : "BOLETA DE VENTA ELECTRÓNICA"
                    }
                </div>
                <div class="ticket-numero">N° ${venta.numeroComprobante}</div>
            </div>

            <div class="ticket-divider"></div>

            <div class="ticket-info">
                <div class="ticket-linea">
                    <span>Fecha:</span>
                    <span>${venta.fecha}</span>
                </div>
                ${clienteHtml}
            </div>

            <div class="ticket-divider"></div>

            <div class="ticket-items">
                ${itemsHtml}
            </div>

            <div class="ticket-divider"></div>

            <div class="ticket-totales">

                <div class="ticket-linea">
                    <span>Total Productos:</span>
                    <span>S/ ${venta.totales.totalProductos.toFixed(2)}</span>
                </div>

                <div class="ticket-linea">
                    <span>Descuentos:</span>
                    <span>-S/ ${venta.totales.descuentoAplicado.toFixed(2)}</span>
                </div>

                <div class="ticket-linea ticket-subtotal">
                    <span>SUBTOTAL:</span>
                    <span>S/ ${venta.totales.subtotalIncIgv.toFixed(2)}</span>
                </div>

                <div class="ticket-linea">
                    <span>IGV (18%):</span>
                    <span>S/ ${venta.totales.igvIncluido.toFixed(2)}</span>
                </div>

                <div class="ticket-linea">
                    <span>Cupón:</span>
                    <span>${
                        venta.cupon.aplicado
                            ? `${venta.cupon.numero} (-S/ ${venta.cupon.monto.toFixed(2)})`
                            : "No utilizado"
                    }</span>
                </div>

            </div>

            <div class="ticket-divider"></div>

            <div class="ticket-footer">
                <p>¡Gracias por tu compra!</p>
                <p class="ticket-footer-small">Vuelve pronto a TAMBO</p>
            </div>

        </div>
    `;
}


function imprimirTicket() {

    if (!ultimoVentaJSON) {

        alert(
            "Aún no has generado ninguna venta. Procesa una compra primero."
        );

        return;
    }

    window.print();
}


function procesarPago() {

    if (carrito.length === 0) {

        alert("El carrito está vacío.");

        return;
    }


    // Validar comprobante (Boleta u opcional / Factura obligatorio)
    if (!validarComprobante()) {

        return;
    }


    // Validar cupón: si el usuario escribió un código pero nunca presionó
    // "Aplicar", se le pide que lo confirme o lo borre antes de continuar.
    const txtCupon =
        document.getElementById("txtCupon");

    const codigoCupon =
        txtCupon
            ? txtCupon.value.trim()
            : "";


    if (cuponActivo && codigoCupon && !cuponCodigoAplicado) {

        alert(
            'Presiona "Aplicar" para validar el cupón, o borra el código ingresado.'
        );

        txtCupon.focus();

        return;
    }


    const tipoComprobante =
        obtenerTipoComprobante();

    let clienteInfo = {};
    let numeroComprobante = "";

    if (tipoComprobante === "FACTURA") {

        const ruc =
            document.getElementById("txtRuc").value.trim();

        const razonSocial =
            document.getElementById("txtRazonSocial").value.trim();

        clienteInfo = {
            ruc: ruc,
            razonSocial: razonSocial
        };

        numeroComprobante =
            `F001-${String(correlativoFactura).padStart(6, "0")}`;

        correlativoFactura++;

    } else {

        const tipoDoc =
            document.getElementById("selectTipoDoc").value;

        const docCliente =
            tipoDoc === "SIN_DOC"
                ? ""
                : document.getElementById("txtDni").value.trim();

        clienteInfo = {
            tipoDocumento:
                tipoDoc === "SIN_DOC" ? null : tipoDoc,
            numeroDocumento:
                docCliente || null
        };

        numeroComprobante =
            `B001-${String(correlativoBoleta).padStart(6, "0")}`;

        correlativoBoleta++;
    }


    const fechaObjOperacion =
        new Date();

    const fechaOperacion =
        fechaObjOperacion.toLocaleString();


    const {
        totalProductos,
        descuentoTotal,
        subtotalFinal,
        igvCalculado
    } = calcularTotales();


    const ventaActual = {

        empresa: "TAMBO POS",

        comprobante: tipoComprobante,

        numeroComprobante: numeroComprobante,

        cliente: clienteInfo,

        fecha: fechaOperacion,

        fechaObj: fechaObjOperacion,

        cupon: {

            aplicado: !!cuponCodigoAplicado,

            numero: cuponCodigoAplicado,

            monto: cuponMontoDescuento
        },

        itemsComprados:

            carrito.map(i => ({

                id: i.id,

                producto: i.nombre,

                categoria: i.categoria,

                cantidad: i.cantidad,

                precioUnitario:
                    i.precioOferta,

                subtotalItem:
                    Number(
                        (
                            i.precioOferta *
                            i.cantidad
                        ).toFixed(2)
                    )

            })),

        totales: {

            totalProductos:
                Number(
                    totalProductos.toFixed(2)
                ),

            descuentoAplicado:
                Number(
                    descuentoTotal.toFixed(2)
                ),

            subtotalIncIgv:
                Number(
                    subtotalFinal.toFixed(2)
                ),

            igvIncluido:
                Number(
                    igvCalculado.toFixed(2)
                )
        }
    };

    ultimoVentaJSON = ventaActual;
    historialVentas.push(ventaActual);

    // Descontar stock del inventario automáticamente
    carrito.forEach(item => {

        const prod =
            inventarioMap.get(item.id);

        if (prod) {

            prod.descontarStock(
                item.cantidad
            );
        }
    });

    const salidaTicket =
        document.getElementById(
            "salidaTicket"
        );


    if (salidaTicket) {

        salidaTicket.innerHTML =
            generarTicketHTML(ventaActual);
    }


    // Vaciar carrito
    carrito = [];


    // Reiniciar cupón (código aplicado, monto y visibilidad de la caja)
    quitarCupon();

    cuponActivo = false;

    document
        .getElementById("campoCupon")
        .classList.add("oculto");

    document
        .getElementById("btnCupon")
        .classList.remove("cupon-activo");


    // Reiniciar campos de Factura
    if (tipoComprobante === "FACTURA") {

        document.getElementById("txtRuc").value = "";
        document.getElementById("txtRazonSocial").value = "";
    }


    actualizarInterfaz();
    actualizarDashboardAdmin();
}

function exportarEImprimirJSON() {

    if (!ultimoVentaJSON) {

        alert(
            "Aún no has generado ninguna venta. Procesa una compra primero."
        );

        return;
    }


    const jsonString =
        JSON.stringify(
            ultimoVentaJSON,
            null,
            2
        );


    console.clear();

    console.log(
        "=== JSON DE LA ÚLTIMA VENTA ==="
    );

    console.log(jsonString);


    return jsonString;
}


/* ==========================================
   SISTEMA DE ROLES: CAJERO / ADMINISTRADOR
   ========================================== */

function mostrarVista(vista) {

    const selector =
        document.getElementById("vistaSelectorRol");

    const cajero =
        document.getElementById("vistaCajero");

    const admin =
        document.getElementById("vistaAdmin");

    const indicador =
        document.getElementById("rolActivoIndicador");

    const lblRol =
        document.getElementById("lblRolActivo");

    const atajos =
        document.getElementById("atajosMoviles");

    selector.classList.add("oculto");
    cajero.classList.add("oculto");
    admin.classList.add("oculto");

    if (vista === "cajero") {

        cajero.classList.remove("oculto");
        indicador.classList.remove("oculto");
        lblRol.innerText = "🧑‍💼 Modo Cajero";

        if (atajos) atajos.style.display = "";

    } else if (vista === "admin") {

        admin.classList.remove("oculto");
        indicador.classList.remove("oculto");
        lblRol.innerText = "🔐 Modo Administrador";

        if (atajos) atajos.style.display = "none";

        cambiarTabAdmin("resumen");
        actualizarDashboardAdmin();

    } else {

        selector.classList.remove("oculto");
        indicador.classList.add("oculto");

        const loginBox =
            document.getElementById("loginAdminBox");

        if (loginBox) loginBox.classList.add("oculto");

        if (atajos) atajos.style.display = "none";
    }
}


function entrarComoCajero() {

    mostrarVista("cajero");
}


function mostrarLoginAdmin() {

    document
        .getElementById("loginAdminBox")
        .classList.remove("oculto");

    document
        .getElementById("txtPinAdmin")
        .focus();
}


function entrarComoAdmin() {

    const inputPin =
        document.getElementById("txtPinAdmin");

    const mensaje =
        document.getElementById("mensajePinAdmin");

    const pin = inputPin.value.trim();

    if (pin !== ADMIN_PIN) {

        mensaje.innerText =
            "PIN incorrecto. Inténtalo de nuevo.";

        inputPin.value = "";
        inputPin.focus();

        return;
    }

    mensaje.innerText = "";
    inputPin.value = "";

    mostrarVista("admin");
}


function cerrarSesionRol() {

    mostrarVista("selector");
}


/* ==========================================
   DASHBOARD ADMINISTRADOR: NAVEGACIÓN (SPA)
   ========================================== */

function cambiarTabAdmin(tab) {

    tabAdminActual = tab;

    document
        .querySelectorAll(".admin-tab")
        .forEach(seccion => seccion.classList.add("oculto"));

    document
        .querySelectorAll(".admin-nav-item")
        .forEach(boton => boton.classList.remove("activo"));

    const seccionActiva =
        document.getElementById(
            `tab${tab.charAt(0).toUpperCase()}${tab.slice(1)}`
        );

    const botonActivo =
        document.querySelector(`.admin-nav-item[data-tab="${tab}"]`);

    if (seccionActiva) seccionActiva.classList.remove("oculto");
    if (botonActivo) botonActivo.classList.add("activo");

    if (tab === "resumen") renderizarResumenAdmin();
    if (tab === "inventario") renderizarInventarioAdmin(1);
    if (tab === "ventas") renderizarVentasAdmin();
}


function actualizarDashboardAdmin() {

    renderizarResumenAdmin();
    renderizarInventarioAdmin(paginaInventarioActual);
    renderizarVentasAdmin();
}


/* ==========================================
   DASHBOARD ADMINISTRADOR: RESUMEN GENERAL
   ========================================== */

function esVentaDeHoy(venta) {

    const hoy = new Date();
    const fecha = venta.fechaObj;

    return (
        fecha.getDate() === hoy.getDate() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getFullYear() === hoy.getFullYear()
    );
}


function renderizarResumenAdmin() {

    const kpiVentasDia =
        document.getElementById("kpiVentasDia");

    if (!kpiVentasDia) return;

    const ventasHoy =
        historialVentas.filter(esVentaDeHoy);

    const totalVentasDia =
        ventasHoy.reduce(
            (sum, v) => sum + v.totales.subtotalIncIgv,
            0
        );

    const igvRecaudado =
        ventasHoy.reduce(
            (sum, v) => sum + v.totales.igvIncluido,
            0
        );

    const ticketPromedio =
        ventasHoy.length > 0
            ? totalVentasDia / ventasHoy.length
            : 0;

    const alertasStockBajo =
        Array.from(inventarioMap.values())
            .filter(p => p.stock < UMBRAL_STOCK_BAJO)
            .length;

    kpiVentasDia.innerText = `S/ ${totalVentasDia.toFixed(2)}`;
    document.getElementById("kpiTicketPromedio").innerText = `S/ ${ticketPromedio.toFixed(2)}`;
    document.getElementById("kpiIgvRecaudado").innerText = `S/ ${igvRecaudado.toFixed(2)}`;
    document.getElementById("kpiStockBajo").innerText = alertasStockBajo;

    renderizarTopProductos();
    renderizarVentasPorCategoria();
}


function renderizarTopProductos() {

    const contenedor =
        document.getElementById("topProductosLista");

    if (!contenedor) return;

    const resumenPorProducto = new Map();

    historialVentas.forEach(venta => {

        venta.itemsComprados.forEach(item => {

            const acumulado =
                resumenPorProducto.get(item.id) ||
                { nombre: item.producto, unidades: 0, ingresos: 0 };

            acumulado.unidades += item.cantidad;
            acumulado.ingresos += item.subtotalItem;

            resumenPorProducto.set(item.id, acumulado);
        });
    });

    const top5 =
        Array.from(resumenPorProducto.values())
            .sort((a, b) => b.unidades - a.unidades)
            .slice(0, 5);

    if (top5.length === 0) {

        contenedor.innerHTML =
            `<p class="sin-datos">Aún no hay ventas registradas.</p>`;

        return;
    }

    contenedor.innerHTML = top5.map((prod, indice) => `

        <div class="top-producto-item">
            <span class="top-producto-rank">#${indice + 1}</span>
            <div class="top-producto-info">
                <strong>${prod.nombre}</strong>
                <span>${prod.unidades} unidades vendidas</span>
            </div>
            <span class="top-producto-ingreso">S/ ${prod.ingresos.toFixed(2)}</span>
        </div>
    `).join("");
}


function renderizarVentasPorCategoria() {

    const contenedor =
        document.getElementById("categoriaChart");

    if (!contenedor) return;

    const coloresPorCategoria = {
        "Bebidas": "#2196f3",
        "Snacks": "#ff9800",
        "Comida Rápida": "#a1006b",
        "Abarrotes": "#4caf50"
    };

    const ingresosPorCategoria = new Map();

    historialVentas.forEach(venta => {

        venta.itemsComprados.forEach(item => {

            const acumulado =
                ingresosPorCategoria.get(item.categoria) || 0;

            ingresosPorCategoria.set(
                item.categoria,
                acumulado + item.subtotalItem
            );
        });
    });

    const filas =
        Array.from(ingresosPorCategoria.entries())
            .sort((a, b) => b[1] - a[1]);

    if (filas.length === 0) {

        contenedor.innerHTML =
            `<p class="sin-datos">Aún no hay ventas registradas.</p>`;

        return;
    }

    const montoMaximo =
        Math.max(...filas.map(([, monto]) => monto));

    contenedor.innerHTML = filas.map(([categoria, monto]) => {

        const porcentaje =
            montoMaximo > 0
                ? Math.round((monto / montoMaximo) * 100)
                : 0;

        const color =
            coloresPorCategoria[categoria] || "#a1006b";

        return `

            <div class="categoria-fila">
                <span class="categoria-nombre">${categoria}</span>
                <div class="categoria-barra-fondo">
                    <div
                        class="categoria-barra"
                        style="width: ${porcentaje}%; background-color: ${color};"
                    ></div>
                </div>
                <span class="categoria-monto">S/ ${monto.toFixed(2)}</span>
            </div>
        `;
    }).join("");
}


/* ==========================================
   DASHBOARD ADMINISTRADOR: INVENTARIO (CRUD)
   ========================================== */

function generarNuevoIdProducto() {

    const ids =
        Array.from(inventarioMap.keys())
            .map(id => parseInt(id.replace(/\D/g, ""), 10))
            .filter(n => !isNaN(n));

    const maxId =
        ids.length ? Math.max(...ids) : 0;

    const nuevoNumero = maxId + 1;

    return `P${String(nuevoNumero).padStart(3, "0")}`;
}


function abrirModalProducto(id = null) {

    const modal =
        document.getElementById("modalProducto");

    const titulo =
        document.getElementById("modalProductoTitulo");

    const form =
        document.getElementById("formProducto");

    form.reset();

    if (id) {

        const prod = inventarioMap.get(id);

        if (!prod) return;

        titulo.innerText = "Editar Producto";

        document.getElementById("prodIdEdicion").value = prod.id;
        document.getElementById("prodNombre").value = prod.nombre;
        document.getElementById("prodCategoria").value = prod.categoria;
        document.getElementById("prodPrecioRegular").value = prod.precioRegular;
        document.getElementById("prodPrecioOferta").value = prod.precioOferta;
        document.getElementById("prodStock").value = prod.stock;
        document.getElementById("prodPrime").checked = prod.esPrime;

    } else {

        titulo.innerText = "Agregar Nuevo Producto";

        document.getElementById("prodIdEdicion").value = "";
    }

    modal.classList.remove("oculto");
}


function cerrarModalProducto() {

    document
        .getElementById("modalProducto")
        .classList.add("oculto");
}


function guardarProducto(event) {

    event.preventDefault();

    const idEdicion =
        document.getElementById("prodIdEdicion").value;

    const nombre =
        document.getElementById("prodNombre").value.trim();

    const categoria =
        document.getElementById("prodCategoria").value;

    const precioRegular =
        parseFloat(document.getElementById("prodPrecioRegular").value);

    let precioOferta =
        parseFloat(document.getElementById("prodPrecioOferta").value);

    const stock =
        parseInt(document.getElementById("prodStock").value, 10);

    const esPrime =
        document.getElementById("prodPrime").checked;

    if (!nombre) {

        alert("Ingrese el nombre del producto.");

        return;
    }

    if (isNaN(precioRegular) || precioRegular <= 0) {

        alert("Ingrese un precio regular válido.");

        return;
    }

    if (isNaN(precioOferta) || precioOferta <= 0) {

        precioOferta = precioRegular;
    }

    if (precioOferta > precioRegular) {

        alert("El precio de oferta no puede ser mayor al precio regular.");

        return;
    }

    if (isNaN(stock) || stock < 0) {

        alert("Ingrese un stock inicial válido (0 o mayor).");

        return;
    }

    let porcentajeDescuento = 0;

    if (precioOferta < precioRegular) {

        porcentajeDescuento =
            Math.round(
                ((precioRegular - precioOferta) / precioRegular) * 100
            );
    }

    if (idEdicion) {

        // ===== EDITAR PRODUCTO EXISTENTE =====
        const prod = inventarioMap.get(idEdicion);

        if (!prod) return;

        prod.nombre = nombre;
        prod.categoria = categoria;
        prod.precioRegular = precioRegular;
        prod.precioOferta = precioOferta;
        prod.stock = stock;
        prod.porcentajeDescuento = porcentajeDescuento;
        prod.esPrime = esPrime;

        alert(`Producto "${nombre}" actualizado correctamente.`);

    } else {

        // ===== CREAR PRODUCTO NUEVO =====
        const nuevoId = generarNuevoIdProducto();
        const imgUrl = obtenerImagenProducto(nuevoId, categoria);

        const nuevoProducto = new Producto(
            nuevoId,
            nombre,
            categoria,
            precioRegular,
            precioOferta,
            stock,
            porcentajeDescuento,
            esPrime,
            imgUrl
        );

        inventarioMap.set(nuevoId, nuevoProducto);

        alert(`Producto "${nombre}" registrado correctamente con ID ${nuevoId}.`);
    }

    cerrarModalProducto();

    actualizarInterfaz();
    renderizarInventarioAdmin(paginaInventarioActual);
    renderizarResumenAdmin();
}


function aumentarStockRapido(id, cantidad = 10) {

    const prod = inventarioMap.get(id);

    if (!prod) return;

    prod.stock += cantidad;

    actualizarInterfaz();
    renderizarInventarioAdmin(paginaInventarioActual);
    renderizarResumenAdmin();
}


function eliminarProducto(id) {

    const prod = inventarioMap.get(id);

    if (!prod) return;

    const confirmar =
        confirm(`¿Seguro que deseas eliminar "${prod.nombre}" del inventario?`);

    if (!confirmar) return;

    inventarioMap.delete(id);
    carrito = carrito.filter(i => i.id !== id);

    actualizarInterfaz();
    renderizarInventarioAdmin(1);
    renderizarResumenAdmin();
}


function renderizarInventarioAdmin(pagina = paginaInventarioActual) {

    const cuerpoTabla =
        document.getElementById("tablaInventarioAdmin");

    const contenedorPaginacion =
        document.getElementById("paginacionInventario");

    if (!cuerpoTabla) return;

    const texto =
        (document.getElementById("buscarProductoAdmin")?.value || "")
            .trim()
            .toLowerCase();

    const categoriaFiltro =
        document.getElementById("filtroCategoriaAdmin")?.value || "TODAS";

    let productos =
        Array.from(inventarioMap.values());

    if (categoriaFiltro !== "TODAS") {

        productos =
            productos.filter(p => p.categoria === categoriaFiltro);
    }

    if (texto) {

        productos =
            productos.filter(p => p.nombre.toLowerCase().includes(texto));
    }

    if (productos.length === 0) {

        cuerpoTabla.innerHTML =
            `<tr><td colspan="6" class="sin-datos">No hay productos que coincidan con la búsqueda.</td></tr>`;

        if (contenedorPaginacion) contenedorPaginacion.innerHTML = "";

        return;
    }

    const totalPaginas =
        Math.max(1, Math.ceil(productos.length / PRODUCTOS_POR_PAGINA));

    paginaInventarioActual =
        Math.min(Math.max(1, pagina), totalPaginas);

    const inicio =
        (paginaInventarioActual - 1) * PRODUCTOS_POR_PAGINA;

    const productosPagina =
        productos.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

    cuerpoTabla.innerHTML = productosPagina.map(prod => {

        const estadoStock =
            obtenerEstadoStock(prod.stock);

        return `

            <tr class="fila-tabla-admin ${estadoStock.clase}">

                <td>${prod.nombre}</td>
                <td>${prod.categoria}</td>
                <td>S/ ${prod.precioRegular.toFixed(2)}</td>
                <td>S/ ${prod.precioOferta.toFixed(2)}</td>
                <td>
                    <span class="badge-stock-admin ${estadoStock.clase}">
                        ${estadoStock.etiqueta}
                    </span>
                </td>
                <td class="celda-acciones">

                    <button
                        class="btn-accion-tabla btn-editar"
                        onclick="abrirModalProducto('${prod.id}')"
                        title="Editar producto"
                    >
                        ✏️
                    </button>

                    <button
                        class="btn-accion-tabla btn-stock-rapido"
                        onclick="aumentarStockRapido('${prod.id}')"
                        title="Aumentar stock +10"
                    >
                        +10
                    </button>

                    <button
                        class="btn-accion-tabla btn-eliminar"
                        onclick="eliminarProducto('${prod.id}')"
                        title="Eliminar producto"
                    >
                        🗑️
                    </button>

                </td>

            </tr>
        `;

    }).join("");

    if (contenedorPaginacion) {

        let botonesHtml = "";

        for (let i = 1; i <= totalPaginas; i++) {

            botonesHtml += `
                <button
                    class="btn-pagina ${i === paginaInventarioActual ? "activo" : ""}"
                    onclick="renderizarInventarioAdmin(${i})"
                >
                    ${i}
                </button>
            `;
        }

        contenedorPaginacion.innerHTML = botonesHtml;
    }
}


/* ==========================================
   DASHBOARD ADMINISTRADOR: HISTORIAL DE VENTAS
   ========================================== */

function renderizarVentasAdmin() {

    const cuerpoTabla =
        document.getElementById("tablaVentasAdmin");

    if (!cuerpoTabla) return;

    if (historialVentas.length === 0) {

        cuerpoTabla.innerHTML =
            `<tr><td colspan="6" class="sin-datos">Aún no se han registrado ventas.</td></tr>`;

        return;
    }

    const ventasRecientesPrimero =
        [...historialVentas].reverse();

    cuerpoTabla.innerHTML = ventasRecientesPrimero.map(venta => {

        const documentoCliente =
            venta.comprobante === "FACTURA"
                ? venta.cliente.razonSocial
                : (venta.cliente.numeroDocumento || "Cliente Varios");

        return `

            <tr>
                <td>${venta.fechaObj.toLocaleTimeString()}</td>
                <td>${venta.numeroComprobante}</td>
                <td>${venta.comprobante}</td>
                <td>${documentoCliente}</td>
                <td>S/ ${venta.totales.subtotalIncIgv.toFixed(2)}</td>
                <td>
                    <button
                        class="btn-accion-tabla btn-ver-comprobante"
                        onclick="abrirModalComprobante('${venta.numeroComprobante}')"
                    >
                        👁️ Ver
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


function abrirModalComprobante(numeroComprobante) {

    const venta =
        historialVentas.find(v => v.numeroComprobante === numeroComprobante);

    if (!venta) return;

    ventaEnModal = venta;

    document.getElementById("modalComprobanteContenido").innerHTML =
        generarTicketHTML(venta);

    document.getElementById("modalComprobante").classList.remove("oculto");
}


function cerrarModalComprobante() {

    document.getElementById("modalComprobante").classList.add("oculto");
}


function verJSONComprobante() {

    if (!ventaEnModal) return;

    console.clear();

    console.log(
        `=== JSON DEL COMPROBANTE ${ventaEnModal.numeroComprobante} ===`
    );

    console.log(JSON.stringify(ventaEnModal, null, 2));

    alert("Comprobante impreso en la consola (F12).");
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarInventarioInicial();

        filtrarPorCategoria();

        // Poblar los <select> de categoría del Dashboard Admin
        const filtroCategoriaAdmin =
            document.getElementById("filtroCategoriaAdmin");

        const prodCategoria =
            document.getElementById("prodCategoria");

        CATEGORIAS.forEach(categoria => {

            filtroCategoriaAdmin.innerHTML +=
                `<option value="${categoria}">${categoria}</option>`;

            prodCategoria.innerHTML +=
                `<option value="${categoria}">${categoria}</option>`;
        });

        // Cerrar los modales al hacer clic fuera de su contenido
        document.querySelectorAll(".modal-overlay").forEach(overlay => {

            overlay.addEventListener("click", e => {

                if (e.target === overlay) {

                    overlay.classList.add("oculto");
                }
            });
        });

        // Vista inicial: selector de rol
        mostrarVista("selector");

        // Comprobante / Documento
        const selectComprobante =
            document.getElementById(
                "selectTipoComprobante"
            );

        const selectDocumento =
            document.getElementById(
                "selectTipoDoc"
            );

        const inputDocumento =
            document.getElementById(
                "txtDni"
            );

        const inputRuc =
            document.getElementById(
                "txtRuc"
            );


        selectComprobante.addEventListener(
            "change",
            actualizarTipoComprobante
        );

        selectDocumento.addEventListener(
            "change",
            actualizarDocumento
        );


        inputDocumento.addEventListener(
            "input",
            actualizarDocumento
        );

        inputRuc.addEventListener(
            "input",
            validarEntradaRuc
        );


        // Cupón
        const inputCupon =
            document.getElementById(
                "txtCupon"
            );


        inputCupon.addEventListener(
            "input",
            validarEntradaCupon
        );

        inputCupon.addEventListener("keyup", e => {

            if (e.key === "Enter") {

                aplicarCupon();
            }
        });


        // PIN de administrador: permitir tecla Enter
        const inputPin =
            document.getElementById("txtPinAdmin");

        if (inputPin) {

            inputPin.addEventListener("keyup", e => {

                if (e.key === "Enter") {

                    entrarComoAdmin();
                }
            });
        }


        actualizarDocumento();
        actualizarTipoComprobante();
    }
);