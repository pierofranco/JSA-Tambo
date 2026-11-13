import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { usePos } from '../context/PosContext';
import { ProductCard } from '../components/pos/ProductCard';
import { CartSection } from '../components/pos/CartSection';
import { TicketThermalModal } from '../components/pos/TicketThermalModal';

export const CajeroPOS: React.FC = () => {
  const {
    productos,
    loadingProductos,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    busqueda,
    setBusqueda,
    ultimaVenta,
    categorias: categoriasInfo
  } = usePos();

  const [modalTicketAbierto, setModalTicketAbierto] = useState<boolean>(false);

  const categorias: string[] = ['Todas', ...categoriasInfo.map((c) => c.nombre)];

  // Filtrado reactivo con useMemo
  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      const matchCat = categoriaSeleccionada === 'Todas' || prod.categoria === categoriaSeleccionada;
      const matchBusqueda =
        !busqueda.trim() ||
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.id.toLowerCase().includes(busqueda.toLowerCase());
      return matchCat && matchBusqueda;
    });
  }, [productos, categoriaSeleccionada, busqueda]);

  const handleVentaCompletada = () => {
    setModalTicketAbierto(true);
  };

  return (
    <Container fluid className="px-3 px-md-4 py-3">
      <Row className="g-3">
        {/* COLUMNA IZQUIERDA: Catálogo de Productos y Filtros */}
        <Col xs={12} lg={8} xl={8}>
          {/* Card de Búsqueda y Filtros de Categorías */}
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body className="p-3">
              <Row className="g-2 align-items-center">
                <Col xs={12} md={5}>
                  <Form.Control
                    type="text"
                    placeholder="🔎 Buscar producto por nombre o código..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </Col>

                <Col xs={12} md={7}>
                  <div className="d-flex gap-1 flex-wrap category-pills">
                    {categorias.map((cat) => (
                      <Button
                        key={cat}
                        size="sm"
                        variant={categoriaSeleccionada === cat ? 'purple' : 'outline-secondary'}
                        className={`category-btn ${categoriaSeleccionada === cat ? 'active' : ''}`}
                        onClick={() => setCategoriaSeleccionada(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Leyenda de Stock */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2 px-1">
            <div className="d-flex align-items-center gap-3 stock-legend small text-muted">
              <span>
                <i className="bi bi-circle-fill text-success me-1"></i> Stock Alto (≥ 15)
              </span>
              <span>
                <i className="bi bi-circle-fill text-danger me-1"></i> Stock Bajo (&lt; 15)
              </span>
              <span>
                <i className="bi bi-circle-fill text-secondary me-1"></i> Agotado
              </span>
            </div>
            <span className="small text-muted">
              Mostrando {productosFiltrados.length} productos
            </span>
          </div>

          {/* Grid de Productos */}
          {loadingProductos ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="purple" />
              <p className="mt-2 text-muted">Cargando productos vía Servicio REST...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-5 bg-white rounded border">
              <i className="bi bi-search display-5 text-secondary d-block mb-2"></i>
              <p className="text-muted mb-0">No se encontraron productos con el filtro aplicado.</p>
            </div>
          ) : (
            <Row xs={2} sm={3} md={3} xl={4} className="g-3">
              {productosFiltrados.map((prod) => (
                <Col key={prod.id}>
                  <ProductCard producto={prod} />
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* COLUMNA DERECHA: Carrito y Checkout */}
        <Col xs={12} lg={4} xl={4}>
          <div className="sticky-top cart-panel-scroll" style={{ top: '80px' }}>
            <CartSection onVentaCompletada={handleVentaCompletada} />
          </div>
        </Col>
      </Row>

      {/* Modal de Comprobante Térmico Emitido */}
      <TicketThermalModal
        show={modalTicketAbierto}
        onHide={() => setModalTicketAbierto(false)}
        venta={ultimaVenta}
      />
    </Container>
  );
};

