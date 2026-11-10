import React, { useState } from 'react';

/**
 * COMPONENTE EN LENGUAJE JSX (JavaScript XML)
 * Archivo: JsxComponent.jsx
 * - No incluye anotaciones de tipo estáticas de TypeScript.
 * - Emplea sintaxis estándar de JavaScript ES6+ y JSX.
 * - Permite interpolar expresiones con { } y retornar fragmentos <> ... </>.
 */
export function JsxComponent({ titulo, mensajeInicial, initialCount = 0 }) {
  const [contador, setContador] = useState(initialCount);
  const [nombre, setNombre] = useState('Invitado');

  const fechaActual = new Date().toLocaleDateString();

  return (
    <div className="card border-primary mb-3 shadow-sm">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <span className="fw-bold">
          <i className="bi bi-filetype-jsx me-2"></i>Componente JSX Puro (.jsx)
        </span>
        <span className="badge bg-light text-primary">ReactJS Estándar</span>
      </div>
      <div className="card-body">
        <h5 className="card-title text-primary">{titulo}</h5>
        <p className="card-text text-muted">{mensajeInicial}</p>

        {/* Demostración de Expresiones JSX */}
        <div className="bg-light p-3 rounded-3 mb-3 border">
          <div className="small text-muted mb-1">
            <strong>Fecha calculada:</strong> {fechaActual}
          </div>
          <div className="small text-muted mb-2">
            <strong>Usuario activo:</strong> {nombre}
          </div>

          <div className="input-group input-group-sm mb-2" style={{ maxWidth: '300px' }}>
            <span className="input-group-text">Nombre:</span>
            <input
              type="text"
              className="form-control"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe tu nombre"
            />
          </div>

          <div className="d-flex align-items-center gap-2 mt-2">
            <span className="fw-semibold">Contador JSX:</span>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setContador(contador - 1)}
            >
              -1
            </button>
            <span className="badge bg-primary fs-6 px-3">{contador}</span>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setContador(contador + 1)}
            >
              +1
            </button>
          </div>
        </div>

        <div className="small text-secondary">
          <i className="bi bi-info-circle me-1"></i>
          Este componente está escrito íntegramente en <code>.jsx</code> sin tipado estático, mostrando la flexibilidad de JavaScript dinámico en React.
        </div>
      </div>
    </div>
  );
}

