import React, { useState } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form, Alert } from 'react-bootstrap';
import { Venta } from '../../types/pos';
import { TicketThermalModal } from '../pos/TicketThermalModal';
import { DateRangeFilter } from './DateRangeFilter';
import { fechaVentaEnRango, rangoFechasValido } from '../../utils/dateRange';

interface SalesHistoryProps {
  ventas: Venta[];
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ ventas }) => {
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const rangoValido = rangoFechasValido(desde, hasta);

  const ventasFiltradas = !rangoValido
    ? []
    : ventas.filter((v) => {
        if (filtroTipo !== 'TODOS' && v.comprobante !== filtroTipo) return false;
        if (!fechaVentaEnRango(v.fecha, desde, hasta)) return false;
        return true;
      });

  const handleVerTicket = (venta: Venta) => {
    setVentaSeleccionada(venta);
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white py-3 border-0">
        <Row className="align-items-center g-2 mb-2">
          <Col xs={12} sm={8}>
            <h5 className="m-0 fw-bold text-purple d-flex align-items-center gap-2">
              <i className="bi bi-clock-history"></i> Historial y Auditoría de Ventas
            </h5>
            <small className="text-muted">Registro en tiempo real respaldado en el servidor REST</small>
          </Col>
          <Col xs={12} sm={4}>
            <Form.Select
              size="sm"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="TODOS">Todos los comprobantes</option>
              <option value="BOLETA">Solo Boletas</option>
              <option value="FACTURA">Solo Facturas</option>
            </Form.Select>
          </Col>
        </Row>
        <DateRangeFilter desde={desde} hasta={hasta} onChange={(d, h) => { setDesde(d); setHasta(h); }} />
        {!rangoValido && (
          <Alert variant="warning" className="py-2 px-2 small mt-2 mb-0">
            <i className="bi bi-exclamation-triangle me-1"></i>
            Rango de fechas inválido: "Desde" no puede ser posterior a "Hasta".
          </Alert>
        )}
      </Card.Header>

      <Card.Body>
        <div className="table-responsive">
          <Table hover className="tambo-admin-table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Fecha y Hora</th>
                <th>N° Comprobante</th>
                <th>Tipo</th>
                <th>Cliente / Documento</th>
                <th>Artículos</th>
                <th>Total</th>
                <th className="text-end">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    <i className="bi bi-inbox display-6 d-block mb-2 text-secondary"></i>
                    {!rangoValido
                      ? 'Corrige el rango de fechas para ver resultados.'
                      : ventas.length === 0
                        ? 'Aún no se han registrado ventas en el sistema.'
                        : 'No hay ventas en el rango o filtro seleccionado.'}
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((v) => {
                  const cantItems = v.itemsComprados.reduce((acc, i) => acc + i.cantidad, 0);
                  const isFactura = v.comprobante === 'FACTURA';

                  return (
                    <tr key={v.id}>
                      <td className="small text-muted">
                        <div>{v.fecha}</div>
                        <div className="fw-semibold text-dark">{v.hora}</div>
                      </td>
                      <td>
                        <strong className="text-purple font-monospace">{v.correlativo}</strong>
                      </td>
                      <td>
                        <Badge bg={isFactura ? 'success' : 'primary'}>
                          {v.comprobante}
                        </Badge>
                      </td>
                      <td className="small">
                        {isFactura ? (
                          <div>
                            <div className="fw-bold">{v.cliente.razonSocial}</div>
                            <div className="text-muted">RUC: {v.cliente.ruc}</div>
                          </div>
                        ) : (
                          <div>
                            {v.cliente.tipoDoc === 'SIN_DOC' ? (
                              <span className="text-muted">Cliente Varios</span>
                            ) : (
                              <span>{v.cliente.tipoDoc}: {v.cliente.numeroDoc}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {cantItems} unid. ({v.itemsComprados.length} prod.)
                        </span>
                      </td>
                      <td>
                        <strong className="fs-6 text-dark">S/ {v.subtotalFinal.toFixed(2)}</strong>
                        {v.descuentoTotal > 0 && (
                          <div className="text-danger small" style={{ fontSize: '11px' }}>
                            Desc: -S/ {v.descuentoTotal.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-purple"
                          size="sm"
                          onClick={() => handleVerTicket(v)}
                          title="Ver e imprimir ticket"
                        >
                          <i className="bi bi-printer me-1"></i> Ver Ticket
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>

      {/* Modal de Ticket Reutilizable */}
      <TicketThermalModal
        show={!!ventaSeleccionada}
        onHide={() => setVentaSeleccionada(null)}
        venta={ventaSeleccionada}
      />
    </Card>
  );
};
