import React from 'react';
import { Producto } from '../../types';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  producto: Producto;
}

export const ProductCard: React.FC<ProductCardProps> = ({ producto }) => {
  const { items, agregarAlCarrito, cambiarCantidad } = useCart();

  const itemEnCarrito = items.find(i => i.id === producto.id);
  const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;
  const tieneDescuento = producto.porcentajeDescuento > 0;
  const sinStock = producto.stock <= 0;

  return (
    <div className="product-card h-100">
      {/* Badges de producto */}
      <div className="position-absolute top-0 start-0 p-2 d-flex flex-column gap-1" style={{ zIndex: 2 }}>
        {producto.esPrime && <span className="badge-prime shadow-sm">PRIME</span>}
        {tieneDescuento && (
          <span className="badge-descuento shadow-sm">
            -{producto.porcentajeDescuento}%
          </span>
        )}
      </div>

      {/* Imagen */}
      <div className="product-img-wrapper">
        <img
          src={producto.imagenUrl}
          alt={producto.nombre}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';
          }}
        />
        <span className="position-absolute bottom-0 end-0 bg-dark bg-opacity-75 text-white px-2 py-0 rounded-start small" style={{ fontSize: '0.72rem' }}>
          Stock: {producto.stock}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <span className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
          {producto.categoria}
        </span>
        <h6 className="fw-semibold text-dark mb-2 text-truncate" title={producto.nombre}>
          {producto.nombre}
        </h6>

        {/* Footer: Precios y botón/contador */}
        <div className="mt-auto pt-2 d-flex align-items-center justify-content-between border-top">
          <div>
            <div className="fw-bold text-tambo-purple fs-6">
              S/ {producto.precioOferta.toFixed(2)}
            </div>
            {tieneDescuento && (
              <small className="text-muted text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
                S/ {producto.precioRegular.toFixed(2)}
              </small>
            )}
          </div>

          <div>
            {sinStock ? (
              <span className="badge bg-secondary">Agotado</span>
            ) : cantidad === 0 ? (
              <button
                className="btn btn-tambo-purple rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '36px', height: '36px' }}
                onClick={() => agregarAlCarrito(producto)}
                title="Agregar al carrito"
              >
                <i className="bi bi-plus-lg fs-6"></i>
              </button>
            ) : (
              <div className="counter-tambo">
                <button
                  type="button"
                  onClick={() => cambiarCantidad(producto.id, -1)}
                  title="Disminuir"
                >
                  <i className="bi bi-dash"></i>
                </button>
                <span className="fw-bold px-1 small">{cantidad}</span>
                <button
                  type="button"
                  onClick={() => cambiarCantidad(producto.id, 1)}
                  disabled={cantidad >= producto.stock}
                  title="Aumentar"
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

