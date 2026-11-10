import React, { useState } from 'react';
import { RestClientType, RestExecutionResult } from '../../types';
import { fetchService } from '../../services/fetchService';
import { axiosService } from '../../services/axiosService';
import { alovaService } from '../../services/alovaService';

export const RestServicesDemo: React.FC = () => {
  const [endpointSeleccionado, setEndpointSeleccionado] = useState<'productos' | 'cliente' | 'venta'>('productos');
  const [docClientePrueba, setDocClientePrueba] = useState<string>('72839401');

  const [ejecutando, setEjecutando] = useState(false);
  const [resultados, setResultados] = useState<Record<RestClientType, RestExecutionResult | null>>({
    'Fetch API': null,
    'Axios': null,
    'Alova': null
  });

  const ejecutarComparativa = async () => {
    setEjecutando(true);

    try {
      if (endpointSeleccionado === 'productos') {
        const [resFetch, resAxios, resAlova] = await Promise.all([
          fetchService.getProductos(),
          axiosService.getProductos(),
          alovaService.getProductos()
        ]);
        setResultados({
          'Fetch API': resFetch,
          'Axios': resAxios,
          'Alova': resAlova
        });
      } else if (endpointSeleccionado === 'cliente') {
        const [resFetch, resAxios, resAlova] = await Promise.all([
          fetchService.getClientePorDoc(docClientePrueba),
          axiosService.getClientePorDoc(docClientePrueba),
          alovaService.getClientePorDoc(docClientePrueba)
        ]);
        setResultados({
          'Fetch API': resFetch,
          'Axios': resAxios,
          'Alova': resAlova
        });
      } else if (endpointSeleccionado === 'venta') {
        const ticketMock: any = {
          idVenta: 'DEMO-REST-01',
          fecha: new Date().toLocaleDateString(),
          montoTotal: 45.50
        };
        const [resFetch, resAxios, resAlova] = await Promise.all([
          fetchService.registrarVenta(ticketMock),
          axiosService.registrarVenta(ticketMock),
          alovaService.registrarVenta(ticketMock)
        ]);
        setResultados({
          'Fetch API': resFetch,
          'Axios': resAxios,
          'Alova': resAlova
        });
      }
    } catch (err: any) {
      console.error("Error en comparativa REST", err);
    } finally {
      setEjecutando(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h4 className="fw-bold mb-1 text-tambo-purple d-flex align-items-center gap-2">
            <i className="bi bi-cpu-fill text-tambo-yellow"></i>
            <span>Comparador en Vivo: Fetch API vs Axios vs Alova</span>
          </h4>
          <p className="text-muted small mb-0">
            Ejecuta la misma petición HTTP de manera simultánea en los 3 clientes para analizar latencia, interceptores, headers y carga de datos.
          </p>
        </div>

        <button
          className="btn btn-tambo-purple d-flex align-items-center gap-2 px-3 shadow-sm"
          onClick={ejecutarComparativa}
          disabled={ejecutando}
        >
          {ejecutando ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              <span>Ejecutando en los 3 clientes...</span>
            </>
          ) : (
            <>
              <i className="bi bi-play-circle-fill fs-5"></i>
              <span>Disparar Comparativa REST</span>
            </>
          )}
        </button>
      </div>

      {/* Selectores de prueba */}
      <div className="bg-light p-3 rounded-3 mb-4 border">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <label className="form-label small fw-semibold mb-1">Seleccionar Endpoint a Consumir:</label>
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn btn-sm ${endpointSeleccionado === 'productos' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setEndpointSeleccionado('productos')}
              >
                GET /productos (Catálogo)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${endpointSeleccionado === 'cliente' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setEndpointSeleccionado('cliente')}
              >
                GET /clientes/:doc
              </button>
              <button
                type="button"
                className={`btn btn-sm ${endpointSeleccionado === 'venta' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setEndpointSeleccionado('venta')}
              >
                POST /ventas (Checkout)
              </button>
            </div>
          </div>

          {endpointSeleccionado === 'cliente' && (
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold mb-1">N° Documento para Prueba:</label>
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  value={docClientePrueba}
                  onChange={(e) => setDocClientePrueba(e.target.value)}
                  placeholder="DNI o RUC"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setDocClientePrueba('72839401')}
                >
                  Padrón OK
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setDocClientePrueba('99999999')}
                >
                  Probar 404
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas comparativas de los 3 clientes */}
      <div className="row g-3">
        {/* 1. FETCH API */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 border-primary shadow-sm rounded-3">
            <div className="card-header bg-primary text-white py-2 d-flex justify-content-between align-items-center">
              <span className="fw-bold"><i className="bi bi-globe2 me-1"></i> 1. Fetch API</span>
              <span className="badge bg-light text-primary">Nativo Browser</span>
            </div>
            <div className="card-body p-3 d-flex flex-column">
              <p className="small text-muted mb-2">
                API nativa estándar de JavaScript. Ligera, sin librerías externas. Requiere validación manual de <code>res.ok</code> y parsing con <code>res.json()</code>.
              </p>

              {resultados['Fetch API'] ? (
                <div className="bg-light p-2 rounded border small mt-auto">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Status HTTP:</span>
                    <span className={`badge ${resultados['Fetch API']?.status === 200 || resultados['Fetch API']?.status === 201 ? 'bg-success' : 'bg-danger'}`}>
                      {resultados['Fetch API']?.status} {resultados['Fetch API']?.statusText}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Tiempo de Respuesta:</span>
                    <strong className="text-primary">{resultados['Fetch API']?.tiempoMs} ms</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1 text-truncate">
                    <span>Header X-Client:</span>
                    <code className="small">{resultados['Fetch API']?.headers?.['X-Client-Library']}</code>
                  </div>
                  {resultados['Fetch API']?.error ? (
                    <div className="alert alert-danger py-1 px-2 mb-0 small mt-2">
                      {resultados['Fetch API']?.error}
                    </div>
                  ) : (
                    <div className="mt-2 text-success small">
                      <i className="bi bi-check-circle-fill me-1"></i> Datos recibidos correctamente
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted small mt-auto border rounded bg-light">
                  Presiona "Disparar Comparativa REST" para consultar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. AXIOS */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 border-dark shadow-sm rounded-3">
            <div className="card-header bg-dark text-white py-2 d-flex justify-content-between align-items-center">
              <span className="fw-bold"><i className="bi bi-arrow-left-right me-1"></i> 2. Axios</span>
              <span className="badge bg-warning text-dark">Interceptores</span>
            </div>
            <div className="card-body p-3 d-flex flex-column">
              <p className="small text-muted mb-2">
                Cliente HTTP basado en Promesas. Cuenta con interceptores de solicitud y respuesta, transformación automática de JSON y manejo global de errores.
              </p>

              {resultados['Axios'] ? (
                <div className="bg-light p-2 rounded border small mt-auto">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Status HTTP:</span>
                    <span className={`badge ${resultados['Axios']?.status === 200 || resultados['Axios']?.status === 201 ? 'bg-success' : 'bg-danger'}`}>
                      {resultados['Axios']?.status} {resultados['Axios']?.statusText}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Tiempo de Respuesta:</span>
                    <strong className="text-dark">{resultados['Axios']?.tiempoMs} ms</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1 text-truncate">
                    <span>Token Inyectado:</span>
                    <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.68rem' }}>Bearer tambo_pos_...</span>
                  </div>
                  {resultados['Axios']?.error ? (
                    <div className="alert alert-danger py-1 px-2 mb-0 small mt-2">
                      {resultados['Axios']?.error}
                    </div>
                  ) : (
                    <div className="mt-2 text-success small">
                      <i className="bi bi-check-circle-fill me-1"></i> Interceptores ejecutados con éxito
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted small mt-auto border rounded bg-light">
                  Presiona "Disparar Comparativa REST" para consultar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. ALOVA */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 border-success shadow-sm rounded-3">
            <div className="card-header bg-success text-white py-2 d-flex justify-content-between align-items-center">
              <span className="fw-bold"><i className="bi bi-lightning-charge-fill me-1"></i> 3. Alova</span>
              <span className="badge bg-light text-success">Caché & Reactivo</span>
            </div>
            <div className="card-body p-3 d-flex flex-column">
              <p className="small text-muted mb-2">
                Diseñado específicamente para el ecosistema moderno. Ofrece gestión de caché multinivel automática, reducción de peticiones redundantes y estado reactivo.
              </p>

              {resultados['Alova'] ? (
                <div className="bg-light p-2 rounded border small mt-auto">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Status HTTP:</span>
                    <span className={`badge ${resultados['Alova']?.status === 200 || resultados['Alova']?.status === 201 ? 'bg-success' : 'bg-danger'}`}>
                      {resultados['Alova']?.status} {resultados['Alova']?.statusText}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Tiempo de Respuesta:</span>
                    <strong className="text-success">{resultados['Alova']?.tiempoMs} ms</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1 text-truncate">
                    <span>Estado Caché:</span>
                    <span className="badge bg-success font-monospace" style={{ fontSize: '0.68rem' }}>Hit (L1 Memory)</span>
                  </div>
                  {resultados['Alova']?.error ? (
                    <div className="alert alert-danger py-1 px-2 mb-0 small mt-2">
                      {resultados['Alova']?.error}
                    </div>
                  ) : (
                    <div className="mt-2 text-success small">
                      <i className="bi bi-check-circle-fill me-1"></i> Optimización de memoria activa
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted small mt-auto border rounded bg-light">
                  Presiona "Disparar Comparativa REST" para consultar
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

