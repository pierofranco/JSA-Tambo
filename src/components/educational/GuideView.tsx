import React, { useState } from 'react';
import { Tab, Tabs, Card, Row, Col, Badge, Alert, Button } from 'react-bootstrap';
import { useResource } from '../../hooks/useResourceHook';
import { ApiClient } from '../../services/apiClient';

export const GuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('intro');

  // Demostración en vivo de Resource Hook (Tema 3)
  const { data: testProducts, loading: loadingResource, refetch: reloadResource } = useResource(
    () => ApiClient.getProductos('Bebidas'),
    [],
    false
  );

  return (
    <div className="guide-view-container py-3">
      <div className="mb-4">
        <h3 className="fw-bold text-purple d-flex align-items-center gap-2">
          <i className="bi bi-mortarboard-fill"></i> Módulo Teórico-Práctico: React en TAMBOPOS
        </h3>
        <p className="text-muted">
          Implementación integral de los 5 temas pedagógicos y arquitectónicos en el Sistema POS Tambo.
        </p>
      </div>

      <Tabs
        id="guide-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'intro')}
        className="mb-4 tambo-tabs"
        fill
      >
        {/* TEMA 1 */}
        <Tab eventKey="intro" title="1. Introducción a React">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-4">
              <h4 className="text-purple fw-bold mb-3">1. Introducción a React</h4>
              
              <Row className="g-4 mb-4">
                <Col md={6}>
                  <div className="p-3 bg-light rounded border h-100">
                    <h5 className="fw-bold text-primary">Concepto y Filosofía</h5>
                    <p className="small text-muted">
                      React es una biblioteca declarativa, eficiente y flexible para construir interfaces de usuario basada en <strong>componentes</strong> independientes y reutilizables.
                    </p>
                    <ul className="small mb-0">
                      <li><strong>Virtual DOM:</strong> Mecanismo de reconciliación en memoria que minimiza los accesos costosos al DOM real.</li>
                      <li><strong>Flujo Unidireccional:</strong> Los datos descienden vía <code>props</code> desde componentes padres hacia hijos.</li>
                      <li><strong>Declaratividad:</strong> Describes cómo debe verse la UI según el estado actual; React se encarga de sincronizarlo.</li>
                    </ul>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 bg-light rounded border h-100">
                    <h5 className="fw-bold text-success">Instalación y Creación con Vite</h5>
                    <p className="small text-muted">
                      En este proyecto creamos la arquitectura con <strong>Vite + React + TypeScript</strong> para un empaquetado ultrarrápido con HMR (Hot Module Replacement):
                    </p>
                    <pre className="bg-dark text-light p-2 rounded small font-monospace">
                      # Creación e instalación de dependencias{'\n'}
                      npm create vite@latest . -- --template react-ts{'\n'}
                      npm install bootstrap react-bootstrap bootstrap-icons{'\n'}
                      npm install react-router-dom axios alova
                    </pre>
                  </div>
                </Col>
              </Row>

              <h5 className="fw-bold text-purple mt-4">Lenguaje JSX vs Lenguaje TSX</h5>
              <p className="small text-muted">
                <strong>JSX (JavaScript XML)</strong> permite escribir sintaxis similar a HTML dentro de archivos JavaScript. <strong>TSX</strong> añade la potencia de TypeScript proporcionando tipado estricto en Props, State, Eventos y Retornos de Componentes.
              </p>

              <Row className="g-3">
                <Col md={6}>
                  <Card className="border">
                    <Card.Header className="bg-warning-subtle fw-bold small">
                      Ejemplo JSX (JavaScript puro)
                    </Card.Header>
                    <Card.Body className="p-0">
                      <pre className="bg-dark text-light p-3 m-0 small font-monospace">
{`// ComponenteProducto.jsx
export function ProductoCard({ nombre, precio }) {
  return (
    <div className="card">
      <h5>{nombre}</h5>
      <p>S/ {precio.toFixed(2)}</p>
    </div>
  );
}`}
                      </pre>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border">
                    <Card.Header className="bg-primary-subtle fw-bold small">
                      Ejemplo TSX (TypeScript + JSX en TAMBOPOS)
                    </Card.Header>
                    <Card.Body className="p-0">
                      <pre className="bg-dark text-light p-3 m-0 small font-monospace">
{`// ProductCard.tsx
interface ProductCardProps {
  producto: Producto; // Tipo estricto
}

export const ProductCard: React.FC<ProductCardProps> = ({ producto }) => {
  return (
    <Card className="tambo-product-card">
      <Card.Title>{producto.nombre}</Card.Title>
      <span>S/ {producto.precioOferta.toFixed(2)}</span>
    </Card>
  );
};`}
                      </pre>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="mt-4 p-3 bg-purple-subtle rounded">
                <h6 className="fw-bold text-purple mb-1">
                  <i className="bi bi-bootstrap me-1"></i> Integración de Bootstrap en React
                </h6>
                <p className="small text-muted mb-0">
                  Integramos <code>bootstrap@5.3.3</code> con la biblioteca oficial <code>react-bootstrap</code> y <code>bootstrap-icons</code>, personalizando las variables CSS corporativas de Tambo (Morado <code>#6c2d82</code> y Amarillo <code>#ffea28</code>).
                </p>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* TEMA 2 */}
        <Tab eventKey="elements" title="2. Elementos de React">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-4">
              <h4 className="text-purple fw-bold mb-3">2. Elementos de React</h4>

              <Row className="g-4">
                <Col md={4}>
                  <div className="p-3 bg-light rounded border h-100">
                    <h5 className="fw-bold text-purple">
                      <i className="bi bi-signpost-split me-1"></i> Navegación (Routing)
                    </h5>
                    <p className="small text-muted">
                      Implementada mediante <code>react-router-dom</code> con enrutamiento declarativo en Single Page Application (SPA):
                    </p>
                    <ul className="small">
                      <li><code>BrowserRouter</code> y <code>Routes</code></li>
                      <li><code>NavLink</code> para menú con estilos activos</li>
                      <li><code>useNavigate</code> para redirección tras login o venta</li>
                      <li>Rutas: <code>/</code>, <code>/cajero</code>, <code>/admin</code>, <code>/servicios-rest</code>, <code>/guia-educativa</code></li>
                    </ul>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="p-3 bg-light rounded border h-100">
                    <h5 className="fw-bold text-primary">
                      <i className="bi bi-puzzle me-1"></i> Componentes Modulares
                    </h5>
                    <p className="small text-muted">
                      Diseño atómico y desacoplado dividido en capas funcionales:
                    </p>
                    <ul className="small">
                      <li><strong>Comunes:</strong> HeaderNavbar</li>
                      <li><strong>Punto de Venta:</strong> ProductCard, CartSection, TicketThermalModal</li>
                      <li><strong>Administración:</strong> KpiGrid, AnalyticsCharts, InventoryManagement, SalesHistory, ProductFormModal</li>
                      <li><strong>Servicios:</strong> RestExplorer</li>
                    </ul>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="p-3 bg-light rounded border h-100">
                    <h5 className="fw-bold text-success">
                      <i className="bi bi-ui-checks me-1"></i> Formularios Controlados
                    </h5>
                    <p className="small text-muted">
                      Gestión del estado de los inputs sincronizado en memoria:
                    </p>
                    <ul className="small">
                      <li>Login real con usuario y contraseña (sesión server-side)</li>
                      <li>Selección dinámica Boleta vs Factura</li>
                      <li>Validación de RUC real contra SUNAT (Decolecta)</li>
                      <li>Validación de DNI real contra RENIEC (Decolecta)</li>
                      <li>Alta/Edición de productos con validación numérica</li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* TEMA 3 */}
        <Tab eventKey="hooks" title="3. Hooks en React">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-4">
              <h4 className="text-purple fw-bold mb-3">3. Hooks en React: State, Context, Ref & Resource</h4>

              <div className="accordion mb-4">
                {/* 1. State Hooks */}
                <div className="p-3 bg-light rounded border mb-3">
                  <h5 className="fw-bold text-primary">
                    <Badge bg="primary" className="me-2">State Hooks</Badge>
                    <code>useState</code> y <code>useReducer</code>
                  </h5>
                  <p className="small text-muted">
                    <code>useState</code> gestiona estados atómicos locales (filtros, modales, formularios).
                    <code>useReducer</code> gestiona máquinas de estado complejas; en TAMBOPOS se implementó en <code>useCartReducer.ts</code> para manejar acciones del carrito (<code>ADD_ITEM</code>, <code>CHANGE_QUANTITY</code>, <code>REMOVE_ITEM</code>, <code>CLEAR_CART</code>) con persistencia sincronizada.
                  </p>
                </div>

                {/* 2. Context Hooks */}
                <div className="p-3 bg-light rounded border mb-3">
                  <h5 className="fw-bold text-success">
                    <Badge bg="success" className="me-2">Context Hooks</Badge>
                    <code>createContext</code> y <code>useContext</code>
                  </h5>
                  <p className="small text-muted">
                    Evitan el problema de <em>prop drilling</em>. En TAMBOPOS creamos:
                  </p>
                  <ul className="small">
                    <li><code>AuthContext</code>: Administra la sesión activa (Cajero vs Administrador).</li>
                    <li><code>PosContext</code>: Comparte el catálogo, estado del carrito, comprobantes, cupones y driver REST activo.</li>
                  </ul>
                </div>

                {/* 3. Ref Hooks */}
                <div className="p-3 bg-light rounded border mb-3">
                  <h5 className="fw-bold text-warning text-dark">
                    <Badge bg="warning" text="dark" className="me-2">Ref Hooks</Badge>
                    <code>useRef</code>
                  </h5>
                  <p className="small text-muted">
                    Permite persistir referencias mutables sin disparar re-renderizados y acceder directamente a nodos del DOM real. En TAMBOPOS se utilizó para:
                  </p>
                  <ul className="small">
                    <li>Enfoque automático del cursor en el buscador de inventario (<code>searchInputRef.current.focus()</code>).</li>
                    <li>Referencia al nodo del ticket térmico en <code>useTicketPrint</code> para clonar su HTML e invocar la impresión con ventana emergente.</li>
                  </ul>
                </div>

                {/* 4. Resource Hooks */}
                <div className="p-3 bg-light rounded border">
                  <h5 className="fw-bold text-purple">
                    <Badge bg="purple" className="me-2">Resource Hooks</Badge>
                    Patrón <code>useResource</code> (React 19 / Suspense Ready)
                  </h5>
                  <p className="small text-muted">
                    Un <strong>Resource Hook</strong> encapsula la carga, caché, estado de suspensión y revalidación de un recurso asíncrono.
                  </p>
                  <div className="p-3 bg-white border rounded">
                    <h6 className="fw-bold small mb-2">Demostración en Vivo de Resource Hook:</h6>
                    <div className="d-flex align-items-center gap-3">
                      <Button
                        size="sm"
                        variant="purple"
                        onClick={() => reloadResource()}
                        disabled={loadingResource}
                      >
                        {loadingResource ? 'Cargando Recurso...' : 'Disparar useResource("Bebidas")'}
                      </Button>
                      <span className="small text-muted">
                        {testProducts ? `Recurso cargado: ${testProducts.length} productos obtenidos.` : 'Recurso aún no ejecutado.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* TEMA 4 */}
        <Tab eventKey="services" title="4. Servicios REST (Fetch, Axios, Alova)">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-4">
              <h4 className="text-purple fw-bold mb-3">4. Servicios en React: Fetch API, Axios y Alova</h4>
              
              <p className="text-muted small">
                Para el proyecto TAMBOPOS construimos una capa de servicios REST modular que permite alternar dinámicamente entre las 3 tecnologías líderes:
              </p>

              <Row className="g-3">
                <Col md={4}>
                  <Card className="h-100 border">
                    <Card.Header className="bg-info-subtle fw-bold text-info-emphasis">
                      1. Fetch API (Nativo)
                    </Card.Header>
                    <Card.Body className="small">
                      <p>
                        API nativa estándar del navegador disponible globalmente en JavaScript moderno. No requiere dependencias externas.
                      </p>
                      <strong>En TAMBOPOS:</strong> Implementado en <code>fetchService.ts</code> con gestión explícita de opciones HTTP, deserialización <code>res.json()</code> y manejo de respuestas 200/400.
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="h-100 border">
                    <Card.Header className="bg-primary-subtle fw-bold text-primary">
                      2. Axios
                    </Card.Header>
                    <Card.Body className="small">
                      <p>
                        Cliente HTTP basado en promesas con soporte de interceptores de Request y Response, serialización JSON automática y tipado robusto.
                      </p>
                      <strong>En TAMBOPOS:</strong> Implementado en <code>axiosService.ts</code> con <code>axiosClient</code> configurado con headers personalizados y medición de tiempos en interceptores.
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="h-100 border">
                    <Card.Header className="bg-success-subtle fw-bold text-success">
                      3. Alova.js
                    </Card.Header>
                    <Card.Body className="small">
                      <p>
                        Biblioteca de última generación diseñada especialmente para interfaces reactivas, con caché en memoria integrado, deduplicación de peticiones y Method Instances.
                      </p>
                      <strong>En TAMBOPOS:</strong> Implementado en <code>alovaService.ts</code> con invalidación automática de caché al registrar una venta o crear un producto.
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* TEMA 5 */}
        <Tab eventKey="integration" title="5. Integración de Temas">
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-4">
              <h4 className="text-purple fw-bold mb-3">5. Integración Total: Arquitectura TAMBOPOS</h4>
              
              <Alert variant="warning" className="border-0 shadow-sm">
                <h6 className="fw-bold mb-1">
                  <i className="bi bi-check-circle-fill me-1"></i> Síntesis del Proyecto
                </h6>
                <p className="small mb-0">
                  El sistema POS unifica la navegación SPA (React Router), el diseño estilizado con Bootstrap 5, la gestión de estado predecible mediante Hooks (State, Context, Ref, Resource) y el consumo desacoplado de servicios REST (Fetch, Axios, Alova).
                </p>
              </Alert>

              <div className="architecture-diagram p-3 bg-light rounded border font-monospace small">
                <div className="fw-bold text-purple mb-2">Diagrama de Capas de la Aplicación:</div>
                <div className="ps-3 border-start border-3 border-purple">
                  <div>📁 <strong>UI & Pages:</strong> CajeroPOS | AdminDashboard | RestExplorer | GuideView</div>
                  <div className="my-1">📁 <strong>Componentes Bootstrap:</strong> Navbar, ProductCard, CartSection, KpiGrid, Tables, Modals</div>
                  <div className="my-1">📁 <strong>Hooks:</strong> useCartReducer (State), useAuth / usePos (Context), useRefHooks (Ref), useResource (Resource)</div>
                  <div className="my-1">📁 <strong>Servicios REST:</strong> ApiClient ➔ [FetchRestService | AxiosRestService | AlovaRestService]</div>
                  <div>📁 <strong>Backend Real:</strong> Node + PostgreSQL (server/), autenticación JWT, SUNAT/RENIEC vía Decolecta</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

