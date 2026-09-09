// --- SEMANA 1 & 2: Variables, Tipos de datos, Operadores y BigInt ---
const nombreTienda = "Tambo+ Chorrillos";
let cajaAbierta = true;
let ventasTotalesDia = 1500n; // Uso de BigInt para transacciones masivas

// Operadores lógicos y matemáticos
let stockBebidas = 50;
let stockSnacks = 20;
let stockTotal = stockBebidas + stockSnacks;
let hayStockCritico = (stockTotal < 100) && cajaAbierta;

console.log(`Tienda: ${nombreTienda} | Stock Crítico: ${hayStockCritico}`);

// --- SEMANA 4: Clases, Arreglos y Métodos Avanzados ---
class ProductoTambo {
    constructor(nombre, categoria, precio, stock) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.stock = stock;
    }

    obtenerInfo() {
        // --- SEMANA 3: Interpolación y manejo de cadenas ---
        return `Producto: ${this.nombre.toUpperCase()} [Categoría: ${this.categoria}] - Precio: S/. ${this.precio.toFixed(2)}`;
    }
}

// Catálogo inicial usando arreglos lineales y objetos
let catalogoTambo = [
    new ProductoTambo("Agua San Luis 600ml", "Bebidas", 2.50, 40),
    new ProductoTambo("Galleta Field Soda", "Snacks", 1.20, 15),
    new ProductoTambo("Cabanossi Nicolini", "Abarrotes", 3.80, 25),
    new ProductoTambo("Energizante Red Bull", "Bebidas", 7.50, 10)
];

// Uso de funciones flecha, filter y map (Semanas 2 y 4)
function filtrarBebidasBaratas() {
    return catalogoTambo
        .filter(prod => prod.categoria === "Bebidas" && prod.precio < 5.00)
        .map(prod => prod.nombre);
}

// --- Función principal enlazada al botón del HTML ---
function ejecutarSimulacionTambo() {
    let inputUsuario = document.getElementById("codigoProducto").value;
    
    // Búsqueda en arreglos (Semana 3 y 4)
    let encontrado = catalogoTambo.find(p => p.nombre.toLowerCase().includes(inputUsuario.toLowerCase()));

    let mensajeFinal = "";
    if (encontrado) {
        mensajeFinal = encontrado.obtenerInfo();
    } else {
        mensajeFinal = `No se encontró el producto "${inputUsuario}" en el sistema de Tambo.`;
    }

    // Salida en pantalla (Semana 1)
    document.getElementById("resultadoTambo").innerText = mensajeFinal;
    console.log("Bebidas económicas disponibles:", filtrarBebidasBaratas());
}