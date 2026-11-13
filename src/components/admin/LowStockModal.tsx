import React, { useEffect, useState } from 'react';
import { Modal, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { usePos } from '../../context/PosContext';
import { UMBRAL_STOCK_BAJO } from '../../data/initialProducts';
import { Proveedor } from '../../types/pos';

interface LowStockModalProps {
  show: boolean;
  onHide: () => void;
  onSolicitar: (proveedorId: number, productoId: string) => void;
}

export const LowStockModal: React.FC<LowStockModalProps> = ({ show, onHide, onSolicitar }) => {
  const { productos } = usePos();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!show) return;
    setCargando(true);
    fetch('/api/proveedores')
      .then((res) => (res.ok ? res.json() : []))
      .then(setProveedores)
      .catch(() => setProveedores([]))
      .finally(() => setCargando(false));
  }, [show]);

  const productosBajoStock = productos
    .filter((p) => p.stock < UMBRAL_STOCK_BAJO)
    .sort((a, b) => a.stock - b.stock);

  const proveedoresDe = (productoId: string) =>
    proveedores.filter((prov) => prov.productos.some((pp) => pp.productoId === productoId));

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title className="fs-5 fw-bold">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Productos con Bajo Stock / Agotados
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {productosBajoStock.length === 0 ? (
          <Alert variant="success" className="mb-0">
            <i className="bi bi-check-circle me-1"></i> No hay productos con stock bajo en este momento.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover size="sm" className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Código / Nombre</th>
                  <th>Stock</th>
                  <th>Proveedores</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {productosBajoStock.map((prod) => {
                  const provs = proveedoresDe(prod.id);
                  return (
                    <tr key={prod.id}>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary me-1 font-monospace">{prod.id}</span>
                        <strong>{prod.nombre}</strong>
                      </td>
                      <td>
                        {prod.stock === 0 ? (
                          <Badge bg="secondary">Agotado</Badge>
                        ) : (
                          <Badge bg="danger">{prod.stock} unid.</Badge>
                        )}
                      </td>
                      <td>
                        {cargando ? (
                          <Spinner size="sm" animation="border" />
                        ) : provs.length === 0 ? (
                          <span className="text-muted small">Sin proveedor asignado</span>
                        ) : (
                          provs.map((prov) => (
                            <div key={prov.id} className="small">
                              {prov.razonSocial}
                            </div>
                          ))
                        )}
                      </td>
                      <td className="text-end">
                        {provs.length > 0 ? (
                          <Button
                            size="sm"
                            variant="warning"
                            className="fw-bold text-purple"
                            onClick={() => onSolicitar(provs[0].id, prod.id)}
                          >
                            <i className="bi bi-cart-plus me-1"></i> Solicitar
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline-secondary" disabled>
                            Sin proveedor
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};
