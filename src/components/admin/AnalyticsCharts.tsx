import React, { useMemo } from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { Venta } from '../../types/pos';

interface AnalyticsChartsProps {
  ventas: Venta[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ ventas }) => {
  // Top 5 productos más vendidos (useMemo Hook)
  const topProductos = useMemo(() => {
    const mapa = new Map<string, { nombre: string; unidades: number; totalSoles: number }>();

    ventas.forEach((v) => {
      v.itemsComprados.forEach((item) => {
        const actual = mapa.get(item.producto) || { nombre: item.producto, unidades: 0, totalSoles: 0 };
        actual.unidades += item.cantidad;
        actual.totalSoles += item.subtotalItem;
        mapa.set(item.producto, actual);
      });
    });

    return Array.from(mapa.values())
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 5);
  }, [ventas]);

  // Ventas agrupadas por tipo de comprobante (Boleta vs Factura)
  const comprobantesStats = useMemo(() => {
    let boletasCount = 0;
    let boletasMonto = 0;
    let facturasCount = 0;
    let facturasMonto = 0;

    ventas.forEach((v) => {
      if (v.comprobante === 'FACTURA') {
        facturasCount++;
        facturasMonto += v.subtotalFinal;
      } else {
        boletasCount++;
        boletasMonto += v.subtotalFinal;
      }
    });

    const totalMonto = boletasMonto + facturasMonto;
    const boletaPct = totalMonto > 0 ? (boletasMonto / totalMonto) * 100 : 0;
    const facturaPct = totalMonto > 0 ? (facturasMonto / totalMonto) * 100 : 0;

    return { boletasCount, boletasMonto, facturasCount, facturasMonto, boletaPct, facturaPct, totalMonto };
  }, [ventas]);

  const maxUnidades = topProductos.length > 0 ? topProductos[0].unidades : 1;

  return (
    <Row className="g-3 mb-4">
      {/* Top 5 Productos */}
      <Col xs={12} lg={7}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white py-3 border-0">
            <h5 className="m-0 fw-bold text-purple d-flex align-items-center gap-2">
              <i className="bi bi-trophy-fill text-warning"></i> Top 5 Productos Más Vendidos
            </h5>
          </Card.Header>
          <Card.Body>
            {topProductos.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-bar-chart display-5 text-secondary d-block mb-2"></i>
                <p className="mb-0">Aún no se han registrado ventas suficientes.</p>
              </div>
            ) : (
              <div className="top-products-list">
                {topProductos.map((prod, idx) => {
                  const pct = Math.round((prod.unidades / maxUnidades) * 100);
                  return (
                    <div key={idx} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center small mb-1">
                        <span className="fw-semibold">
                          <span className="badge bg-purple me-2">#{idx + 1}</span>
                          {prod.nombre}
                        </span>
                        <span className="text-muted">
                          <strong>{prod.unidades} unid.</strong> (S/ {prod.totalSoles.toFixed(2)})
                        </span>
                      </div>
                      <ProgressBar
                        now={pct}
                        variant={idx === 0 ? 'warning' : 'primary'}
                        style={{ height: '8px' }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Distribución de Comprobantes Emitidos */}
      <Col xs={12} lg={5}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white py-3 border-0">
            <h5 className="m-0 fw-bold text-purple d-flex align-items-center gap-2">
              <i className="bi bi-pie-chart-fill text-info"></i> Distribución de Comprobantes
            </h5>
          </Card.Header>
          <Card.Body>
            {ventas.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p className="mb-0">Sin transacciones registradas.</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>
                      <i className="bi bi-file-earmark-text text-primary me-1"></i> Boletas de Venta ({comprobantesStats.boletasCount})
                    </span>
                    <strong className="text-primary">
                      S/ {comprobantesStats.boletasMonto.toFixed(2)} ({comprobantesStats.boletaPct.toFixed(1)}%)
                    </strong>
                  </div>
                  <ProgressBar now={comprobantesStats.boletaPct} variant="primary" style={{ height: '10px' }} />
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>
                      <i className="bi bi-file-earmark-ruled text-success me-1"></i> Facturas Comerciales ({comprobantesStats.facturasCount})
                    </span>
                    <strong className="text-success">
                      S/ {comprobantesStats.facturasMonto.toFixed(2)} ({comprobantesStats.facturaPct.toFixed(1)}%)
                    </strong>
                  </div>
                  <ProgressBar now={comprobantesStats.facturaPct} variant="success" style={{ height: '10px' }} />
                </div>

                <div className="alert alert-light border small text-muted mb-0">
                  <i className="bi bi-info-circle me-1"></i> Total recaudado acumulado:{' '}
                  <strong>S/ {comprobantesStats.totalMonto.toFixed(2)}</strong>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

