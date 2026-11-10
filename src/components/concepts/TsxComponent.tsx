import React, { useState } from 'react';

/**
 * COMPONENTE EN LENGUAJE TSX (TypeScript JSX)
 * Archivo: TsxComponent.tsx
 * - Define contratos estrictos mediante Interfaces y Types.
 * - Validación en tiempo de compilación para Props y Estados.
 * - Tipado explícito de eventos de React (React.ChangeEvent, React.MouseEvent).
 */

export interface TsxComponentProps {
  titulo: string;
  subtitulo: string;
  nivelAcceso: 'ADMIN' | 'CAJERO' | 'SUPERVISOR';
  productosDisponibles?: number;
  onAccionCompletada?: (mensaje: string) => void;
}

export const TsxComponent: React.FC<TsxComponentProps> = ({
  titulo,
  subtitulo,
  nivelAcceso,
  productosDisponibles = 48,
  onAccionCompletada
}) => {
  const [descuentoExtra, setDescuentoExtra] = useState<number>(5);
  const [registroAuditoria, setRegistroAuditoria] = useState<string[]>([]);

  const handleAplicarDescuento = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const nuevoLog = `Descuento ${descuentoExtra}% aplicado por ${nivelAcceso} a las ${new Date().toLocaleTimeString()}`;
    setRegistroAuditoria(prev => [nuevoLog, ...prev]);

    if (onAccionCompletada) {
      onAccionCompletada(nuevoLog);
    }
  };

  const handlePorcentajeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= 50) {
      setDescuentoExtra(val);
    }
  };

  return (
    <div className="card border-info mb-3 shadow-sm">
      <div className="card-header bg-info text-dark d-flex justify-content-between align-items-center">
        <span className="fw-bold">
          <i className="bi bi-filetype-tsx me-2"></i>Componente TSX Tipado (.tsx)
        </span>
        <span className="badge bg-dark text-info">TypeScript Seguro</span>
      </div>
      <div className="card-body">
        <h5 className="card-title text-dark fw-bold">{titulo}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{subtitulo}</h6>

        {/* Parámetros fuertemente tipados */}
        <div className="bg-light p-3 rounded-3 mb-3 border">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <span className="badge bg-primary">Nivel: {nivelAcceso}</span>
            </div>
            <div className="col-auto">
              <span className="badge bg-success">Stock Global: {productosDisponibles} SKUs</span>
            </div>
          </div>

          <hr className="my-2" />

          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <label className="form-label small mb-0 fw-semibold">Descuento Especial (%):</label>
            </div>
            <div className="col-auto">
              <input
                type="number"
                min="0"
                max="50"
                className="form-control form-control-sm"
                style={{ width: '80px' }}
                value={descuentoExtra}
                onChange={handlePorcentajeChange}
              />
            </div>
            <div className="col-auto">
              <button
                className="btn btn-sm btn-dark"
                onClick={handleAplicarDescuento}
              >
                <i className="bi bi-shield-check me-1"></i> Aplicar con Tipado TSX
              </button>
            </div>
          </div>

          {registroAuditoria.length > 0 && (
            <div className="mt-3">
              <div className="small fw-semibold text-muted mb-1">Registro tipado:</div>
              <ul className="list-unstyled mb-0" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {registroAuditoria.map((log, idx) => (
                  <li key={idx} className="small text-secondary font-monospace">
                    • {log}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="small text-secondary">
          <i className="bi bi-check-circle-fill text-success me-1"></i>
          Beneficios TSX: Autocompletado inteligente en IDE, prevención de bugs en tiempo de compilación y refactorización guiada por contratos de interfaz.
        </div>
      </div>
    </div>
  );
};

