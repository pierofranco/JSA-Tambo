import React, { useRef, useState } from 'react';
import { TicketVenta } from '../../types';
import { useStore } from '../../hooks/useStore';
import { fetchService } from '../../services/fetchService';
import { axiosService } from '../../services/axiosService';
import { alovaService } from '../../services/alovaService';

interface TicketModalProps {
  ticket: TicketVenta | null;
  onCerrar: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, onCerrar }) => {
  const { servicioRestActivo } = useStore();

  // REF HOOK: Referencia directa al nodo del DOM para copiar e imprimir
  const ticketPreRef = useRef<HTMLPreElement | null>(null);

  const [copiado, setCopiado] = useState(false);
  const [enviandoRest, setEnviandoRest] = useState(false);
  const [mensajeEnvio, setMensajeEnvio] = useState<string | null>(null);

  if (!ticket) return null;

  // Generar texto plano del comprobante
  const textoTicket = `
========================================
         TAMBO - TICKET DE VENTA        
========================================
Comprobante N°:  ${ticket.idVenta}
Fecha y Hora:    ${ticket.fecha}
Sucursal:        ${ticket.sucursal}
Cajero:          ${ticket.cajero}
----------------------------------------
Cliente:         ${ticket.cliente.nombreCompleto}
${ticket.cliente.tipoDoc}:             ${ticket.cliente.numDoc}
----------------------------------------
CANT  PRODUCTO                  SUBTOTAL
----------------------------------------
${ticket.items.map(i => {
  const nom = i.nombre.length > 20 ? i.nombre.slice(0, 18) + '..' : i.nombre.padEnd(20, ' ');
  const total = (i.precioOferta * i.cantidad).toFixed(2);
  return `${String(i.cantidad).padStart(2, ' ')}x   ${nom}  S/ ${total.padStart(6, ' ')}`;
}).join('\n')}
----------------------------------------
Total Productos:             S/ ${ticket.totales.totalProductos.toFixed(2)}
Descuentos y Promos:        -S/ ${ticket.totales.descuentoTotal.toFixed(2)}
----------------------------------------
TOTAL A PAGAR (INC IGV):     S/ ${ticket.totales.subtotalFinal.toFixed(2)}
IGV (18% Incluido):          S/ ${ticket.totales.igvCalculado.toFixed(2)}
========================================
  ¡GRACIAS POR TU COMPRA EN TAMBO!
  Visita: www.tambo.pe
========================================
  `.trim();

  // Función usando useRef para copiar al portapapeles
  const handleCopiarTicket = () => {
    if (ticketPreRef.current) {
      navigator.clipboard.writeText(ticketPreRef.current.innerText);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // Función para sincronizar con el backend REST
  const handleSincronizarRest = async () => {
    setEnviandoRest(true);
    setMensajeEnvio(null);
    try {
      let res;
      if (servicioRestActivo === 'Axios') {
        res = await axiosService.registrarVenta(ticket);
      } else if (servicioRestActivo === 'Alova') {
        res = await alovaService.registrarVenta(ticket);
      } else {
        res = await fetchService.registrarVenta(ticket);
      }

      setMensajeEnvio(`Sincronizado vía ${res.cliente}: Status ${res.status} (${res.tiempoMs}ms)`);
    } catch (err: any) {
      setMensajeEnvio(`Error al registrar: ${err.message}`);
    } finally {
      setEnviandoRest(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content shadow-lg border-0 rounded-4">
          <div className="modal-header bg-tambo-purple text-white">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-receipt-cutoff text-tambo-yellow"></i>
              <span>Comprobante de Venta Emitido</span>
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onCerrar}
              aria-label="Cerrar"
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3 small">
              <i className="bi bi-check-circle-fill fs-5"></i>
              <div>
                <strong>¡Venta completada con éxito!</strong> El stock ha sido actualizado.
              </div>
            </div>

            {/* Terminal Pre con Ref Hook */}
            <div className="position-relative">
              <pre ref={ticketPreRef} className="ticket-terminal mb-3">
                {textoTicket}
              </pre>

              <button
                className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 shadow-sm"
                onClick={handleCopiarTicket}
                title="Copiar texto del ticket"
              >
                <i className={`bi ${copiado ? 'bi-check2 text-success' : 'bi-clipboard'}`}></i>
                <span className="ms-1 small">{copiado ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {mensajeEnvio && (
              <div className="alert alert-info py-2 small mb-3">
                <i className="bi bi-info-circle me-1"></i>
                {mensajeEnvio}
              </div>
            )}

            <div className="d-flex flex-wrap gap-2 justify-content-between">
              <button
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                onClick={handleSincronizarRest}
                disabled={enviandoRest}
              >
                <i className="bi bi-cloud-upload"></i>
                <span>{enviandoRest ? 'Enviando...' : `Registrar en REST (${servicioRestActivo})`}</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={onCerrar}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

