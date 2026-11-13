import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Nav, Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { usePos } from '../../context/PosContext';
import { Proveedor, Producto } from '../../types/pos';

interface ProveedoresComprasProps {
  prefill: { proveedorId: number; productoId: string } | null;
  onPrefillConsumed: () => void;
}

interface CompraItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

/** Celular peruano: 9 dígitos, empieza en 9, no todo el mismo dígito repetido. */
function celularInvalido(telefono: string): string | null {
  if (!telefono) return null;
  if (!/^9\d{8}$/.test(telefono)) return 'El celular debe tener 9 dígitos y empezar con 9 (ej. 987654321).';
  if (/^(\d)\1{8}$/.test(telefono)) return 'Ingresa un celular válido (no puede ser el mismo dígito repetido).';
  return null;
}

export const ProveedoresCompras: React.FC<ProveedoresComprasProps> = ({ prefill, onPrefillConsumed }) => {
  const { productos, categorias, recargarProductos } = usePos();
  const [subTab, setSubTab] = useState<'proveedores' | 'compra' | 'historial'>('proveedores');

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarProveedores = useCallback(async () => {
    setCargandoProveedores(true);
    try {
      const res = await fetch('/api/proveedores');
      if (!res.ok) throw new Error((await res.json()).message);
      setProveedores(await res.json());
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar proveedores.');
    } finally {
      setCargandoProveedores(false);
    }
  }, []);

  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);

  // --- Alta de proveedor por RUC ---
  const [modalNuevoProveedor, setModalNuevoProveedor] = useState(false);
  const [rucNuevo, setRucNuevo] = useState('');
  const [telefonoNuevo, setTelefonoNuevo] = useState('');
  const [emailNuevo, setEmailNuevo] = useState('');
  const [errorNuevo, setErrorNuevo] = useState<string | null>(null);
  const [guardandoProveedor, setGuardandoProveedor] = useState(false);

  const handleCrearProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNuevo(null);
    if (!/^\d{11}$/.test(rucNuevo)) {
      setErrorNuevo('El RUC debe tener exactamente 11 dígitos.');
      return;
    }
    const errorCel = celularInvalido(telefonoNuevo);
    if (errorCel) {
      setErrorNuevo(errorCel);
      return;
    }
    setGuardandoProveedor(true);
    try {
      const res = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruc: rucNuevo, telefono: telefonoNuevo || undefined, email: emailNuevo || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setModalNuevoProveedor(false);
      setRucNuevo('');
      setTelefonoNuevo('');
      setEmailNuevo('');
      await cargarProveedores();
    } catch (err: any) {
      setErrorNuevo(err.message || 'No se pudo consultar/crear el proveedor.');
    } finally {
      setGuardandoProveedor(false);
    }
  };

  // --- Editar datos de contacto de un proveedor existente ---
  const [modalEditarProveedor, setModalEditarProveedor] = useState<Proveedor | null>(null);
  const [telefonoEditar, setTelefonoEditar] = useState('');
  const [emailEditar, setEmailEditar] = useState('');
  const [errorEditar, setErrorEditar] = useState<string | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const abrirModalEditar = (prov: Proveedor) => {
    setModalEditarProveedor(prov);
    setTelefonoEditar(prov.telefono || '');
    setEmailEditar(prov.email || '');
    setErrorEditar(null);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditarProveedor) return;
    setErrorEditar(null);
    const errorCel = celularInvalido(telefonoEditar);
    if (errorCel) {
      setErrorEditar(errorCel);
      return;
    }
    setGuardandoEdicion(true);
    try {
      const res = await fetch(`/api/proveedores/${modalEditarProveedor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: telefonoEditar || undefined, email: emailEditar || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setModalEditarProveedor(null);
      await cargarProveedores();
    } catch (err: any) {
      setErrorEditar(err.message || 'No se pudo actualizar el proveedor.');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // --- Asignar catálogo que ofrece un proveedor ---
  const [modalCatalogo, setModalCatalogo] = useState<Proveedor | null>(null);
  const [seleccionCatalogo, setSeleccionCatalogo] = useState<Set<string>>(new Set());
  const [filtroCategoriaCatalogo, setFiltroCategoriaCatalogo] = useState<string>('Todas');
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');
  const [guardandoCatalogo, setGuardandoCatalogo] = useState(false);

  const abrirModalCatalogo = (prov: Proveedor) => {
    setModalCatalogo(prov);
    setSeleccionCatalogo(new Set(prov.productos.map((p) => p.productoId)));
    setFiltroCategoriaCatalogo('Todas');
    setBusquedaCatalogo('');
  };

  const toggleSeleccionCatalogo = (productoId: string) => {
    setSeleccionCatalogo((prev) => {
      const next = new Set(prev);
      if (next.has(productoId)) next.delete(productoId);
      else next.add(productoId);
      return next;
    });
  };

  const handleGuardarCatalogo = async () => {
    if (!modalCatalogo) return;
    setGuardandoCatalogo(true);
    try {
      const res = await fetch(`/api/proveedores/${modalCatalogo.id}/productos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: Array.from(seleccionCatalogo).map((productoId) => ({ productoId })) })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setModalCatalogo(null);
      await cargarProveedores();
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar el catálogo del proveedor.');
    } finally {
      setGuardandoCatalogo(false);
    }
  };

  // --- Registrar Compra ---
  const [proveedorCompraId, setProveedorCompraId] = useState<number | null>(null);
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [itemsCompra, setItemsCompra] = useState<CompraItem[]>([]);
  const [filtroCategoriaCompra, setFiltroCategoriaCompra] = useState<string>('Todas');
  const [busquedaCompra, setBusquedaCompra] = useState('');
  const [errorCompra, setErrorCompra] = useState<string | null>(null);
  const [exitoCompra, setExitoCompra] = useState<string | null>(null);
  const [guardandoCompra, setGuardandoCompra] = useState(false);

  useEffect(() => {
    if (!prefill) return;
    setSubTab('compra');
    setProveedorCompraId(prefill.proveedorId);
    const prod = productos.find((p) => p.id === prefill.productoId);
    if (prod) {
      setItemsCompra((prev) =>
        prev.some((i) => i.productoId === prod.id)
          ? prev
          : [...prev, { productoId: prod.id, nombre: prod.nombre, cantidad: 10, precioUnitario: prod.precioOferta }]
      );
    }
    onPrefillConsumed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const proveedorCompra = proveedores.find((p) => p.id === proveedorCompraId) || null;

  const catalogoDisponible = useMemo(() => {
    if (!proveedorCompra) return [];
    return proveedorCompra.productos.filter((pp) => {
      const matchCat = filtroCategoriaCompra === 'Todas' || pp.codigo.startsWith(filtroCategoriaCompra);
      const q = busquedaCompra.trim().toLowerCase();
      const matchBusqueda = !q || pp.nombre.toLowerCase().includes(q) || pp.codigo.toLowerCase().includes(q);
      return matchCat && matchBusqueda;
    });
  }, [proveedorCompra, filtroCategoriaCompra, busquedaCompra]);

  const agregarItemCompra = (productoId: string, nombre: string, precioReferencial: number | null) => {
    setItemsCompra((prev) => {
      if (prev.some((i) => i.productoId === productoId)) return prev;
      return [...prev, { productoId, nombre, cantidad: 1, precioUnitario: precioReferencial ?? 0 }];
    });
  };

  const actualizarItemCompra = (productoId: string, campo: 'cantidad' | 'precioUnitario', valor: number) => {
    setItemsCompra((prev) => prev.map((i) => (i.productoId === productoId ? { ...i, [campo]: valor } : i)));
  };

  const quitarItemCompra = (productoId: string) => {
    setItemsCompra((prev) => prev.filter((i) => i.productoId !== productoId));
  };

  const totalCompra = itemsCompra.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0);

  const handleRegistrarCompra = async () => {
    setErrorCompra(null);
    setExitoCompra(null);
    if (!proveedorCompraId) {
      setErrorCompra('Selecciona un proveedor.');
      return;
    }
    if (itemsCompra.length === 0) {
      setErrorCompra('Agrega al menos un producto a la compra.');
      return;
    }
    if (itemsCompra.some((i) => !Number.isInteger(i.cantidad) || i.cantidad <= 0)) {
      setErrorCompra('La cantidad de cada producto debe ser un número entero mayor a 0 (sin decimales).');
      return;
    }
    if (itemsCompra.some((i) => !Number.isFinite(i.precioUnitario) || i.precioUnitario <= 0)) {
      setErrorCompra('El precio unitario de cada producto debe ser mayor a 0.');
      return;
    }
    if (totalCompra <= 0) {
      setErrorCompra('El total de la compra debe ser mayor a 0.');
      return;
    }

    setGuardandoCompra(true);
    try {
      const res = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proveedorId: proveedorCompraId,
          numeroDocumento: numeroDocumento || undefined,
          items: itemsCompra.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad, precioUnitario: i.precioUnitario }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setExitoCompra(`Compra registrada (S/ ${Number(data.total).toFixed(2)}). El stock ya fue actualizado.`);
      setItemsCompra([]);
      setNumeroDocumento('');
      await recargarProductos();
    } catch (err: any) {
      setErrorCompra(err.message || 'No se pudo registrar la compra.');
    } finally {
      setGuardandoCompra(false);
    }
  };

  // --- Historial de Compras ---
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  useEffect(() => {
    if (subTab !== 'historial') return;
    setCargandoHistorial(true);
    fetch('/api/compras')
      .then((res) => (res.ok ? res.json() : []))
      .then(setHistorial)
      .finally(() => setCargandoHistorial(false));
  }, [subTab]);

  const categoriasPrefijos = categorias.map((c) => c.prefijo);

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white py-3 border-0">
        <Nav variant="pills" className="gap-2">
          <Nav.Item>
            <Nav.Link active={subTab === 'proveedores'} onClick={() => setSubTab('proveedores')}>
              <i className="bi bi-truck me-1"></i> Proveedores
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={subTab === 'compra'} onClick={() => setSubTab('compra')}>
              <i className="bi bi-bag-plus me-1"></i> Registrar Compra
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={subTab === 'historial'} onClick={() => setSubTab('historial')}>
              <i className="bi bi-clock-history me-1"></i> Historial de Compras
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Header>

      <Card.Body>
        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

        {subTab === 'proveedores' && (
          <>
            <div className="d-flex justify-content-end mb-3">
              <Button variant="warning" size="sm" className="fw-bold text-purple" onClick={() => setModalNuevoProveedor(true)}>
                <i className="bi bi-plus-circle me-1"></i> + Nuevo Proveedor (por RUC)
              </Button>
            </div>
            {cargandoProveedores ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="purple" />
              </div>
            ) : proveedores.length === 0 ? (
              <p className="text-muted small">Aún no hay proveedores registrados.</p>
            ) : (
              <div className="table-responsive">
                <Table hover size="sm" className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>RUC</th>
                      <th>Razón Social</th>
                      <th>Contacto</th>
                      <th>Productos que ofrece</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((prov) => (
                      <tr key={prov.id}>
                        <td className="font-monospace">{prov.ruc}</td>
                        <td>{prov.razonSocial}</td>
                        <td className="small text-muted">
                          {prov.telefono || '—'} {prov.email ? `· ${prov.email}` : ''}
                        </td>
                        <td>
                          <Badge bg="purple">{prov.productos.length} producto(s)</Badge>
                        </td>
                        <td className="text-end">
                          <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => abrirModalEditar(prov)}>
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button size="sm" variant="outline-purple" onClick={() => abrirModalCatalogo(prov)}>
                            <i className="bi bi-list-check me-1"></i> Asignar Catálogo
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        )}

        {subTab === 'compra' && (
          <Row className="g-3">
            <Col xs={12} md={5}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Proveedor:</Form.Label>
                <Form.Select
                  value={proveedorCompraId ?? ''}
                  onChange={(e) => {
                    setProveedorCompraId(e.target.value ? Number(e.target.value) : null);
                    setItemsCompra([]);
                  }}
                >
                  <option value="">Selecciona un proveedor...</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.razonSocial} ({p.ruc})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">N° Documento (opcional):</Form.Label>
                <Form.Control value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} placeholder="Ej: F001-000123" />
              </Form.Group>

              {proveedorCompra && (
                <>
                  <div className="d-flex gap-1 flex-wrap mb-2">
                    <Button
                      size="sm"
                      variant={filtroCategoriaCompra === 'Todas' ? 'purple' : 'outline-secondary'}
                      onClick={() => setFiltroCategoriaCompra('Todas')}
                    >
                      Todas
                    </Button>
                    {categoriasPrefijos.map((prefijo) => (
                      <Button
                        key={prefijo}
                        size="sm"
                        variant={filtroCategoriaCompra === prefijo ? 'purple' : 'outline-secondary'}
                        onClick={() => setFiltroCategoriaCompra(prefijo)}
                      >
                        {prefijo}
                      </Button>
                    ))}
                  </div>
                  <Form.Control
                    size="sm"
                    className="mb-2"
                    placeholder="🔎 Buscar por código o nombre..."
                    value={busquedaCompra}
                    onChange={(e) => setBusquedaCompra(e.target.value)}
                  />
                  <div className="catalogo-proveedor-list border rounded" style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {catalogoDisponible.length === 0 ? (
                      <p className="text-muted small p-2 mb-0">Este proveedor no tiene productos asignados en este filtro.</p>
                    ) : (
                      catalogoDisponible.map((pp) => (
                        <div
                          key={pp.productoId}
                          className="d-flex justify-content-between align-items-center p-2 border-bottom small"
                        >
                          <span>
                            <span className="badge bg-secondary-subtle text-secondary me-1 font-monospace">{pp.codigo}</span>
                            {pp.nombre}
                          </span>
                          <Button size="sm" variant="outline-purple" onClick={() => agregarItemCompra(pp.productoId, pp.nombre, pp.precioReferencial)}>
                            <i className="bi bi-plus"></i>
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </Col>

            <Col xs={12} md={7}>
              <h6 className="fw-bold text-purple">Ítems de la Compra</h6>
              {errorCompra && <Alert variant="danger" className="py-2 small">{errorCompra}</Alert>}
              {exitoCompra && <Alert variant="success" className="py-2 small">{exitoCompra}</Alert>}

              {itemsCompra.length === 0 ? (
                <p className="text-muted small">Selecciona productos del catálogo del proveedor a la izquierda.</p>
              ) : (
                <div className="table-responsive mb-3">
                  <Table size="sm" className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th style={{ width: 90 }}>Cant.</th>
                        <th style={{ width: 110 }}>P. Unit.</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsCompra.map((item) => (
                        <tr key={item.productoId}>
                          <td className="small">{item.nombre}</td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              min={1}
                              step={1}
                              isInvalid={!Number.isInteger(item.cantidad) || item.cantidad <= 0}
                              value={item.cantidad}
                              onChange={(e) =>
                                actualizarItemCompra(
                                  item.productoId,
                                  'cantidad',
                                  e.target.value === '' ? 0 : Number(e.target.value)
                                )
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              min={0.01}
                              step="0.01"
                              isInvalid={!Number.isFinite(item.precioUnitario) || item.precioUnitario <= 0}
                              value={item.precioUnitario}
                              onChange={(e) =>
                                actualizarItemCompra(
                                  item.productoId,
                                  'precioUnitario',
                                  e.target.value === '' ? 0 : Number(e.target.value)
                                )
                              }
                            />
                          </td>
                          <td className="fw-semibold">S/ {(item.cantidad * item.precioUnitario).toFixed(2)}</td>
                          <td>
                            <Button size="sm" variant="link" className="text-danger p-0" onClick={() => quitarItemCompra(item.productoId)}>
                              <i className="bi bi-x-circle"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center bg-light rounded p-2 mb-3">
                <span className="fw-bold">Total Compra:</span>
                <span className="fw-bold fs-5 text-purple">S/ {totalCompra.toFixed(2)}</span>
              </div>

              <Button
                variant="warning"
                className="w-100 fw-bold text-purple"
                onClick={handleRegistrarCompra}
                disabled={guardandoCompra || itemsCompra.length === 0}
              >
                {guardandoCompra ? 'Registrando...' : 'Registrar Compra (sube el stock automáticamente)'}
              </Button>
            </Col>
          </Row>
        )}

        {subTab === 'historial' &&
          (cargandoHistorial ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="purple" />
            </div>
          ) : historial.length === 0 ? (
            <p className="text-muted small">Aún no hay compras registradas.</p>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm" className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>N° Documento</th>
                    <th>Total</th>
                    <th>Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((c) => (
                    <tr key={c.id}>
                      <td className="small">{new Date(c.createdAt).toLocaleString()}</td>
                      <td>{c.proveedorRazonSocial}</td>
                      <td className="font-monospace">{c.numeroDocumento || '—'}</td>
                      <td className="fw-semibold">S/ {Number(c.total).toFixed(2)}</td>
                      <td className="small">{c.registradoPor}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))}
      </Card.Body>

      {/* Modal Nuevo Proveedor */}
      <Modal show={modalNuevoProveedor} onHide={() => setModalNuevoProveedor(false)} centered>
        <Modal.Header closeButton className="bg-purple text-white">
          <Modal.Title className="fs-5 fw-bold">Nuevo Proveedor</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCrearProveedor}>
          <Modal.Body>
            {errorNuevo && <Alert variant="danger" className="py-2 small">{errorNuevo}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">RUC (11 dígitos):</Form.Label>
              <InputGroup>
                <Form.Control
                  value={rucNuevo}
                  onChange={(e) => setRucNuevo(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="Ej: 20100070970"
                  maxLength={11}
                  required
                />
              </InputGroup>
              <Form.Text className="text-muted small">La razón social se obtiene automáticamente vía Decolecta/SUNAT.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Celular (opcional):</Form.Label>
              <Form.Control
                value={telefonoNuevo}
                onChange={(e) => setTelefonoNuevo(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="Ej: 987654321"
                maxLength={9}
                inputMode="numeric"
              />
              <Form.Text className="text-muted small">9 dígitos, debe empezar con 9.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label className="small fw-semibold">Email (opcional):</Form.Label>
              <Form.Control type="email" value={emailNuevo} onChange={(e) => setEmailNuevo(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setModalNuevoProveedor(false)} disabled={guardandoProveedor}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit" className="fw-bold text-purple" disabled={guardandoProveedor}>
              {guardandoProveedor ? 'Consultando SUNAT...' : 'Consultar y Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Editar Proveedor */}
      <Modal show={!!modalEditarProveedor} onHide={() => setModalEditarProveedor(null)} centered>
        <Modal.Header closeButton className="bg-purple text-white">
          <Modal.Title className="fs-5 fw-bold">Editar Proveedor: {modalEditarProveedor?.razonSocial}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardarEdicion}>
          <Modal.Body>
            {errorEditar && <Alert variant="danger" className="py-2 small">{errorEditar}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">RUC:</Form.Label>
              <Form.Control value={modalEditarProveedor?.ruc || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Celular (opcional):</Form.Label>
              <Form.Control
                value={telefonoEditar}
                onChange={(e) => setTelefonoEditar(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="Ej: 987654321"
                maxLength={9}
                inputMode="numeric"
              />
              <Form.Text className="text-muted small">9 dígitos, debe empezar con 9.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label className="small fw-semibold">Email (opcional):</Form.Label>
              <Form.Control type="email" value={emailEditar} onChange={(e) => setEmailEditar(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setModalEditarProveedor(null)} disabled={guardandoEdicion}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit" className="fw-bold text-purple" disabled={guardandoEdicion}>
              {guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Asignar Catálogo */}
      <Modal show={!!modalCatalogo} onHide={() => setModalCatalogo(null)} centered size="lg">
        <Modal.Header closeButton className="bg-purple text-white">
          <Modal.Title className="fs-5 fw-bold">Catálogo de {modalCatalogo?.razonSocial}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex gap-2 flex-wrap align-items-center mb-3">
            <Form.Control
              size="sm"
              style={{ maxWidth: 260 }}
              placeholder="🔎 Buscar por código o nombre..."
              value={busquedaCatalogo}
              onChange={(e) => setBusquedaCatalogo(e.target.value)}
            />
            <div className="d-flex gap-1 flex-wrap">
              <Button
                size="sm"
                variant={filtroCategoriaCatalogo === 'Todas' ? 'purple' : 'outline-secondary'}
                onClick={() => setFiltroCategoriaCatalogo('Todas')}
              >
                Todas
              </Button>
              {categorias.map((c) => (
                <Button
                  key={c.id}
                  size="sm"
                  variant={filtroCategoriaCatalogo === c.nombre ? 'purple' : 'outline-secondary'}
                  onClick={() => setFiltroCategoriaCatalogo(c.nombre)}
                >
                  {c.prefijo}
                </Button>
              ))}
            </div>
          </div>
          <div style={{ maxHeight: 350, overflowY: 'auto' }}>
            {productos
              .filter((p) => filtroCategoriaCatalogo === 'Todas' || p.categoria === filtroCategoriaCatalogo)
              .filter((p) => {
                const q = busquedaCatalogo.trim().toLowerCase();
                return !q || p.nombre.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
              })
              .map((p: Producto) => (
                <Form.Check
                  key={p.id}
                  type="checkbox"
                  id={`catalogo-${p.id}`}
                  className="mb-1"
                  label={
                    <span>
                      <span className="badge bg-secondary-subtle text-secondary me-1 font-monospace">{p.id}</span>
                      {p.nombre}
                    </span>
                  }
                  checked={seleccionCatalogo.has(p.id)}
                  onChange={() => toggleSeleccionCatalogo(p.id)}
                />
              ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setModalCatalogo(null)} disabled={guardandoCatalogo}>
            Cancelar
          </Button>
          <Button variant="warning" className="fw-bold text-purple" onClick={handleGuardarCatalogo} disabled={guardandoCatalogo}>
            {guardandoCatalogo ? 'Guardando...' : 'Guardar Catálogo'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};
