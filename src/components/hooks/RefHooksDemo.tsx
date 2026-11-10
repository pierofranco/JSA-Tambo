import React, { useRef, useState, useEffect } from 'react';
import { useRefFocus } from '../../hooks/useRefFocus';

export const RefHooksDemo: React.FC = () => {
  // 1. Ref Hook para acceso DOM con helper
  const { elementRef, focus, select } = useRefFocus<HTMLInputElement>(false);

  // 2. Ref Hook para persistir valor sin disparar re-render
  const renderCountRef = useRef<number>(0);
  const prevTextoRef = useRef<string>('');

  const [texto, setTexto] = useState<string>('Código de Barras Tambo: 775127100012');
  const [segundos, setSegundos] = useState<number>(0);
  const [activoTimer, setActivoTimer] = useState<boolean>(false);
  const intervalIdRef = useRef<any>(null);

  // Cada render incrementa el contador de renders en renderCountRef
  renderCountRef.current += 1;

  useEffect(() => {
    prevTextoRef.current = texto;
  }, [texto]);

  // Manejo de temporizador usando useRef para el intervalId
  const iniciarTimer = () => {
    if (intervalIdRef.current !== null) return;
    setActivoTimer(true);
    intervalIdRef.current = setInterval(() => {
      setSegundos(prev => prev + 1);
    }, 1000);
  };

  const pausarTimer = () => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      setActivoTimer(false);
    }
  };

  const resetTimer = () => {
    pausarTimer();
    setSegundos(0);
  };

  useEffect(() => {
    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4">
      <div className="card-header bg-white border-0 pt-3 pb-0">
        <h5 className="fw-bold text-tambo-purple mb-1">
          <i className="bi bi-pin-angle-fill me-2 text-danger"></i>
          3. Ref Hooks: <code>useRef</code> (Acceso DOM & Persistencia Mutable)
        </h5>
        <p className="text-muted small mb-0">
          <code>useRef</code> almacena un objeto mutable cuya propiedad <code>.current</code> persiste a través de todos los renders sin forzar actualizaciones visuales.
        </p>
      </div>

      <div className="card-body">
        <div className="row g-4">
          {/* Uso 1: Manipulación directa del DOM */}
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded-3 bg-light h-100">
              <h6 className="fw-bold text-dark mb-2">
                <i className="bi bi-cursor-fill me-1 text-primary"></i> Caso A: Foco e Interacción con el DOM
              </h6>
              <p className="small text-muted">
                Control directo del nodo input nativo sin re-renderizar el componente.
              </p>

              <div className="mb-2">
                <input
                  ref={elementRef}
                  type="text"
                  className="form-control form-control-sm"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={focus}>
                  <i className="bi bi-bullseye me-1"></i> Dar Foco (.focus())
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={select}>
                  <i className="bi bi-fonts me-1"></i> Seleccionar Texto (.select())
                </button>
              </div>

              <div className="mt-3 small text-muted">
                <strong>Valor previo (en ref):</strong> "{prevTextoRef.current}"
              </div>
            </div>
          </div>

          {/* Uso 2: Persistencia sin re-renders (Timer & Render Counter) */}
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded-3 bg-light h-100">
              <h6 className="fw-bold text-dark mb-2">
                <i className="bi bi-stopwatch me-1 text-danger"></i> Caso B: Persistencia de ID de Intervalo & Renders
              </h6>
              <p className="small text-muted">
                El ID del timer y el contador de renders se guardan en <code>useRef</code> para no causar bucles infinitos.
              </p>

              <div className="d-flex align-items-center justify-content-between bg-white p-2 rounded border mb-2">
                <span className="small fw-semibold">Temporizador de Sesión:</span>
                <span className="badge bg-dark fs-6 font-monospace">{segundos} s</span>
              </div>

              <div className="d-flex gap-2 mb-3">
                {!activoTimer ? (
                  <button className="btn btn-sm btn-success" onClick={iniciarTimer}>
                    <i className="bi bi-play-fill me-1"></i> Iniciar Timer
                  </button>
                ) : (
                  <button className="btn btn-sm btn-warning" onClick={pausarTimer}>
                    <i className="bi bi-pause-fill me-1"></i> Pausar
                  </button>
                )}
                <button className="btn btn-sm btn-outline-secondary" onClick={resetTimer}>
                  Reset
                </button>
              </div>

              <div className="small text-muted">
                <i className="bi bi-arrow-repeat me-1 text-primary"></i>
                Este componente ha realizado <strong>{renderCountRef.current} renders</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

