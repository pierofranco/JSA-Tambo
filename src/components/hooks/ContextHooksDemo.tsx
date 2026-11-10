import React from 'react';
import { useCart } from '../../hooks/useCart';
import { useStore } from '../../hooks/useStore';

export const ContextHooksDemo: React.FC = () => {
  const { totalUnidades, totales } = useCart();
  const { cajeroActivo, setCajeroActivo, sucursalActiva, servicioRestActivo, setServicioRestActivo } = useStore();

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4">
      <div className="card-header bg-white border-0 pt-3 pb-0">
        <h5 className="fw-bold text-tambo-purple mb-1">
          <i className="bi bi-diagram-2-fill me-2 text-info"></i>
          2. Context Hooks: <code>createContext</code> y <code>useContext</code>
        </h5>
        <p className="text-muted small mb-0">
          Evitan el "Prop Drilling" proveyendo acceso instantáneo a estados globales en cualquier nivel del árbol de componentes.
        </p>
      </div>

      <div className="card-body">
        <div className="row g-3">
          {/* CartContext en vivo */}
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded-3 bg-light h-100">
              <h6 className="fw-bold text-dark mb-2">
                <i className="bi bi-cart-check me-1 text-primary"></i> Consumiendo <code>CartContext</code>
              </h6>
              <p className="small text-muted">
                Este bloque lee el contexto del carrito sin necesidad de que el componente padre le pase props.
              </p>

              <ul className="list-group list-group-flush rounded-3 border">
                <li className="list-group-item d-flex justify-content-between align-items-center small">
                  <span>Total Unidades Seleccionadas:</span>
                  <span className="badge bg-primary rounded-pill">{totalUnidades}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center small">
                  <span>Subtotal Actual del POS:</span>
                  <span className="fw-bold text-success">S/ {totales.subtotalFinal.toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center small">
                  <span>Descuentos Acumulados:</span>
                  <span className="text-danger">- S/ {totales.descuentoTotal.toFixed(2)}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* StoreContext en vivo */}
          <div className="col-12 col-md-6">
            <div className="p-3 border rounded-3 bg-light h-100">
              <h6 className="fw-bold text-dark mb-2">
                <i className="bi bi-shop-window me-1 text-warning"></i> Consumiendo & Modificando <code>StoreContext</code>
              </h6>
              <p className="small text-muted">
                Cualquier cambio aquí se refleja inmediatamente en la barra superior (Navbar) y en el POS.
              </p>

              <div className="mb-2">
                <label className="form-label small fw-semibold">Cajero en Contexto:</label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    value={cajeroActivo}
                    onChange={(e) => setCajeroActivo(e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-2 align-items-center pt-2">
                <div className="col-6 small text-muted">
                  <strong>Sucursal:</strong> {sucursalActiva}
                </div>
                <div className="col-6 text-end">
                  <span className="badge bg-dark">REST: {servicioRestActivo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

