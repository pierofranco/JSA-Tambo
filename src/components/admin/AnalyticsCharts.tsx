import React, { useMemo, useState } from 'react';
import { Row, Col, Card, ProgressBar, Alert } from 'react-bootstrap';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';
import { Venta, Producto } from '../../types/pos';
import { DateRangeFilter } from './DateRangeFilter';
import { fechaVentaEnRango, parseFechaVenta, rangoFechasValido } from '../../utils/dateRange';

interface AnalyticsChartsProps {
  ventas: Venta[];
  productos: Producto[];
}

// Paleta categórica fija (orden nunca ciclado): azul, naranja, aqua, amarillo,
// magenta, verde, violeta, rojo — validada CVD-safe para series adyacentes.
const PALETA_CATEGORICA = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
const COLOR_BARRAS = '#6c2d82'; // morado de marca Tambo
const COLOR_LINEA = '#2a78d6'; // azul (slot 1 de la paleta categórica)

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ ventas, productos }) => {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const rangoValido = rangoFechasValido(desde, hasta);

  const ventasFiltradas = useMemo(
    () => (!rangoValido ? [] : ventas.filter((v) => fechaVentaEnRango(v.fecha, desde, hasta))),
    [ventas, desde, hasta, rangoValido]
  );

  const categoriaPorProducto = useMemo(() => new Map(productos.map((p) => [p.id, p.categoria])), [productos]);

  // Top 5 productos más vendidos (useMemo Hook)
  const topProductos = useMemo(() => {
    const mapa = new Map<string, { nombre: string; unidades: number; totalSoles: number }>();

    ventasFiltradas.forEach((v) => {
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
  }, [ventasFiltradas]);

  // Ventas agrupadas por tipo de comprobante (Boleta vs Factura)
  const comprobantesStats = useMemo(() => {
    let boletasCount = 0;
    let boletasMonto = 0;
    let facturasCount = 0;
    let facturasMonto = 0;

    ventasFiltradas.forEach((v) => {
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
  }, [ventasFiltradas]);

  // Distribución de ventas por categoría (gráfico circular)
  const categoriaStats = useMemo(() => {
    const mapa = new Map<string, number>();
    ventasFiltradas.forEach((v) => {
      v.itemsComprados.forEach((item) => {
        const categoria = categoriaPorProducto.get(item.id) || 'Otros';
        mapa.set(categoria, (mapa.get(categoria) || 0) + item.subtotalItem);
      });
    });
    return Array.from(mapa.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [ventasFiltradas, categoriaPorProducto]);

  // Ventas por día (gráfico de barras) y ticket promedio por día (gráfico de líneas)
  const { ventasPorDia, ticketPromedioPorDia } = useMemo(() => {
    const mapa = new Map<string, { total: number; count: number; orden: number }>();
    ventasFiltradas.forEach((v) => {
      const actual = mapa.get(v.fecha) || { total: 0, count: 0, orden: parseFechaVenta(v.fecha).getTime() };
      actual.total += v.subtotalFinal;
      actual.count += 1;
      mapa.set(v.fecha, actual);
    });
    const ordenado = Array.from(mapa.entries()).sort((a, b) => a[1].orden - b[1].orden);
    return {
      ventasPorDia: ordenado.map(([fecha, { total }]) => ({ fecha: fecha.slice(0, 5), monto: Number(total.toFixed(2)) })),
      ticketPromedioPorDia: ordenado.map(([fecha, { total, count }]) => ({
        fecha: fecha.slice(0, 5),
        promedio: Number((total / count).toFixed(2))
      }))
    };
  }, [ventasFiltradas]);

  const maxUnidades = topProductos.length > 0 ? topProductos[0].unidades : 1;
  const hayDatos = ventasFiltradas.length > 0;

  return (
    <>
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="py-3">
          <DateRangeFilter desde={desde} hasta={hasta} onChange={(d, h) => { setDesde(d); setHasta(h); }} />
          {!rangoValido && (
            <Alert variant="warning" className="py-2 px-2 small mt-2 mb-0">
              <i className="bi bi-exclamation-triangle me-1"></i>
              Rango de fechas inválido: "Desde" no puede ser posterior a "Hasta".
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Row className="g-3 mb-3">
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
                        <ProgressBar now={pct} variant={idx === 0 ? 'warning' : 'primary'} style={{ height: '8px' }} />
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
              {ventasFiltradas.length === 0 ? (
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

      {/* 3 gráficos: categoría más vendida, ventas por día, ticket promedio por día */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="m-0 fw-bold text-purple d-flex align-items-center gap-2">
                <i className="bi bi-pie-chart text-purple"></i> Ventas por Categoría
              </h5>
            </Card.Header>
            <Card.Body>
              {!hayDatos ? (
                <p className="text-muted small text-center py-5 mb-0">Sin datos en el rango seleccionado.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoriaStats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {categoriaStats.map((entry, idx) => (
                        <Cell key={entry.name} fill={PALETA_CATEGORICA[idx % PALETA_CATEGORICA.length]} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `S/ ${Number(value).toFixed(2)}`} />
                    <Legend verticalAlign="bottom" height={48} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="m-0 fw-bold text-purple d-flex align-items-center gap-2">
                <i className="bi bi-bar-chart-line text-purple"></i> Ventas por Día
              </h5>
            </Card.Header>
            <Card.Body>
              {!hayDatos ? (
                <p className="text-muted small text-center py-5 mb-0">Sin datos en el rango seleccionado.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ventasPorDia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#898781' }} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#898781' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, 'Ventas']} />
                    <Bar dataKey="monto" fill={COLOR_BARRAS} radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="m-0 fw-bold text-purple d-flex align-items-center gap-2">
                <i className="bi bi-graph-up text-purple"></i> Ticket Promedio por Día
              </h5>
            </Card.Header>
            <Card.Body>
              {!hayDatos ? (
                <p className="text-muted small text-center py-5 mb-0">Sin datos en el rango seleccionado.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={ticketPromedioPorDia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#898781' }} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#898781' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, 'Ticket Promedio']} />
                    <Line type="monotone" dataKey="promedio" stroke={COLOR_LINEA} strokeWidth={2} dot={{ r: 4, fill: COLOR_LINEA }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
