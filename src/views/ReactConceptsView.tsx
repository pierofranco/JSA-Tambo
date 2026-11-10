import React, { useState } from 'react';
import { JsxComponent } from '../components/concepts/JsxComponent.jsx';
import { TsxComponent } from '../components/concepts/TsxComponent.tsx';

export const ReactConceptsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'intro' | 'jsx-tsx' | 'bootstrap' | 'elementos'>('intro');
  const [logMensaje, setLogMensaje] = useState<string | null>(null);

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-tambo-purple mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-mortarboard-fill text-tambo-yellow"></i>
          <span>Módulo 1 & 2: Introducción a React & Elementos Fundamentales</span>
        </h3>
        <p className="text-muted small mb-0">
          Guía conceptual, instalación, comparación en vivo de JSX vs TSX, integración con Bootstrap 5, navegación y componentes.
        </p>
      </div>

      {/* Tabs de Navegación del Módulo */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border">
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 ${activeTab === 'intro' ? 'active bg-tambo-purple text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('intro')}
          >
            <i className="bi bi-lightbulb me-1"></i> Concepto & Creación de Proyectos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 ${activeTab === 'jsx-tsx' ? 'active bg-tambo-purple text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('jsx-tsx')}
          >
            <i className="bi bi-code-slash me-1"></i> Lenguaje JSX vs Lenguaje TSX
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 ${activeTab === 'bootstrap' ? 'active bg-tambo-purple text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('bootstrap')}
          >
            <i className="bi bi-bootstrap me-1"></i> Instalación de Bootstrap
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-3 ${activeTab === 'elementos' ? 'active bg-tambo-purple text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('elementos')}
          >
            <i className="bi bi-ui-checks me-1"></i> Elementos: Navegación, Componentes y Forms
          </button>
        </li>
      </ul>

      {/* TAB 1: Concepto & Creación */}
      {activeTab === 'intro' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
              <h5 className="fw-bold text-tambo-purple mb-3">
                <i className="bi bi-book me-2"></i>1. ¿Qué es React y cómo funciona?
              </h5>
              <p className="text-muted small">
                React es una biblioteca de JavaScript declarativa, eficiente y flexible desarrollada por Meta para construir interfaces de usuario interactivas basadas en componentes.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="p-3 bg-light rounded-3 border">
                  <h6 className="fw-bold text-dark mb-1">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>Virtual DOM (Document Object Model)
                  </h6>
                  <p className="small text-secondary mb-0">
                    React mantiene una copia ligera del DOM real en memoria. Cuando el estado cambia, calcula las diferencias (Reconciliation / Diffing algorithm) y actualiza únicamente los nodos específicos en el navegador, garantizando máximo rendimiento.
                  </p>
                </div>

                <div className="p-3 bg-light rounded-3 border">
                  <h6 className="fw-bold text-dark mb-1">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>Paradigma Declarativo
                  </h6>
                  <p className="small text-secondary mb-0">
                    A diferencia del DOM imperativo tradicional de JavaScript donde hacías <code>document.getElementById()</code> y mutabas el innerHTML manualmente, en React describes <em>cómo debería verse la interfaz</em> en función de los datos actuales, y React se encarga de sincronizar la pantalla.
                  </p>
                </div>

                <div className="p-3 bg-light rounded-3 border">
                  <h6 className="fw-bold text-dark mb-1">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>Arquitectura Basada en Componentes
                  </h6>
                  <p className="small text-secondary mb-0">
                    Divide la interfaz en piezas independientes, reutilizables y aisladas (Navbar, ProductCard, Cart, etc.) que manejan su propio estado y props.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
              <h5 className="fw-bold text-tambo-purple mb-3">
                <i className="bi bi-terminal me-2"></i>2. Instalación y Creación de Proyectos
              </h5>
              <p className="text-muted small">
                En el ecosistema moderno, los proyectos de React se crean utilizando <strong>Vite</strong>, un bundler ultrarrápido impulsado por ES Modules nativos y Rollup.
              </p>

              <h6 className="fw-semibold small text-dark mb-2">Comandos de Inicialización:</h6>
              <pre className="code-block mb-3">
{`# 1. Crear proyecto React con TypeScript y Vite
npm create vite@latest jsa-tambo-react -- --template react-ts

# 2. Ingresar al directorio del proyecto
cd jsa-tambo-react

# 3. Instalar librerías requeridas (Bootstrap, Router, Axios, Alova)
npm install bootstrap bootstrap-icons react-router-dom axios alova

# 4. Iniciar servidor de desarrollo con Hot Module Replacement (HMR)
npm run dev`}
              </pre>

              <div className="alert alert-info py-2 px-3 small mb-0">
                <i className="bi bi-info-circle-fill me-1"></i>
                <strong>Configuración del Proyecto JSA-Tambo:</strong> El proyecto actual se ejecuta bajo Vite 5 con soporte dual para componentes <code>.jsx</code> y <code>.tsx</code>, compilador TypeScript y empaquetado de producción optimizado.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JSX vs TSX en Vivo */}
      {activeTab === 'jsx-tsx' && (
        <div>
          <div className="alert alert-secondary py-3 px-4 rounded-4 mb-4">
            <h6 className="fw-bold mb-1">
              <i className="bi bi-code-square me-2"></i>Comparativa Práctica: Lenguaje JSX (.jsx) vs Lenguaje TSX (.tsx)
            </h6>
            <p className="small mb-0 text-muted">
              A continuación se renderizan dos componentes funcionales reales en vivo: uno programado en <code>JsxComponent.jsx</code> (ReactJS clásico sin tipado) y otro en <code>TsxComponent.tsx</code> (React con TypeScript fuertemente tipado).
            </p>
          </div>

          {logMensaje && (
            <div className="alert alert-success py-2 px-3 small mb-3">
              <i className="bi bi-bell me-1"></i> Evento emitido desde componente TSX: <strong>{logMensaje}</strong>
            </div>
          )}

          <div className="row g-4">
            {/* LADO IZQUIERDO: JSX */}
            <div className="col-12 col-lg-6">
              <JsxComponent
                titulo="Demostración de Lenguaje JSX"
                mensajeInicial="Este componente fue escrito en JsxComponent.jsx. Emplea sintaxis JSX directa donde HTML y JavaScript se combinan naturalmente."
                initialCount={5}
              />

              <div className="card shadow-sm border-0 rounded-3 mt-3">
                <div className="card-header bg-dark text-white py-2 small fw-bold">
                  Estructura de Código en <code>JsxComponent.jsx</code>
                </div>
                <pre className="code-block mb-0 rounded-bottom">
{`// Componente funcional en JavaScript puro
export function JsxComponent({ titulo, mensajeInicial, initialCount = 0 }) {
  const [contador, setContador] = useState(initialCount);

  // JSX: Interpolación con llaves { } y etiquetas HTML
  return (
    <div className="card">
      <h5>{titulo}</h5>
      <p>{mensajeInicial}</p>
      <button onClick={() => setContador(contador + 1)}>
        Contador: {contador}
      </button>
    </div>
  );
}`}
                </pre>
              </div>
            </div>

            {/* LADO DERECHO: TSX */}
            <div className="col-12 col-lg-6">
              <TsxComponent
                titulo="Demostración de Lenguaje TSX"
                subtitulo="Escrito en TsxComponent.tsx con validación estricta de interfaces y tipos"
                nivelAcceso="ADMIN"
                productosDisponibles={48}
                onAccionCompletada={(msg) => setLogMensaje(msg)}
              />

              <div className="card shadow-sm border-0 rounded-3 mt-3">
                <div className="card-header bg-dark text-white py-2 small fw-bold">
                  Estructura de Código en <code>TsxComponent.tsx</code>
                </div>
                <pre className="code-block mb-0 rounded-bottom">
{`// 1. Definición estricta de Contrato con TypeScript
export interface TsxComponentProps {
  titulo: string;
  subtitulo: string;
  nivelAcceso: 'ADMIN' | 'CAJERO' | 'SUPERVISOR';
  productosDisponibles?: number;
  onAccionCompletada?: (mensaje: string) => void;
}

// 2. Componente fuertemente tipado
export const TsxComponent: React.FC<TsxComponentProps> = ({
  titulo,
  nivelAcceso,
  onAccionCompletada
}) => {
  const [descuento, setDescuento] = useState<number>(5);
  // El compilador detecta errores antes de ejecutar el código!
  return <div>{titulo} ({nivelAcceso})</div>;
};`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Bootstrap en React */}
      {activeTab === 'bootstrap' && (
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
              <h5 className="fw-bold text-tambo-purple mb-3">
                <i className="bi bi-bootstrap-fill me-2 text-primary"></i>Instalación y Configuración de Bootstrap 5
              </h5>
              <p className="text-muted small">
                Bootstrap provee una grilla responsiva de 12 columnas, utilitarios de espaciado, componentes preestilizados y accesibilidad.
              </p>

              <h6 className="fw-semibold small text-dark mb-1">1. Instalación de paquetes:</h6>
              <pre className="code-block mb-3">
{`npm install bootstrap bootstrap-icons`}
              </pre>

              <h6 className="fw-semibold small text-dark mb-1">2. Importación en <code>src/index.css</code> o <code>src/main.tsx</code>:</h6>
              <pre className="code-block mb-3">
{`/* Importación de estilos globales de Bootstrap y sus íconos */
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';`}
              </pre>

              <p className="small text-secondary mb-0">
                Al importar Bootstrap en el archivo CSS global o en el punto de entrada de React, todas las clases como <code>row</code>, <code>col-md-6</code>, <code>card</code>, <code>btn</code> y <code>badge</code> quedan inmediatamente disponibles en todo el árbol de componentes.
              </p>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
              <h5 className="fw-bold text-tambo-purple mb-3">
                <i className="bi bi-palette-fill me-2 text-warning"></i>Personalización con Tema Tambo
              </h5>
              <p className="text-muted small">
                Combinamos las clases de Bootstrap con variables CSS nativas para aplicar la identidad corporativa de Tambo (Púrpura y Amarillo).
              </p>

              <div className="p-3 bg-light rounded-3 border mb-3">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <button className="btn btn-tambo-purple">.btn-tambo-purple</button>
                  <button className="btn btn-tambo-yellow">.btn-tambo-yellow</button>
                  <span className="badge bg-tambo-purple p-2">Púrpura Tambo</span>
                  <span className="badge bg-tambo-yellow p-2">Amarillo Tambo</span>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <div className="p-2 text-center rounded bg-tambo-purple text-white small fw-bold">
                      Color Primario: #6f11c7
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 text-center rounded bg-tambo-yellow text-dark small fw-bold">
                      Color Acento: #ffd600
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-success py-2 px-3 small mb-0">
                <i className="bi bi-check2-circle me-1"></i>
                <strong>Totalmente responsivo:</strong> La grilla de Bootstrap adapta automáticamente el catálogo a dispositivos móviles, tablets y pantallas de escritorio.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Elementos de React */}
      {activeTab === 'elementos' && (
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-primary text-white p-2 rounded-3">
                  <i className="bi bi-signpost-split fs-4"></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">1. Navegación</h5>
              </div>
              <p className="small text-muted">
                Implementada mediante <code>react-router-dom</code> versión 6+.
              </p>
              <ul className="small text-secondary ps-3 mb-3">
                <li><code>&lt;BrowserRouter&gt;</code> envuelve la app.</li>
                <li><code>&lt;Routes&gt;</code> y <code>&lt;Route&gt;</code> definen las rutas SPA.</li>
                <li><code>&lt;NavLink&gt;</code> gestiona clases activas para estilos del menú.</li>
              </ul>
              <div className="bg-light p-2 rounded border small font-monospace">
                /pos • /productos • /conceptos • /hooks • /servicios
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-success text-white p-2 rounded-3">
                  <i className="bi bi-puzzle fs-4"></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">2. Componentes</h5>
              </div>
              <p className="small text-muted">
                Funciones puras de JavaScript/TypeScript que retornan JSX/TSX.
              </p>
              <ul className="small text-secondary ps-3 mb-3">
                <li><strong>Reutilizables:</strong> <code>ProductCard</code> renderiza 48 productos con un solo molde.</li>
                <li><strong>Componibles:</strong> <code>CartSidebar</code> integra subcomponentes de cantidades y comprobantes.</li>
                <li><strong>Props:</strong> Comunicación unidireccional de datos de padre a hijo.</li>
              </ul>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm border-0 rounded-4 p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-warning text-dark p-2 rounded-3">
                  <i className="bi bi-input-cursor-text fs-4"></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">3. Formularios</h5>
              </div>
              <p className="small text-muted">
                Formularios controlados vinculados al estado de React.
              </p>
              <ul className="small text-secondary ps-3 mb-3">
                <li><code>value</code> y <code>onChange</code> para sincronizar cada input.</li>
                <li>Validaciones en tiempo real para DNI (8 dígitos) y RUC (11 dígitos).</li>
                <li>Clases Bootstrap <code>is-invalid</code> e <code>is-valid</code> con feedback al usuario.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

