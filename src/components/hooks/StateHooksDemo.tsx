import React, { useState, useReducer } from 'react';

// Tipo de acción para useReducer
type ContadorAction =
  | { type: 'INCREMENTAR'; delta?: number }
  | { type: 'DISMINUIR'; delta?: number }
  | { type: 'MULTIPLICAR'; factor: number }
  | { type: 'RESET'; valorInicial: number };

interface ContadorState {
  contador: number;
  historialOperaciones: string[];
}

function reducer(state: ContadorState, action: ContadorAction): ContadorState {
  switch (action.type) {
    case 'INCREMENTAR': {
      const delta = action.delta ?? 1;
      const nuevo = state.contador + delta;
      return {
        contador: nuevo,
        historialOperaciones: [`+${delta} → ${nuevo}`, ...state.historialOperaciones.slice(0, 4)]
      };
    }
    case 'DISMINUIR': {
      const delta = action.delta ?? 1;
      const nuevo = state.contador - delta;
      return {
        contador: nuevo,
        historialOperaciones: [`-${delta} → ${nuevo}`, ...state.historialOperaciones.slice(0, 4)]
      };
    }
    case 'MULTIPLICAR': {
      const nuevo = state.contador * action.factor;
      return {
        contador: nuevo,
        historialOperaciones: [`x${action.factor} → ${nuevo}`, ...state.historialOperaciones.slice(0, 4)]
      };
    }
    case 'RESET':
      return {
        contador: action.valorInicial,
        historialOperaciones: [`Reset → ${action.valorInicial}`, ...state.historialOperaciones.slice(0, 4)]
      };
    default:
      return state;
  }
}

export const StateHooksDemo: React.FC = () => {
  // 1. useState: estado simple
  const [nombreCajero, setNombreCajero] = useState<string>('Piero F.');
  const [activo, setActivo] = useState<boolean>(true);

  // 2. useReducer: máquina de estados compleja
  const [state, dispatch] = useReducer(reducer, {
    contador: 10,
    historialOperaciones: ['Inicio en 10']
  });

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4">
      <div className="card-header bg-white border-0 pt-3 pb-0">
        <h5 className="fw-bold text-tambo-purple mb-1">
          <i className="bi bi-toggles me-2 text-warning"></i>
          1. State Hooks: <code>useState</code> y <code>useReducer</code>
        </h5>
        <p className="text-muted small mb-0">
          Los State Hooks permiten a los componentes funcionales mantener y actualizar memoria reactiva.
        </p>
      </div>

      <div className="card-body">
        <div className="row g-4">
          {/* useState */}
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded-3 bg-light h-100">
              <h6 className="fw-bold text-primary mb-2">
                <i className="bi bi-box-arrow-in-right me-1"></i> Demostración de <code>useState</code>
              </h6>
              <p className="small text-muted">
                Ideal para estados primitivos independientes como textos, banderas booleanas o filtros.
              </p>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Nombre de Cajero:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={nombreCajero}
                  onChange={(e) => setNombreCajero(e.target.value)}
                />
              </div>

              <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                <span className="small">Estado de Caja:</span>
                <button
                  className={`btn btn-sm ${activo ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => setActivo(!activo)}
                >
                  <i className={`bi ${activo ? 'bi-check-circle' : 'bi-pause-circle'} me-1`}></i>
                  {activo ? 'Caja Abierta' : 'Caja Cerrada'}
                </button>
              </div>
            </div>
          </div>

          {/* useReducer */}
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded-3 bg-light h-100">
              <h6 className="fw-bold text-success mb-2">
                <i className="bi bi-gear-wide-connected me-1"></i> Demostración de <code>useReducer</code>
              </h6>
              <p className="small text-muted">
                Ideal para lógica de estado compleja con múltiples subvalores y transiciones estructuradas.
              </p>

              <div className="d-flex align-items-center justify-content-between mb-3 bg-white p-2 rounded border">
                <span className="small fw-semibold">Valor Acumulado:</span>
                <span className="badge bg-success fs-5 px-3">{state.contador}</span>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-2">
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => dispatch({ type: 'INCREMENTAR', delta: 1 })}
                >
                  +1
                </button>
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => dispatch({ type: 'INCREMENTAR', delta: 5 })}
                >
                  +5
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => dispatch({ type: 'DISMINUIR', delta: 1 })}
                >
                  -1
                </button>
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => dispatch({ type: 'MULTIPLICAR', factor: 2 })}
                >
                  x2
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => dispatch({ type: 'RESET', valorInicial: 0 })}
                >
                  Reset (0)
                </button>
              </div>

              <div className="small text-muted">
                <strong>Auditoría Reducer:</strong> {state.historialOperaciones.join(' | ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

