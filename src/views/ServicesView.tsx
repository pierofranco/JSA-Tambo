import React from 'react';
import { RestServicesDemo } from '../components/services/RestServicesDemo';

export const ServicesView: React.FC = () => {
  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-tambo-purple mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-cloud-arrow-down-fill text-tambo-yellow"></i>
          <span>Módulo 4: Servicios REST en React (Fetch API, Axios y Alova)</span>
        </h3>
        <p className="text-muted small mb-0">
          Análisis comparativo, arquitectura de clientes HTTP y consumo de endpoints RESTful para la gestión comercial de Tambo.
        </p>
      </div>

      {/* Comparador en Vivo Interactivo */}
      <RestServicesDemo />

      {/* Tarjetas Didácticas con Ejemplos de Código */}
      <div className="row g-4 mt-2">
        {/* Fetch API Code */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-primary text-white py-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-filetype-js me-2"></i>1. Implementación con Fetch API
              </h6>
            </div>
            <div className="card-body p-3">
              <pre className="code-block mb-3" style={{ fontSize: '0.78rem' }}>
{`// 1. Fetch nativo en TypeScript
async function getProductosFetch(): Promise<Producto[]> {
  const response = await fetch('https://api.tambo-pos.pe/v1/productos', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Fetch NO rechaza por 404 o 500
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
  }

  // Requiere parsear JSON manualmente
  const data = await response.json();
  return data;
}`}
              </pre>
              <div className="small text-muted">
                <strong>Ventajas:</strong> Viene incorporado en todos los navegadores modernos, sin impacto en el bundle inicial de JavaScript.
              </div>
            </div>
          </div>
        </div>

        {/* Axios Code */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-dark text-white py-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-shield-lock me-2 text-warning"></i>2. Implementación con Axios
              </h6>
            </div>
            <div className="card-body p-3">
              <pre className="code-block mb-3" style={{ fontSize: '0.78rem' }}>
{`// 1. Cliente configurado con Interceptores
const api = axios.create({
  baseURL: 'https://api.tambo-pos.pe/v1',
  timeout: 5000
});

// Interceptor inyecta credenciales automáticamente
api.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer tambo_pos_token';
  return config;
});

// Petición fuertemente tipada
async function getProductosAxios(): Promise<Producto[]> {
  // Transforma JSON de forma automática
  const response = await api.get<Producto[]>('/productos');
  return response.data;
}`}
              </pre>
              <div className="small text-muted">
                <strong>Ventajas:</strong> Manejo global de tokens/errores mediante interceptores, cancelación de peticiones con <code>AbortController</code> y amplia compatibilidad.
              </div>
            </div>
          </div>
        </div>

        {/* Alova Code */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-success text-white py-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-lightning-charge me-2 text-warning"></i>3. Implementación con Alova
              </h6>
            </div>
            <div className="card-body p-3">
              <pre className="code-block mb-3" style={{ fontSize: '0.78rem' }}>
{`// 1. Instancia Alova con Adaptador Fetch
export const alova = createAlova({
  baseURL: 'https://api.tambo-pos.pe/v1',
  requestAdapter: adapterFetch(),
  responded: (res) => res.json()
});

// 2. Método declarativo con Caché L1 en Memoria
export const getProductosMethod = alova.Get<Producto[]>('/productos', {
  // Mantiene respuesta en caché por 60 segundos
  cacheFor: 60 * 1000
});

// 3. Ejecución directa
const data = await getProductosMethod.send();`}
              </pre>
              <div className="small text-muted">
                <strong>Ventajas:</strong> Caché automática multinivel (memoria y almacenamiento), tamaño ultraligero (~4KB) y sincronización reactiva de peticiones.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

