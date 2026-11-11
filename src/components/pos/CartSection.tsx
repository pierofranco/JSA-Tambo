import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { usePos } from '../../context/PosContext';
import { TipoComprobante, TipoDoc } from '../../types/pos';

interface CartSectionProps {
  onVentaCompletada: () => void;
}

export const CartSection: React.FC<CartSectionProps> = ({ onVentaCompletada }) => {
  const {
    cart,
    cambiarCantidadCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    cuponCodigo,
    cuponMonto,
    mensajeCupon,
    aplicarCupon,
    quitarCupon,
    datosCliente,
    setDatosCliente,
    consultarRucAuto,
    totales,
    procesarVenta
  } = usePos();

  const [inputCupon, setInputCupon] = useState<string>('');
  const [mostrarCuponBox, setMostrarCuponBox] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [consultandoRuc, setConsultandoRuc] = useState<boolean>(false);

  const handleTipoComprobanteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TipoComprobante;
    setDatosCliente((prev) => ({ ...prev, tipoComprobante: val }));
  };

  const handleTipoDocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TipoDoc;
    setDatosCliente((prev) => ({ ...prev, tipoDoc: val, numDoc: '' }));
  };

  const handleNumDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, datosCliente.tipoDoc === 'DNI' ? 8 : 9);
    setDatosCliente((prev) => ({ ...prev, numDoc: val }));
  };

  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setDatosCliente((prev) => ({ ...prev, ruc: val }));
  };

  const handleConsultarRuc = async () => {
    if (datosCliente.ruc.length !== 11) {
      alert('El RUC debe tener 11 dígitos para consultar SUNAT.');
      return;
    }
    setConsultandoRuc(true);
    try {
      await consultarRucAuto(datosCliente.ruc);
    } finally {
      setConsultandoRuc(false);
    }
  };

  const handleAplicarCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCupon.trim()) return;
    const ok = await aplicarCupon(inputCupon);
    if (ok) {
      setInputCupon('');
    }
  };

  const handleProcesar = async () => {
    setProcesando(true);
    try {
      const venta = await procesarVenta();
      if (venta) {
        onVentaCompletada();
      }
    } finally {
      setProcesando(false);
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <Card className="cart-card shadow-sm border-0">
      <Card.Header className="bg-purple text-white d-flex justify-content-between align-items-center py-3">
        <h5 className="m-0 d-flex align-items-center gap-2">
          <i className="bi bi-cart4"></i> Tu Carrito
          <span className="badge bg-warning text-dark fw-bold">({totalItems})</span>
        </h5>
        {cart.length > 0 && (
          <Button
            variant="outline-light"
            size="sm"
            onClick={vaciarCarrito}
            title="Vaciar todo el carrito"
            className="btn-vaciar"
          >
            <i className="bi bi-trash"></i> Vaciar
          </Button>
        )}
      </Card.Header>

      <Card.Body className="p-3">
        {/* Lista de Items en Carrito */}
        {cart.length === 0 ? (
          <div className="cart-vacio text-center py-4 text-muted">
            <i className="bi bi-basket2 display-4 d-block mb-2 text-secondary"></i>
            <p className="mb-0">El carrito de compras está vacío.</p>
            <small>Haz clic en los productos para agregarlos al pedido.</small>
          </div>
        ) : (
          <div className="cart-items-scroll mb-3">
            {cart.map((item) => (
              <div key={item.id} className="cart-item-row d-flex justify-content-between align-items-center py-2 border-bottom">
                <div className="cart-item-info flex-grow-1 pe-2">
                  <span className="item-title d-block fw-semibold">{item.nombre}</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-purple fw-bold small">S/ {item.precioOferta.toFixed(2)}</span>
                    {item.precioRegular > item.precioOferta && (
                      <span className="text-muted text-decoration-line-through small">
                        S/ {item.precioRegular.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="cart-item-actions d-flex align-items-center gap-2">
                  <div className="btn-group btn-group-sm">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => cambiarCantidadCarrito(item.id, -1)}
                    >
                      {item.cantidad === 1 ? <i className="bi bi-trash text-danger"></i> : '-'}
                    </Button>
                    <span className="px-2 py-1 bg-light border-top border-bottom small fw-bold">
                      {item.cantidad}
                    </span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => cambiarCantidadCarrito(item.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                  <span className="fw-bold text-end subtotal-item" style={{ minWidth: '65px' }}>
                    S/ {(item.precioOferta * item.cantidad).toFixed(2)}
                  </span>
                  <Button
                    variant="link"
                    className="p-0 text-danger"
                    size="sm"
                    onClick={() => eliminarDelCarrito(item.id)}
                    title="Quitar ítem"
                  >
                    <i className="bi bi-x-circle"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sección de Formulario de Comprobante (React Controlled Components) */}
        <div className="comprobante-form-section bg-light p-3 rounded mb-3">
          <Form.Group className="mb-2">
            <Form.Label className="fw-bold small mb-1">
              <i className="bi bi-receipt me-1"></i> Tipo de Comprobante:
            </Form.Label>
            <Form.Select
              size="sm"
              value={datosCliente.tipoComprobante}
              onChange={handleTipoComprobanteChange}
            >
              <option value="BOLETA">Boleta de Venta</option>
              <option value="FACTURA">Factura Comercial</option>
            </Form.Select>
          </Form.Group>

          {/* Subcampos si es Boleta */}
          {datosCliente.tipoComprobante === 'BOLETA' ? (
            <div className="subcampos-boleta">
              <Form.Group className="mb-2">
                <Form.Label className="small text-muted mb-1">Documento del Cliente:</Form.Label>
                <Form.Select
                  size="sm"
                  value={datosCliente.tipoDoc}
                  onChange={handleTipoDocChange}
                >
                  <option value="SIN_DOC">Sin documento (Cliente Varios)</option>
                  <option value="DNI">DNI (8 dígitos)</option>
                  <option value="CE">Carné de Extranjería (9 dígitos)</option>
                </Form.Select>
              </Form.Group>

              {datosCliente.tipoDoc !== 'SIN_DOC' && (
                <Form.Group className="mb-1">
                  <Form.Label className="small text-muted mb-1">
                    N° {datosCliente.tipoDoc}:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder={`Ingrese ${datosCliente.tipoDoc}`}
                    value={datosCliente.numDoc}
                    onChange={handleNumDocChange}
                    maxLength={datosCliente.tipoDoc === 'DNI' ? 8 : 9}
                  />
                  <Form.Text className="text-muted small">
                    {datosCliente.tipoDoc === 'DNI' ? '8 dígitos numéricos' : '9 dígitos numéricos'}
                  </Form.Text>
                </Form.Group>
              )}
            </div>
          ) : (
            /* Subcampos si es Factura */
            <div className="subcampos-factura">
              <Form.Group className="mb-2">
                <Form.Label className="small text-muted mb-1">RUC (11 dígitos):</Form.Label>
                <InputGroup size="sm">
                  <Form.Control
                    type="text"
                    placeholder="Ej: 20601234567"
                    value={datosCliente.ruc}
                    onChange={handleRucChange}
                    maxLength={11}
                  />
                  <Button
                    variant="outline-purple"
                    onClick={handleConsultarRuc}
                    disabled={consultandoRuc || datosCliente.ruc.length !== 11}
                    title="Consultar SUNAT mediante Servicio REST"
                  >
                    {consultandoRuc ? <Spinner size="sm" animation="border" /> : <i className="bi bi-search"> SUNAT</i>}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-1">
                <Form.Label className="small text-muted mb-1">Razón Social:</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Ej: Empresa Tambo Retail S.A.C."
                  value={datosCliente.razonSocial}
                  onChange={(e) => setDatosCliente((prev) => ({ ...prev, razonSocial: e.target.value }))}
                />
              </Form.Group>
            </div>
          )}
        </div>

        {/* Sección de Cupones */}
        <div className="cupones-section mb-3">
          {!mostrarCuponBox && !cuponCodigo ? (
            <Button
              variant="outline-purple"
              size="sm"
              className="w-100 d-flex justify-content-between align-items-center"
              onClick={() => setMostrarCuponBox(true)}
            >
              <span><i className="bi bi-ticket-perforated"></i> ¿Tienes un cupón?</span>
              <i className="bi bi-chevron-down"></i>
            </Button>
          ) : (
            <div className="cupon-box p-2 border rounded bg-white">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small fw-bold text-purple">
                  <i className="bi bi-ticket-perforated-fill me-1"></i> Aplicar Cupón de Descuento
                </span>
                {!cuponCodigo && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-muted"
                    onClick={() => setMostrarCuponBox(false)}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                )}
              </div>

              {!cuponCodigo ? (
                <Form onSubmit={handleAplicarCupon}>
                  <InputGroup size="sm">
                    <Form.Control
                      type="text"
                      placeholder="Ej: 18892, 18893, TAMBO20"
                      value={inputCupon}
                      onChange={(e) => setInputCupon(e.target.value)}
                    />
                    <Button variant="warning" type="submit" className="fw-bold">
                      Aplicar
                    </Button>
                  </InputGroup>
                </Form>
              ) : (
                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                  <span className="badge bg-success">
                    Cupón Activo: {cuponCodigo} (-S/ {cuponMonto.toFixed(2)})
                  </span>
                  <Button variant="outline-danger" size="sm" onClick={quitarCupon}>
                    Quitar
                  </Button>
                </div>
              )}

              {mensajeCupon && (
                <Alert variant={mensajeCupon.tipo} className="py-1 px-2 mt-2 mb-0 small">
                  {mensajeCupon.texto}
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Resumen de Totales */}
        <div className="totales-summary-box bg-purple-subtle p-3 rounded mb-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Total Productos:</span>
            <span>S/ {totales.totalProductos.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between small text-danger mb-1">
            <span>Descuentos Totales:</span>
            <span>- S/ {totales.descuentoTotal.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between small text-muted mb-2">
            <span>IGV Estimado (18% incluido):</span>
            <span>S/ {totales.igv.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between fw-bold fs-5 text-purple border-top pt-2">
            <span>Total a Pagar:</span>
            <span>S/ {totales.subtotalFinal.toFixed(2)}</span>
          </div>
        </div>

        {/* Botón de Procesar Venta */}
        <Button
          variant="warning"
          size="lg"
          className="w-100 fw-bold btn-procesar-pago text-purple shadow-sm py-2"
          onClick={handleProcesar}
          disabled={cart.length === 0 || procesando}
        >
          {procesando ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Procesando Venta...
            </>
          ) : (
            <>
              <i className="bi bi-credit-card-2-front me-2"></i> Procesar Pago
            </>
          )}
        </Button>
      </Card.Body>
    </Card>
  );
};

