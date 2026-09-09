class ProductoTambo {
    constructor(nombre, categoria, precio, imagen) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.imagen = imagen; // Ruta local de la imagen
    }

    obtenerHtmlCard() {
        return `
            <div class="card">
                <img src="${this.imagen}" alt="${this.nombre}" onerror="this.src='https://via.placeholder.com/100?text=Tambo'">
                <h4>${this.nombre}</h4>
                <p>Cat: ${this.categoria}</p>
                <p class="precio">S/. ${this.precio.toFixed(2)}</p>
                <button class="btn-comprar" onclick="alert('¡Compraste ${this.nombre}!')">Agregar</button>
            </div>
        `;
    }
}

// Catálogo enlazado a la carpeta img local
let catalogoTambo = [
    new ProductoTambo("Agua San Luis 600ml", "Bebidas", 2.50, "img/agua.jpg"),
    new ProductoTambo("Galleta Field Soda", "Snacks", 1.20, "img/galleta.jpg"),
    new ProductoTambo("Energizante Red Bull", "Bebidas", 7.50, "img/redbull.jpg")
];

function renderizarCatalogo(productosAMostrar) {
    let contenedor = document.getElementById("contenedorProductos");
    contenedor.innerHTML = "";
    
    for (let prod of productosAMostrar) {
        contenedor.innerHTML += prod.obtenerHtmlCard();
    }
}

function buscarProducto() {
    let texto = document.getElementById("filtroInput").value.toLowerCase().trim();
    let resultados = catalogoTambo.filter(p => p.nombre.toLowerCase().includes(texto));
    
    if (resultados.length > 0) {
        renderizarCatalogo(resultados);
        document.getElementById("mensajeSalida").innerText = `Se encontraron ${resultados.length} producto(s).`;
    } else {
        document.getElementById("contenedorProductos").innerHTML = "<p>No hay productos disponibles.</p>";
        document.getElementById("mensajeSalida").innerText = "No se encontraron resultados.";
    }
}

renderizarCatalogo(catalogoTambo);