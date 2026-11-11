import React, { useState, useMemo, useRef } from 'react';
import { Table, Button, Form, Row, Col, Badge, Pagination, Card } from 'react-bootstrap';
import { Producto } from '../../types/pos';
import { usePos } from '../../context/PosContext';
import { ProductFormModal } from './ProductFormModal';
import { UMBRAL_STOCK_BAJO } from '../../data/initialProducts';

export const InventoryManagement: React.FC = () => {
  const { productos, eliminarProducto } = usePos();

  // STATE HOOKS: Filtros locales, paginación y modal
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 8;

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);

  // REF HOOK: Referencia al input de búsqueda para atajos o foco directo
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Filtrado de productos con useMemo
  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      const matchCat = categoria === 'Todas' || prod.categoria === categoria;
      const matchBusqueda =
        !busqueda.trim() ||
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.id.toLowerCase().includes(busqueda.toLowerCase());
      return matchCat && matchBusqueda;
    });
  }, [productos, categoria, busqueda]);

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
  const paginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return productosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [productosFiltrados, paginaActual]);

  const handleAbrirCrear = () => {
    setProductoAEditar(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (prod: Producto) => {
    setProductoAEditar(prod);
    setModalAbierto(true);
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${nombre}" del inventario?`)) {
      await eliminarProducto(id);
    }
  };

  const handleFocusSearch = () => {
    // Uso explícito de useRef Hook
    searchInputRef.current?.focus();
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white py-3 border-0">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 className="m-0 fw-bold text-purple d-flex align-items-center gap-2">
              <i className="bi bi-boxes"></i> Gestión de Inventario & Productos
            </h5>
            <small className="text-muted">Total: {productos.length} productos registrados</small>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-purple" size="sm" onClick={handleFocusSearch} title="Atajo para buscar">
              <i className="bi bi-search"></i> Enfocar Búsqueda (useRef)
            </Button>
            <Button variant="warning" size="sm" className="fw-bold text-purple" onClick={handleAbrirCrear}>
              <i className="bi bi-plus-circle me-1"></i> + Nuevo Producto
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Barra de Filtros y Búsqueda */}
        <Row className="g-2 mb-3">
          <Col xs={12} md={6}>
            <Form.Control
              ref={searchInputRef}
              type="text"
              placeholder="🔎 Buscar por código o nombre de producto..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Form.Select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="Todas">Todas las categorías</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Snacks">Snacks</option>
              <option value="Comida Rápida">Comida Rápida</option>
              <option value="Abarrotes">Abarrotes</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Tabla Responsiva de Inventario */}
        <div className="table-responsive">
          <Table hover className="tambo-admin-table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '70px' }}>Foto</th>
                <th>Código / Nombre</th>
                <th>Categoría</th>
                <th>P. Regular</th>
                <th>P. Oferta</th>
                <th>Stock</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No se encontraron productos con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                paginados.map((prod) => {
                  const isAgotado = prod.stock === 0;
                  const isBajo = prod.stock > 0 && prod.stock < UMBRAL_STOCK_BAJO;
                  return (
                    <tr key={prod.id}>
                      <td>
                        <img
                          src={prod.imagenUrl}
                          alt={prod.nombre}
                          width={45}
                          height={45}
                          className="rounded object-fit-cover border"
                          onError={(e: any) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/img/default.jpg';
                          }}
                        />
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary me-2 font-monospace">
                          {prod.id}
                        </span>
                        <strong className="text-dark">{prod.nombre}</strong>
                        {prod.esPrime && <Badge bg="danger" className="ms-2">PRIME</Badge>}
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {prod.categoria}
                        </Badge>
                      </td>
                      <td>S/ {prod.precioRegular.toFixed(2)}</td>
                      <td>
                        <strong className="text-purple">S/ {prod.precioOferta.toFixed(2)}</strong>
                        {prod.porcentajeDescuento > 0 && (
                          <small className="text-success ms-1">(-{prod.porcentajeDescuento}%)</small>
                        )}
                      </td>
                      <td>
                        {isAgotado ? (
                          <Badge bg="secondary">Agotado (0)</Badge>
                        ) : isBajo ? (
                          <Badge bg="danger">Stock Bajo ({prod.stock})</Badge>
                        ) : (
                          <Badge bg="success">Stock Alto ({prod.stock})</Badge>
                        )}
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleAbrirEditar(prod)}
                          title="Editar producto"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEliminar(prod.id, prod.nombre)}
                          title="Eliminar producto"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
            <small className="text-muted">
              Página {paginaActual} de {totalPaginas} ({productosFiltrados.length} resultados)
            </small>
            <Pagination size="sm" className="mb-0">
              <Pagination.Prev
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              />
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <Pagination.Item
                  key={num}
                  active={num === paginaActual}
                  onClick={() => setPaginaActual(num)}
                >
                  {num}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              />
            </Pagination>
          </div>
        )}
      </Card.Body>

      {/* Modal para Agregar / Editar Producto */}
      <ProductFormModal
        show={modalAbierto}
        onHide={() => setModalAbierto(false)}
        productoEditar={productoAEditar}
      />
    </Card>
  );
};
