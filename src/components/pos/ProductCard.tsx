import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Producto } from '../../types/pos';
import { usePos } from '../../context/PosContext';
import { UMBRAL_STOCK_BAJO } from '../../data/initialProducts';

interface ProductCardProps {
  producto: Producto;
}

export const ProductCard: React.FC<ProductCardProps> = ({ producto }) => {
  const { cart, agregarAlCarrito, cambiarCantidadCarrito } = usePos();

  const itemEnCarrito = cart.find((i) => i.id === producto.id);
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
  const tieneDescuento = producto.porcentajeDescuento > 0;
  const isAgotado = producto.stock === 0;
  const isStockBajo = producto.stock > 0 && producto.stock < UMBRAL_STOCK_BAJO;

  const handleAdd = () => {
    agregarAlCarrito(producto);
  };

  const handleIncrement = () => {
    cambiarCantidadCarrito(producto.id, 1);
  };

  const handleDecrement = () => {
    cambiarCantidadCarrito(producto.id, -1);
  };

  return (
    <Card className={`tambo-product-card h-100 shadow-sm border-0 ${isAgotado ? 'producto-agotado' : ''}`}>
      {/* Badges superiores (Prime / Descuento) */}
      <div className="product-badges-wrapper">
        {producto.esPrime && (
          <Badge bg="danger" className="badge-prime text-uppercase fw-bold">
            PRIME
          </Badge>
        )}
        {tieneDescuento && (
          <Badge bg="warning" text="dark" className="badge-descuento fw-bold">
            -{producto.porcentajeDescuento}%
          </Badge>
        )}
      </div>

      {/* Badge de Stock */}
      <div className="stock-badge-container">
        {isAgotado ? (
          <span className="stock-pill stock-pill-agotado">Agotado</span>
        ) : isStockBajo ? (
          <span className="stock-pill stock-pill-bajo">Stock Bajo ({producto.stock})</span>
        ) : (
          <span className="stock-pill stock-pill-alto">Stock ({producto.stock})</span>
        )}
      </div>

      {/* Imagen del producto */}
      <div className="card-img-wrapper">
        <Card.Img
          variant="top"
          src={producto.imagenUrl}
          alt={producto.nombre}
          loading="lazy"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/assets/img/default.jpg';
          }}
        />
      </div>

      <Card.Body className="d-flex flex-column justify-content-between p-3">
        <Card.Title className="product-title" title={producto.nombre}>
          {producto.nombre}
        </Card.Title>

        <div className="d-flex justify-content-between align-items-end mt-2 pt-2 border-top">
          {/* Precios */}
          <div className="precios-box">
            <span className="precio-oferta">S/ {producto.precioOferta.toFixed(2)}</span>
            {tieneDescuento && (
              <span className="precio-tachado">S/ {producto.precioRegular.toFixed(2)}</span>
            )}
          </div>

          {/* Botones de acción / Contador Tambo */}
          <div className="accion-box">
            {isAgotado ? (
              <span className="text-muted small fw-semibold">Sin stock</span>
            ) : cantidadEnCarrito === 0 ? (
              <Button
                variant="warning"
                size="sm"
                className="btn-add-item rounded-circle"
                onClick={handleAdd}
                title="Agregar al carrito"
              >
                <i className="bi bi-plus-lg"></i>
              </Button>
            ) : (
              <div className="tambo-counter-group d-flex align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="btn-counter-action"
                  onClick={handleDecrement}
                  title="Disminuir / Eliminar"
                >
                  {cantidadEnCarrito === 1 ? <i className="bi bi-trash"></i> : <i className="bi bi-dash"></i>}
                </Button>
                <span className="counter-value px-2 fw-bold">{cantidadEnCarrito}</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="btn-counter-action"
                  onClick={handleIncrement}
                  disabled={cantidadEnCarrito >= producto.stock}
                  title="Aumentar"
                >
                  <i className="bi bi-plus"></i>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

