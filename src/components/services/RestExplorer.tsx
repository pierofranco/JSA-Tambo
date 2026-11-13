import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, Badge, Table, Spinner, Alert } from 'react-bootstrap';
import { usePos } from '../../context/PosContext';
import { FetchRestService } from '../../services/fetchService';
import { AxiosRestService } from '../../services/axiosService';
import { AlovaRestService } from '../../services/alovaService';
import { ServiceDriver } from '../../services/apiClient';

export const RestExplorer: React.FC = () => {
  const { driverServicio, setDriverServicio, metricasRecientes } = usePos();

  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET_PRODUCTOS');
  const [paramInput, setParamInput] = useState<string>('18892');
  const [activeDriverTest, setActiveDriverTest] = useState<ServiceDriver>(driverServicio);
  const [loading, setLoading] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const handleRunRequest = async () => {
    const necesitaParametro = selectedEndpoint === 'VALIDAR_CUPON' || selectedEndpoint === 'CONSULTAR_RUC';
    if (necesitaParametro && !paramInput.trim()) {
      setErrorInfo(selectedEndpoint === 'VALIDAR_CUPON' ? 'Ingresa un código de cupón.' : 'Ingresa un RUC.');
      setResponseOutput(null);
      setLatencyMs(null);
      return;
    }

    setLoading(true);
    setErrorInfo(null);
    setResponseOutput(null);
    const start = performance.now();

    try {
      let data: any = null;

      if (selectedEndpoint === 'GET_PRODUCTOS') {
        if (activeDriverTest === 'Fetch') data = await FetchRestService.getProductos();
        else if (activeDriverTest === 'Axios') data = await AxiosRestService.getProductos();
        else data = await AlovaRestService.getProductos();
      } else if (selectedEndpoint === 'GET_VENTAS') {
        if (activeDriverTest === 'Fetch') data = await FetchRestService.getVentas();
        else if (activeDriverTest === 'Axios') data = await AxiosRestService.getVentas();
        else data = await AlovaRestService.getVentas();
      } else if (selectedEndpoint === 'VALIDAR_CUPON') {
        if (activeDriverTest === 'Fetch') data = await FetchRestService.validarCupon(paramInput);
        else if (activeDriverTest === 'Axios') data = await AxiosRestService.validarCupon(paramInput);
        else data = await AlovaRestService.validarCupon(paramInput);
      } else if (selectedEndpoint === 'CONSULTAR_RUC') {
        if (activeDriverTest === 'Fetch') data = await FetchRestService.consultarRuc(paramInput);
        else if (activeDriverTest === 'Axios') data = await AxiosRestService.consultarRuc(paramInput);
        else data = await AlovaRestService.consultarRuc(paramInput);
      }

      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);
      setResponseOutput(data);
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);
      setErrorInfo(err.message || 'Error en la petición REST');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rest-explorer-container py-3">
      {/* Encabezado */}
      <div className="mb-4">
        <h3 className="fw-bold text-purple d-flex align-items-center gap-2">
          <i className="bi bi-hdd-network-fill"></i> Laboratorio de Servicios REST en React
        </h3>
        <p className="text-muted">
          Comparativa técnica interactiva y consumo en vivo entre <strong>Fetch API</strong>, <strong>Axios</strong> y <strong>Alova</strong> dentro de la arquitectura de TAMBOPOS.
        </p>
      </div>

      {/* Selector Global del Driver */}
      <Card className="shadow-sm border-0 mb-4 bg-purple text-white">
        <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h5 className="m-0 fw-bold">Cliente HTTP Activo en el Sistema POS</h5>
            <small className="opacity-75">
              Todas las ventas, cupones y consultas del cajero se están procesando actualmente mediante este driver.
            </small>
          </div>
          <div className="btn-group">
            {(['Fetch', 'Axios', 'Alova'] as ServiceDriver[]).map((driver) => (
              <Button
                key={driver}
                variant={driverServicio === driver ? 'warning' : 'outline-light'}
                className={driverServicio === driver ? 'fw-bold text-purple' : ''}
                onClick={() => setDriverServicio(driver)}
              >
                {driver === 'Fetch' && '📡 '}
                {driver === 'Axios' && '⚡ '}
                {driver === 'Alova' && '🚀 '}
                {driver} {driverServicio === driver && '(Activo)'}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4 mb-4">
        {/* Consola de Pruebas de Endpoints */}
        <Col xs={12} lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="m-0 fw-bold text-purple">
                <i className="bi bi-play-circle me-1"></i> Ejecutar Petición REST
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Seleccionar Driver para la Prueba:</Form.Label>
                <div className="d-flex gap-2">
                  {(['Fetch', 'Axios', 'Alova'] as ServiceDriver[]).map((d) => (
                    <Button
                      key={d}
                      size="sm"
                      variant={activeDriverTest === d ? 'purple' : 'outline-secondary'}
                      onClick={() => setActiveDriverTest(d)}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Endpoint REST:</Form.Label>
                <Form.Select
                  value={selectedEndpoint}
                  onChange={(e) => {
                    setSelectedEndpoint(e.target.value);
                    if (e.target.value === 'VALIDAR_CUPON') setParamInput('18892');
                    if (e.target.value === 'CONSULTAR_RUC') setParamInput('20100070970');
                  }}
                >
                  <option value="GET_PRODUCTOS">GET /api/productos (Catálogo de Tambo)</option>
                  <option value="GET_VENTAS">GET /api/ventas (Historial de Comprobantes)</option>
                  <option value="VALIDAR_CUPON">GET /api/cupones/:codigo (Validación de Cupón)</option>
                  <option value="CONSULTAR_RUC">GET /api/consulta-ruc/:ruc (Simulador SUNAT REST)</option>
                </Form.Select>
              </Form.Group>

              {(selectedEndpoint === 'VALIDAR_CUPON' || selectedEndpoint === 'CONSULTAR_RUC') && (
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">
                    {selectedEndpoint === 'VALIDAR_CUPON' ? 'Código de Cupón:' : 'Número de RUC (11 dígitos):'}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={paramInput}
                    onChange={(e) => setParamInput(e.target.value)}
                  />
                </Form.Group>
              )}

              <Button
                variant="warning"
                className="w-100 fw-bold text-purple"
                onClick={handleRunRequest}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Enviando Petición...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-1"></i> Disparar Petición con {activeDriverTest}
                  </>
                )}
              </Button>

              {/* Indicador de Latencia */}
              {latencyMs !== null && (
                <div className="d-flex justify-content-between align-items-center mt-3 p-2 bg-light rounded border">
                  <span className="small text-muted">Tiempo de Respuesta (Latencia):</span>
                  <Badge bg={latencyMs < 300 ? 'success' : 'warning'} className="fs-6 font-monospace">
                    {latencyMs} ms
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Visor de Respuesta JSON */}
        <Col xs={12} lg={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
              <h5 className="m-0 fw-bold text-purple">
                <i className="bi bi-filetype-json me-1"></i> Respuesta del Servidor (JSON)
              </h5>
              {responseOutput && (
                <Badge bg="success">Status: 200 OK</Badge>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              {errorInfo && (
                <Alert variant="danger" className="m-3">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i> {errorInfo}
                </Alert>
              )}

              <pre className="bg-dark text-light p-3 m-0 font-monospace rounded-bottom" style={{ maxHeight: '350px', overflowY: 'auto', fontSize: '12px' }}>
                {responseOutput ? JSON.stringify(responseOutput, null, 2) : '// Presiona "Disparar Petición" para inspeccionar el payload REST devuelto.'}
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla Comparativa de Fetch vs Axios vs Alova */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white py-3 border-0">
          <h5 className="m-0 fw-bold text-purple">
            <i className="bi bi-table me-2"></i> Matriz Comparativa: Fetch API vs Axios vs Alova
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table bordered hover className="mb-0 small align-middle">
              <thead className="table-purple text-white">
                <tr>
                  <th>Criterio / Característica</th>
                  <th>📡 Fetch API (Nativo)</th>
                  <th>⚡ Axios</th>
                  <th>🚀 Alova.js</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-semibold">Instalación</td>
                  <td>Nativo del navegador (sin dependencias)</td>
                  <td>Requiere paquete `npm install axios` (~30 kB)</td>
                  <td>Requiere paquete `npm install alova` (~4 kB ultraligero)</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Transformación JSON</td>
                  <td>Manual (`res.json()`)</td>
                  <td>Automática en Request y Response</td>
                  <td>Automática mediante adaptadores de respuesta</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Interceptores</td>
                  <td>No nativo (requiere wrappers personalizados)</td>
                  <td>Sí (`interceptors.request` y `interceptors.response`)</td>
                  <td>Sí (Hooks globales `beforeRequest` y `responded`)</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Caché & Deduplicación</td>
                  <td>No integrado (requiere código manual)</td>
                  <td>No integrado (requiere plugins adicionales)</td>
                  <td><strong>Integrado de fábrica</strong> con TTL y memory cache reactivo</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Cancelación</td>
                  <td>AbortController</td>
                  <td>AbortController / CancelToken</td>
                  <td>Método `clonable` y gestión reactiva</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Integración con React</td>
                  <td>Mediante `useEffect` o Custom Hooks</td>
                  <td>Mediante `useEffect` o librerías de query</td>
                  <td>Hooks reactivos especializados (`useRequest`, `useWatcher`)</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Historial de Métricas en Vivo */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-0">
          <h5 className="m-0 fw-bold text-purple">
            <i className="bi bi-speedometer me-2"></i> Telemetría de Peticiones en Tiempo Real
          </h5>
        </Card.Header>
        <Card.Body>
          {metricasRecientes.length === 0 ? (
            <p className="text-muted small m-0">No hay llamadas registradas en esta sesión aún.</p>
          ) : (
            <div className="table-responsive">
              <Table size="sm" hover className="small mb-0">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Driver</th>
                    <th>Método</th>
                    <th>Endpoint</th>
                    <th>Latencia</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {metricasRecientes.map((m, idx) => (
                    <tr key={idx}>
                      <td className="text-muted">{m.timestamp}</td>
                      <td>
                        <Badge bg={m.driver === 'Fetch' ? 'info' : m.driver === 'Axios' ? 'primary' : 'success'}>
                          {m.driver}
                        </Badge>
                      </td>
                      <td className="fw-bold">{m.method}</td>
                      <td className="font-monospace text-truncate" style={{ maxWidth: '250px' }}>{m.endpoint}</td>
                      <td>
                        <span className="font-monospace fw-semibold">{m.durationMs} ms</span>
                      </td>
                      <td>
                        <Badge bg={m.status === 'OK' ? 'success' : 'danger'}>{m.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

