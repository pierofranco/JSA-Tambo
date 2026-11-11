import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Venta } from '../../types/pos';
import { useTicketPrint } from '../../hooks/useRefHooks';

interface TicketThermalModalProps {
  show: boolean;
  onHide: () => void;
  venta: Venta | null;
}

export const TicketThermalModal: React.FC<TicketThermalModalProps> = ({ show, onHide, venta }) => {
  // REF HOOK: Referencia al nodo DOM del ticket para impresión directa
  const { ticketRef, printTicket } = useTicketPrint();

  if (!venta) return null;

  const handleVerJSON = () => {
    console.group('🧾 [TAMBOPOS] COMPROBANTE EMITIDO EN FORMATO JSON');
    console.log(JSON.stringify(venta, null, 2));
    console.table(venta.itemsComprados);
    console.groupEnd();
    alert('Comprobante exportado e impreso en la Consola del Desarrollador (F12).');
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm" className="modal-ticket-thermal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fs-6 fw-bold text-purple">
          <i className="bi bi-receipt"></i> Comprobante Electrónico
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        {/* Contenedor del Ticket Térmico con useRef */}
        <div ref={ticketRef} className="thermal-ticket-container shadow-sm">
          <div className="ticket-header text-center">
            <h4 className="ticket-store-name m-0">TAMBOPOS</h4>
            <p className="ticket-store-desc mb-1">TIENDAS TAMBO S.A.C.</p>
            <p className="ticket-store-info mb-1">RUC: 20600845921</p>
            <p className="ticket-store-info mb-1">Av. Javier Prado Este 4200, Lima</p>
            <div className="ticket-dash">--------------------------------</div>
            <h5 className="ticket-doc-type m-0">
              {venta.comprobante === 'FACTURA' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'}
            </h5>
            <p className="ticket-doc-num fw-bold mb-1">{venta.correlativo}</p>
            <div className="ticket-dash">--------------------------------</div>
          </div>

          <div className="ticket-meta small">
            <div><strong>Fecha:</strong> {venta.fecha} {venta.hora}</div>
            {venta.comprobante === 'FACTURA' ? (
              <>
                <div><strong>RUC Cliente:</strong> {venta.cliente.ruc}</div>
                <div><strong>Razón Social:</strong> {venta.cliente.razonSocial}</div>
              </>
            ) : (
              <div>
                <strong>Cliente:</strong>{' '}
                {venta.cliente.tipoDoc === 'SIN_DOC'
                  ? 'CLIENTE VARIOS'
                  : `${venta.cliente.tipoDoc}: ${venta.cliente.numeroDoc}`}
              </div>
            )}
            <div className="ticket-dash">--------------------------------</div>
          </div>

          {/* Items de la Venta */}
          <div className="ticket-items small">
            <div className="d-flex justify-content-between fw-bold mb-1">
              <span>CANT / DESCRIPCIÓN</span>
              <span>TOTAL</span>
            </div>
            {venta.itemsComprados.map((item, idx) => (
              <div key={idx} className="ticket-item-row mb-1">
                <div className="d-flex justify-content-between">
                  <span>{item.cantidad} x {item.producto}</span>
                  <span>S/ {item.subtotalItem.toFixed(2)}</span>
                </div>
                <div className="text-muted" style={{ fontSize: '10px' }}>
                  P. Unit: S/ {item.precioUnitario.toFixed(2)}
                </div>
              </div>
            ))}
            <div className="ticket-dash">--------------------------------</div>
          </div>

          {/* Totales y Descuentos */}
          <div className="ticket-totals small">
            <div className="d-flex justify-content-between">
              <span>Op. Gravada:</span>
              <span>S/ {(venta.subtotalFinal - venta.igv).toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>I.G.V. (18%):</span>
              <span>S/ {venta.igv.toFixed(2)}</span>
            </div>
            {venta.descuentoTotal > 0 && (
              <div className="d-flex justify-content-between text-danger">
                <span>Descuento aplicado:</span>
                <span>- S/ {venta.descuentoTotal.toFixed(2)}</span>
              </div>
            )}
            {venta.cuponCodigo && (
              <div className="d-flex justify-content-between text-success">
                <span>Cupón ({venta.cuponCodigo}):</span>
                <span>- S/ {venta.descuentoCupon.toFixed(2)}</span>
              </div>
            )}
            <div className="ticket-dash">================================</div>
            <div className="d-flex justify-content-between fw-bold fs-6">
              <span>IMPORTE TOTAL:</span>
              <span>S/ {venta.subtotalFinal.toFixed(2)}</span>
            </div>
            <div className="ticket-dash">================================</div>
          </div>

          <div className="ticket-footer text-center mt-2 small">
            <p className="mb-1">¡Gracias por tu compra en Tambo!</p>
            <p className="text-muted mb-2" style={{ fontSize: '10px' }}>
              Representación impresa de la Boleta/Factura Electrónica.
            </p>
            <div className="barcode-simulator font-monospace small">
              ||| ||||| || |||||| |||| ||| |||||
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 d-flex flex-column gap-2">
        <Button variant="purple" className="w-100 fw-bold" onClick={printTicket}>
          <i className="bi bi-printer me-2"></i> Imprimir Ticket (useRef Hook)
        </Button>
        <div className="d-flex w-100 gap-2">
          <Button variant="outline-dark" size="sm" className="w-50" onClick={handleVerJSON}>
            <i className="bi bi-code-slash"></i> Ver JSON
          </Button>
          <Button variant="secondary" size="sm" className="w-50" onClick={onHide}>
            Cerrar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

