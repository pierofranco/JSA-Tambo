import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { usePos } from '../../context/PosContext';
import { TipoComprobante, TipoDoc, ClienteComprobante } from '../../types/pos';
import { rucChecksumValido } from '../../../shared/validators';

interface CamposInvalidos {
  ruc?: string;
  razonSocial?: string;
  numDoc?: string;
}

/** Valida el formulario de comprobante ANTES de enviar la venta: devuelve
 * los campos inválidos (para marcarlos en rojo) o null si todo está bien. */
function validarComprobante(datosCliente: ClienteComprobante): CamposInvalidos | null {
  const errores: CamposInvalidos = {};

  if (datosCliente.tipoComprobante === 'FACTURA') {
    if (!/^\d{11}$/.test(datosCliente.ruc)) {
      errores.ruc = 'El RUC debe tener exactamente 11 dígitos.';
    } else if (!rucChecksumValido(datosCliente.ruc)) {
      errores.ruc = 'El RUC no es válido (dígito verificador incorrecto).';
    }
    if (!datosCliente.razonSocial.trim()) {
      errores.razonSocial = 'Ingresa la Razón Social para la Factura.';
    }
  } else if (datosCliente.tipoDoc === 'DNI') {
    if (!datosCliente.numDoc) {
      errores.numDoc = 'Ingresa el número de DNI del cliente.';
    } else if (!/^\d{8}$/.test(datosCliente.numDoc)) {
      errores.numDoc = 'El DNI debe tener 8 dígitos.';
    } else if (datosCliente.dniVerificado !== datosCliente.numDoc) {
      errores.numDoc = 'Verifica el DNI con RENIEC (botón "RENIEC") antes de continuar.';
    }
  } else if (datosCliente.tipoDoc === 'CE') {
    if (!datosCliente.numDoc) {
      errores.numDoc = 'Ingresa el número de Carné de Extranjería del cliente.';
    } else if (!/^\d{9}$/.test(datosCliente.numDoc)) {
      errores.numDoc = 'El Carné de Extranjería debe tener 9 dígitos.';
    }
  }

  return Object.keys(errores).length > 0 ? errores : null;
}

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
    consultarDniAuto,
    totales,
    procesarVenta
  } = usePos();

  const [inputCupon, setInputCupon] = useState<string>('');
  const [mostrarCuponBox, setMostrarCuponBox] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [consultandoRuc, setConsultandoRuc] = useState<boolean>(false);
  const [consultandoDni, setConsultandoDni] = useState<boolean>(false);
  const [errorDni, setErrorDni] = useState<string | null>(null);
  const [errorRuc, setErrorRuc] = useState<string | null>(null);
  const [camposInvalidos, setCamposInvalidos] = useState<CamposInvalidos | null>(null);
  const [errorVenta, setErrorVenta] = useState<string | null>(null);

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
    setErrorDni(null);
    setCamposInvalidos((prev) => (prev ? { ...prev, numDoc: undefined } : prev));
    // Cualquier edición invalida una verificación RENIEC previa: debe
    // volver a verificarse antes de poder procesar la venta.
    setDatosCliente((prev) => ({ ...prev, numDoc: val, dniVerificado: undefined, nombreCliente: undefined }));
  };

  const handleVerificarDni = async () => {
    if (datosCliente.numDoc.length !== 8) {
      setErrorDni('El DNI debe tener 8 dígitos para verificar con RENIEC.');
      return;
    }
    setConsultandoDni(true);
    setErrorDni(null);
    try {
      await consultarDniAuto(datosCliente.numDoc);
    } catch (err: any) {
      setErrorDni(err.message || 'No se pudo verificar el DNI.');
    } finally {
      setConsultandoDni(false);
    }
  };

  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setErrorRuc(null);
    setCamposInvalidos((prev) => (prev ? { ...prev, ruc: undefined } : prev));
    setDatosCliente((prev) => ({ ...prev, ruc: val, razonSocial: '' }));
  };

  const handleConsultarRuc = async () => {
    if (datosCliente.ruc.length !== 11) {
      setErrorRuc('El RUC debe tener 11 dígitos para consultar SUNAT.');
      return;
    }
    if (!rucChecksumValido(datosCliente.ruc)) {
      setErrorRuc('RUC inválido (dígito verificador incorrecto).');
      return;
    }
    setConsultandoRuc(true);
    setErrorRuc(null);
    try {
      await consultarRucAuto(datosCliente.ruc);
    } catch (err: any) {
      setErrorRuc(err.message || 'RUC inválido.');
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
    setErrorVenta(null);

    if (cart.length === 0) {
      setErrorVenta('El carrito está vacío. Agrega productos para procesar la venta.');
      return;
    }

    const errores = validarComprobante(datosCliente);
    setCamposInvalidos(errores);
    if (errores) {
      setErrorVenta('Revisa los campos marcados en rojo antes de continuar.');
      return;
    }

    setProcesando(true);
    try {
      const venta = await procesarVenta();
      if (venta) {
        onVentaCompletada();
      } else {
        setErrorVenta('No se pudo procesar la venta. Intenta nuevamente.');
      }
    } catch (err: any) {
      setErrorVenta(err.message || 'No se pudo procesar la venta.');
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
                  {datosCliente.tipoDoc === 'DNI' ? (
                    <InputGroup size="sm" hasValidation>
                      <Form.Control
                        type="text"
                        size="sm"
                        placeholder="Ingrese DNI"
                        value={datosCliente.numDoc}
                        onChange={handleNumDocChange}
                        maxLength={8}
                        isInvalid={!!camposInvalidos?.numDoc}
                      />
                      <Button
                        variant="outline-purple"
                        onClick={handleVerificarDni}
                        disabled={consultandoDni || datosCliente.numDoc.length !== 8}
                        title="Verificar DNI mediante RENIEC (Servicio REST)"
                      >
                        {consultandoDni ? <Spinner size="sm" animation="border" /> : <i className="bi bi-person-check"> RENIEC</i>}
                      </Button>
                    </InputGroup>
                  ) : (
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="Ingrese Carné de Extranjería"
                      value={datosCliente.numDoc}
                      onChange={handleNumDocChange}
                      maxLength={9}
                      isInvalid={!!camposInvalidos?.numDoc}
                    />
                  )}
                  <Form.Text className="text-muted small d-block">
                    {datosCliente.tipoDoc === 'DNI' ? '8 dígitos numéricos' : '9 dígitos numéricos'}
                  </Form.Text>
                  {datosCliente.tipoDoc === 'DNI' && datosCliente.nombreCliente && (
                    <Alert variant="success" className="py-1 px-2 mt-1 mb-0 small">
                      <i className="bi bi-check-circle me-1"></i> {datosCliente.nombreCliente}
                    </Alert>
                  )}
                  {datosCliente.tipoDoc === 'DNI' && errorDni && (
                    <Alert variant="danger" className="py-1 px-2 mt-1 mb-0 small">
                      {errorDni}
                    </Alert>
                  )}
                  {camposInvalidos?.numDoc && (
                    <Alert variant="danger" className="py-1 px-2 mt-1 mb-0 small">
                      {camposInvalidos.numDoc}
                    </Alert>
                  )}
                </Form.Group>
              )}
            </div>
          ) : (
            /* Subcampos si es Factura */
            <div className="subcampos-factura">
              <Form.Group className="mb-2">
                <Form.Label className="small text-muted mb-1">RUC (11 dígitos):</Form.Label>
                <InputGroup size="sm" hasValidation>
                  <Form.Control
                    type="text"
                    placeholder="Ej: 20100070970"
                    value={datosCliente.ruc}
                    onChange={handleRucChange}
                    maxLength={11}
                    isInvalid={!!camposInvalidos?.ruc}
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
                {errorRuc && (
                  <Alert variant="danger" className="py-1 px-2 mt-1 mb-0 small">
                    {errorRuc}
                  </Alert>
                )}
                {camposInvalidos?.ruc && (
                  <Alert variant="danger" className="py-1 px-2 mt-1 mb-0 small">
                    {camposInvalidos.ruc}
                  </Alert>
                )}
              </Form.Group>

              <Form.Group className="mb-1">
                <Form.Label className="small text-muted mb-1">Razón Social:</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Ej: Empresa Tambo Retail S.A.C."
                  value={datosCliente.razonSocial}
                  onChange={(e) => {
                    setCamposInvalidos((prev) => (prev ? { ...prev, razonSocial: undefined } : prev));
                    setDatosCliente((prev) => ({ ...prev, razonSocial: e.target.value }));
                  }}
                  isInvalid={!!camposInvalidos?.razonSocial}
                />
                {camposInvalidos?.razonSocial && (
                  <Alert variant="danger" className="py-1 px-2 mt-1 mb-0 small">
                    {camposInvalidos.razonSocial}
                  </Alert>
                )}
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
                      onChange={(e) => setInputCupon(e.target.value.slice(0, 30))}
                      maxLength={30}
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
        {errorVenta && (
          <Alert variant="danger" className="py-2 px-2 small mb-2">
            <i className="bi bi-exclamation-triangle me-1"></i> {errorVenta}
          </Alert>
        )}
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

