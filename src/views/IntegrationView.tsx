import React from 'react';
import { useCart } from '../hooks/useCart';
import { useStore } from '../hooks/useStore';

export const IntegrationView: React.FC = () => {
  const { items, totalUnidades, totales } = useCart();
  const { cajeroActivo, sucursalActiva, servicioRestActivo } = useStore();

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-tambo-purple mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-diagram-3-fill text-tambo-yellow"></i>
          <span>Módulo 5: Integración Total de Temas en la Aplicación Web</span>
        </h3>
        <p className="text-muted small mb-0">
          Demostración de cómo se orquestan coherentemente la Navegación, Componentes, Hooks y Servicios REST en una SPA empresarial moderna.
        </p>
      </div>

      {/* Tarjeta de Estado del Sistema en Tiempo Real */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-gradient text-dark border-start border-5 border-primary">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-3">
            <span className="text-muted small text-uppercase fw-bold">1. Navegación Activa</span>
            <div className="fw-bold fs-5 text-primary">React Router DOM v6</div>
            <span className="small text-secondary">Rutas dinámicas y NavLinks sincronizados</span>
          </div>
          <div className="col-12 col-md-3">
            <span className="text-muted small text-uppercase fw-bold">2. Estado Global (Context Hook)</span>
            <div className="fw-bold fs-5 text-success">{totalUnidades} items en Carrito</div>
            <span className="small text-secondary">Subtotal actual: S/ {totales.subtotalFinal.toFixed(2)}</span>
          </div>
          <div className="col-12 col-md-3">
            <span className="text-muted small text-uppercase fw-bold">3. Cliente REST Activo</span>
            <div className="fw-bold fs-5 text-info">{servicioRestActivo}</div>
            <span className="small text-secondary">Conmutación en caliente (Fetch / Axios / Alova)</span>
          </div>
          <div className="col-12 col-md-3">
            <span className="text-muted small text-uppercase fw-bold">4. Sucursal & Cajero</span>
            <div className="fw-bold fs-5 text-warning text-truncate">{cajeroActivo.split(' ')[0]}</div>
            <span className="small text-secondary text-truncate d-block">{sucursalActiva}</span>
          </div>
        </div>
      </div>

      {/* Diagrama de Arquitectura de la Solución */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
            <h5 className="fw-bold text-tambo-purple mb-3">
              <i className="bi bi-layers-fill me-2"></i>Arquitectura de Capas de la Aplicación
            </h5>

            <div className="d-flex flex-column gap-3">
              {/* Capa 1: Navegación */}
              <div className="p-3 border rounded-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong className="text-primary"><i className="bi bi-signpost-2 me-1"></i> Capa 1: Navegación y Vistas (React Router)</strong>
                  <span className="badge bg-primary">Frontend Router</span>
                </div>
                <p className="small text-muted mb-0">
                  Controla las rutas <code>/</code> (POS), <code>/productos</code> (Inventario), <code>/conceptos-react</code>, <code>/hooks</code>, <code>/servicios</code> e <code>/integracion</code> sin recargar la página.
                </p>
              </div>

              {/* Capa 2: Componentes */}
              <div className="p-3 border rounded-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong className="text-dark"><i className="bi bi-grid-1x2 me-1"></i> Capa 2: Componentes y Formularios (Bootstrap 5)</strong>
                  <span className="badge bg-dark">UI Modular</span>
                </div>
                <p className="small text-muted mb-0">
                  Componentes funcionales atómicos (<code>ProductCard</code>, <code>CartSidebar</code>, <code>TicketModal</code>) y formularios controlados con validación en tiempo real (<code>ProductForm</code>).
                </p>
              </div>

              {/* Capa 3: Hooks */}
              <div className="p-3 border rounded-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong className="text-warning"><i className="bi bi-lightning-charge me-1"></i> Capa 3: Orquestación con Hooks (State, Context, Ref, Resource)</strong>
                  <span className="badge bg-warning text-dark">State Engine</span>
                </div>
                <p className="small text-muted mb-0">
                  <code>CartContext</code> y <code>useReducer</code> centralizan las compras y cálculo de IGV/descuentos; <code>useRef</code> manipula el DOM e impresiones; <code>useResource</code> gestiona asincronía.
                </p>
              </div>

              {/* Capa 4: Servicios */}
              <div className="p-3 border rounded-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong className="text-success"><i className="bi bi-hdd-network me-1"></i> Capa 4: Capa de Servicios REST (Fetch, Axios, Alova)</strong>
                  <span className="badge bg-success">Data Access</span>
                </div>
                <p className="small text-muted mb-0">
                  Consumo estandarizado de endpoints RESTful para productos, clientes en padrón y registro de boletas/tickets de venta.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guía de Archivos Implementados */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
            <h5 className="fw-bold text-tambo-purple mb-3">
              <i className="bi bi-folder-check me-2"></i>Mapa de Archivos del Proyecto
            </h5>

            <div className="small font-monospace bg-dark text-light p-3 rounded-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <div className="text-warning fw-bold mb-1">src/</div>
              <div>├── <span className="text-info">types/</span> (interfaces TypeScript)</div>
              <div>├── <span className="text-info">context/</span></div>
              <div>│   ├── CartContext.tsx (useReducer + useContext)</div>
              <div>│   └── StoreContext.tsx</div>
              <div>├── <span className="text-info">hooks/</span></div>
              <div>│   ├── useResource.ts (Resource Hook)</div>
              <div>│   ├── useRefFocus.ts (Ref Hook)</div>
              <div>│   ├── useDebounce.ts (State Hook)</div>
              <div>│   ├── useCart.ts & useStore.ts</div>
              <div>├── <span className="text-info">services/</span></div>
              <div>│   ├── fetchService.ts (Fetch API REST)</div>
              <div>│   ├── axiosService.ts (Axios + Interceptores)</div>
              <div>│   ├── alovaService.ts (Alova + Caché)</div>
              <div>│   └── reniecService.ts</div>
              <div>├── <span className="text-info">components/</span></div>
              <div>│   ├── common/ (Navbar, Footer)</div>
              <div>│   ├── pos/ (ProductCard, Filter, Cart, Ticket)</div>
              <div>│   ├── forms/ (ProductForm con validación)</div>
              <div>│   └── concepts/ (JsxComponent.jsx & TsxComponent.tsx)</div>
              <div>└── <span className="text-info">views/</span> (PosView, ProductManagerView, etc.)</div>
            </div>

            <div className="alert alert-secondary py-2 px-3 small mt-3 mb-0">
              <i className="bi bi-shield-check text-success me-1"></i>
              Todos los módulos requeridos están implementados y verificados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

