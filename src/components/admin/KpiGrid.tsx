import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Venta, Producto } from '../../types/pos';
import { UMBRAL_STOCK_BAJO } from '../../data/initialProducts';

interface KpiGridProps {
  ventas: Venta[];
  productos: Producto[];
}

export const KpiGrid: React.FC<KpiGridProps> = ({ ventas, productos }) => {
  const totalVentasDia = ventas.reduce((acc, v) => acc + v.subtotalFinal, 0);
  const ticketPromedio = ventas.length > 0 ? totalVentasDia / ventas.length : 0;
  const igvRecaudado = ventas.reduce((acc, v) => acc + v.igv, 0);
  const stockBajoCount = productos.filter((p) => p.stock > 0 && p.stock < UMBRAL_STOCK_BAJO).length;
  const agotadosCount = productos.filter((p) => p.stock === 0).length;

  return (
    <Row className="g-3 mb-4">
      {/* KPI: Ventas del Día */}
      <Col xs={12} sm={6} lg={3}>
        <Card className="kpi-card shadow-sm border-0 border-start border-4 border-primary h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">Ventas del Día</span>
                <h4 className="fw-bold mb-0 text-primary">S/ {totalVentasDia.toFixed(2)}</h4>
                <small className="text-muted">{ventas.length} transacciones</small>
              </div>
              <div className="kpi-icon-box bg-primary-subtle text-primary rounded-circle p-3">
                <i className="bi bi-cash-stack fs-3"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* KPI: Ticket Promedio */}
      <Col xs={12} sm={6} lg={3}>
        <Card className="kpi-card shadow-sm border-0 border-start border-4 border-success h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">Ticket Promedio</span>
                <h4 className="fw-bold mb-0 text-success">S/ {ticketPromedio.toFixed(2)}</h4>
                <small className="text-muted">Por comprobante</small>
              </div>
              <div className="kpi-icon-box bg-success-subtle text-success rounded-circle p-3">
                <i className="bi bi-graph-up-arrow fs-3"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* KPI: IGV Recaudado */}
      <Col xs={12} sm={6} lg={3}>
        <Card className="kpi-card shadow-sm border-0 border-start border-4 border-purple h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">IGV Recaudado</span>
                <h4 className="fw-bold mb-0 text-purple">S/ {igvRecaudado.toFixed(2)}</h4>
                <small className="text-muted">Impuesto 18% SUNAT</small>
              </div>
              <div className="kpi-icon-box bg-purple-subtle text-purple rounded-circle p-3">
                <i className="bi bi-shield-check fs-3"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* KPI: Alertas de Stock */}
      <Col xs={12} sm={6} lg={3}>
        <Card className={`kpi-card shadow-sm border-0 border-start border-4 ${stockBajoCount > 0 ? 'border-danger' : 'border-secondary'} h-100`}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">Alertas Stock</span>
                <h4 className={`fw-bold mb-0 ${stockBajoCount > 0 ? 'text-danger' : 'text-dark'}`}>
                  {stockBajoCount} <span className="fs-6 fw-normal text-muted">bajos</span>
                </h4>
                <small className="text-danger fw-semibold">{agotadosCount} agotados</small>
              </div>
              <div className="kpi-icon-box bg-danger-subtle text-danger rounded-circle p-3">
                <i className="bi bi-exclamation-triangle-fill fs-3"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

