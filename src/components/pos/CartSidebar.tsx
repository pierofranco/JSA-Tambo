import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useStore } from '../../hooks/useStore';
import { TipoDocumento } from '../../types';
import { consultarDocumentoIdentidad } from '../../services/reniecService';

interface CartSidebarProps {
  onTicketGenerado: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onTicketGenerado }) => {
  const { items, totales, cambiarCantidad, eliminarDelCarrito, vaciarCarrito, procesarVenta } = useCart();
  const { clienteActivo, setClienteActivo, cajeroActivo, sucursalActiva, servicioRestActivo } = useStore();

  const [tipoDoc, setTipoDoc] = useState<TipoDocumento>(clienteActivo.tipoDoc || 'DNI');
  const [numDoc, setNumDoc] = useState<string>(clienteActivo.numDoc || '');
  const [consultandoDoc, setConsultandoDoc] = useState<boolean>(false);
  const [mensajeDoc, setMensajeDoc] = useState<{ tipo: 'success' | 'danger' | 'info'; texto: string } | null>(null);

  // Consulta REST de Cliente
  const handleConsultarCliente = async () => {
    if (!numDoc.trim()) {
      setMensajeDoc({ tipo: 'info', texto: 'Ingresa un número de documento' });
      return;
    }

    setConsultandoDoc(true);
    setMensajeDoc(null);

    try {
      const res = await consultarDocumentoIdentidad(tipoDoc, numDoc.trim(), servicioRestActivo);
      if (res.data) {
        setClienteActivo(res.data);
        setMensajeDoc({
          tipo: 'success',
          texto: `Hallado: ${res.data.nombreCompleto} (${res.tiempoMs}ms vía ${res.cliente})`
        });
      } else {
        setClienteActivo({
          tipoDoc,
          numDoc: numDoc.trim(),
          nombreCompleto: 'CLIENTE NO REGISTRADO',
          esSocioPrime: false
        });
        setMensajeDoc({ tipo: 'danger', texto: res.error || 'No hallado en padrón' });
      }
    } catch (err: any) {
      setMensajeDoc({ tipo: 'danger', texto: err.message || 'Error en consulta REST' });
    } finally {
      setConsultandoDoc(false);
    }
  };

  const handleProcesar = () => {
    if (items.length === 0) return;

    const clienteParaVenta = {
      tipoDoc,
      numDoc: numDoc.trim() || '00000000',
      nombreCompleto: clienteActivo.nombreCompleto || 'CLIENTE FINAL',
      esSocioPrime: clienteActivo.esSocioPrime
    };

    procesarVenta(clienteParaVenta, cajeroActivo, sucursalActiva);
    onTicketGenerado();
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 overflow-hidden sticky-top" style={{ top: '80px' }}>
      {/* Header Carrito */}
      <div className="card-header bg-tambo-purple text-white p-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-cart3"></i>
          <span>Carrito de Compra</span>
          <span className="badge bg-tambo-yellow text-dark rounded-pill">
            {items.reduce((acc, i) => acc + i.cantidad, 0)}
          </span>
        </h5>
        {items.length > 0 && (
          <button
            className="btn btn-sm btn-outline-light py-0 px-2"
            onClick={vaciarCarrito}
            title="Vaciar carrito"
          >
            <i className="bi bi-trash"></i> Vaciar
          </button>
        )}
      </div>

      <div className="card-body p-3">
        {/* Lista de Items */}
        <div className="mb-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-basket3 display-6 d-block mb-2 text-secondary opacity-50"></i>
              <p className="small mb-0">El carrito está vacío</p>
              <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
                Selecciona productos del catálogo
              </span>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {items.map(item => (
                <div key={item.id} className="p-2 border rounded-3 bg-light d-flex align-items-center justify-content-between gap-2">
                  <div className="flex-grow-1 text-truncate">
                    <h6 className="mb-0 fw-semibold text-truncate small" title={item.nombre}>
                      {item.nombre}
                    </h6>
                    <div className="d-flex gap-2 align-items-baseline">
                      <span className="text-tambo-purple fw-bold small">
                        S/ {(item.precioOferta * item.cantidad).toFixed(2)}
                      </span>
                      {item.precioRegular > item.precioOferta && (
                        <small className="text-muted text-decoration-line-through" style={{ fontSize: '0.7rem' }}>
                          S/ {(item.precioRegular * item.cantidad).toFixed(2)}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="d-flex align-items-center gap-1">
                    <button
                      className="btn btn-sm btn-outline-secondary p-0 px-1"
                      onClick={() => cambiarCantidad(item.id, -1)}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className="fw-bold px-1 small">{item.cantidad}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary p-0 px-1"
                      onClick={() => cambiarCantidad(item.id, 1)}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                    <button
                      className="btn btn-sm text-danger p-0 ms-1"
                      onClick={() => eliminarDelCarrito(item.id)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Cliente y Documento (Demostración de Formulario y Servicio REST) */}
        <div className="border-top pt-3 mb-3">
          <label className="form-label small fw-bold text-muted mb-1 d-flex justify-content-between">
            <span>Datos del Cliente:</span>
            <span className="text-primary" style={{ fontSize: '0.72rem' }}>
              REST: {servicioRestActivo}
            </span>
          </label>

          <div className="row g-1 mb-2">
            <div className="col-5">
              <select
                className="form-select form-select-sm"
                value={tipoDoc}
                onChange={(e) => setTipoDoc(e.target.value as TipoDocumento)}
              >
                <option value="DNI">DNI (8)</option>
                <option value="RUC">RUC (11)</option>
                <option value="CE">C. Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div className="col-7">
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  placeholder={tipoDoc === 'DNI' ? 'Ej: 72839401' : 'N° Documento'}
                  value={numDoc}
                  onChange={(e) => setNumDoc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConsultarCliente()}
                />
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={handleConsultarCliente}
                  disabled={consultandoDoc}
                  title="Consultar vía Servicio REST"
                >
                  {consultandoDoc ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <i className="bi bi-search"></i>
                  )}
                </button>
              </div>
            </div>
          </div>

          {clienteActivo.nombreCompleto && (
            <div className="bg-light p-2 rounded-2 small mb-2 border">
              <div className="d-flex justify-content-between align-items-center">
                <strong className="text-dark text-truncate">{clienteActivo.nombreCompleto}</strong>
                {clienteActivo.esSocioPrime && (
                  <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
                    SOCIO PRIME
                  </span>
                )}
              </div>
              {clienteActivo.direccion && (
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {clienteActivo.direccion}
                </div>
              )}
            </div>
          )}

          {mensajeDoc && (
            <div className={`alert alert-${mensajeDoc.tipo} py-1 px-2 mb-2 small`} style={{ fontSize: '0.75rem' }}>
              {mensajeDoc.texto}
            </div>
          )}
        </div>

        {/* Resumen Financiero y Promociones Tambo */}
        <div className="border-top pt-2 mb-3">
          {totales.promoBebidaAplicada && (
            <div className="badge bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-between p-1 px-2 mb-1">
              <span><i className="bi bi-cup-straw me-1"></i> Promo Combo Bebida</span>
              <span>- S/ 1.00</span>
            </div>
          )}
          {totales.promoMontoMayorAplicada && (
            <div className="badge bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-between p-1 px-2 mb-1">
              <span><i className="bi bi-gift me-1"></i> Promo Mayor a S/ 50</span>
              <span>- S/ 3.00</span>
            </div>
          )}

          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Total Regular:</span>
            <span>S/ {totales.totalProductos.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between small text-danger fw-semibold mb-1">
            <span>Descuentos y Promos:</span>
            <span>- S/ {totales.descuentoTotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>IGV (18% Incluido):</span>
            <span>S/ {totales.igvCalculado.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between align-items-baseline border-top pt-2 mt-2">
            <span className="fw-bold fs-5 text-dark">SUBTOTAL:</span>
            <span className="fw-black fs-4 text-tambo-purple">
              S/ {totales.subtotalFinal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Botón de Procesar Venta */}
        <button
          className="btn btn-tambo-yellow w-100 py-2 fs-6 shadow-sm d-flex align-items-center justify-content-center gap-2"
          onClick={handleProcesar}
          disabled={items.length === 0}
        >
          <i className="bi bi-check2-circle fs-5"></i>
          <span>Procesar Pago & Emitir Ticket</span>
        </button>
      </div>
    </div>
  );
};

