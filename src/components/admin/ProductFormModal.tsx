import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Producto } from '../../types/pos';
import { usePos } from '../../context/PosContext';
import { nombreProductoInvalido, normalizarEspacios } from '../../../shared/validators';

interface ProductFormModalProps {
  show: boolean;
  onHide: () => void;
  productoEditar: Producto | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ show, onHide, productoEditar }) => {
  const { crearProducto, actualizarProducto, categorias, crearCategoria, recargarCategorias } = usePos();

  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [precioRegular, setPrecioRegular] = useState<number>(0);
  const [precioOferta, setPrecioOferta] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [esPrime, setEsPrime] = useState<boolean>(false);
  const [imagenUrl, setImagenUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [subiendoImagen, setSubiendoImagen] = useState<boolean>(false);

  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState('');
  const [nuevaCategoriaPrefijo, setNuevaCategoriaPrefijo] = useState('');
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);

  useEffect(() => {
    if (productoEditar) {
      setNombre(productoEditar.nombre);
      const cat = categorias.find((c) => c.nombre === productoEditar.categoria);
      setCategoriaId(cat?.id ?? null);
      setPrecioRegular(productoEditar.precioRegular);
      setPrecioOferta(productoEditar.precioOferta);
      setStock(productoEditar.stock);
      setEsPrime(productoEditar.esPrime);
      setImagenUrl(productoEditar.imagenUrl);
    } else {
      setNombre('');
      setCategoriaId(categorias[0]?.id ?? null);
      setPrecioRegular(5.0);
      setPrecioOferta(5.0);
      setStock(20);
      setEsPrime(false);
      setImagenUrl('');
    }
    setErrorMsg(null);
    setMostrarNuevaCategoria(false);
    // Intencionalmente no depende de `categorias`: crear una categoría nueva
    // actualiza esa lista mientras el modal sigue abierto, y no debe borrar
    // lo que el usuario ya escribió en el formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoEditar, show]);

  const handleSubirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoImagen(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      const res = await fetch('/api/uploads/producto', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setImagenUrl(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo subir la imagen.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleCrearCategoria = async () => {
    setErrorCategoria(null);
    try {
      const nueva = await crearCategoria(nuevaCategoriaNombre.trim(), nuevaCategoriaPrefijo.trim());
      setCategoriaId(nueva.id);
      setMostrarNuevaCategoria(false);
      setNuevaCategoriaNombre('');
      setNuevaCategoriaPrefijo('');
      await recargarCategorias();
    } catch (err: any) {
      setErrorCategoria(err.message || 'No se pudo crear la categoría.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreLimpio = normalizarEspacios(nombre);
    const errorNombre = nombreProductoInvalido(nombreLimpio);
    if (errorNombre) {
      setErrorMsg(errorNombre);
      return;
    }
    if (!Number.isFinite(precioRegular) || precioRegular <= 0) {
      setErrorMsg('El precio regular debe ser mayor a 0.');
      return;
    }
    if (!Number.isFinite(precioOferta) || precioOferta <= 0) {
      setErrorMsg('El precio de oferta debe ser mayor a 0.');
      return;
    }
    if (precioOferta > precioRegular) {
      setErrorMsg('El precio de oferta no puede ser mayor al precio regular.');
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setErrorMsg('El stock debe ser un número entero mayor o igual a 0 (no se permiten decimales).');
      return;
    }
    if (!categoriaId) {
      setErrorMsg('Selecciona una categoría.');
      return;
    }

    setGuardando(true);
    setErrorMsg(null);
    try {
      if (productoEditar) {
        await actualizarProducto(productoEditar.id, {
          nombre: nombreLimpio,
          precioRegular,
          precioOferta,
          stock,
          esPrime,
          imagenUrl: imagenUrl || undefined
        });
      } else {
        await crearProducto({
          nombre: nombreLimpio,
          categoriaId,
          precioRegular,
          precioOferta,
          stock,
          esPrime,
          imagenUrl: imagenUrl || undefined
        });
      }
      onHide();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-purple text-white">
        <Modal.Title className="fs-5 fw-bold">
          <i className="bi bi-box-seam me-2"></i>
          {productoEditar ? `Editar Producto (${productoEditar.id})` : 'Agregar Nuevo Producto'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {errorMsg && <Alert variant="danger" className="py-2 small">{errorMsg}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Nombre del Producto:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Gaseosa Concordia Piña 1.5L"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Categoría:</Form.Label>
            {!productoEditar && (
              <InputGroup>
                <Form.Select
                  value={categoriaId ?? ''}
                  onChange={(e) => setCategoriaId(Number(e.target.value))}
                  disabled={!!productoEditar}
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.prefijo})
                    </option>
                  ))}
                </Form.Select>
                <Button variant="outline-purple" onClick={() => setMostrarNuevaCategoria((v) => !v)} type="button">
                  <i className="bi bi-plus-lg"></i> Nueva
                </Button>
              </InputGroup>
            )}
            {productoEditar && (
              <Form.Control value={productoEditar.categoria} disabled />
            )}

            {mostrarNuevaCategoria && (
              <div className="mt-2 p-2 border rounded bg-light">
                {errorCategoria && <Alert variant="danger" className="py-1 px-2 small mb-2">{errorCategoria}</Alert>}
                <Row className="g-2">
                  <Col xs={7}>
                    <Form.Control
                      size="sm"
                      placeholder="Nombre (ej: Helados)"
                      value={nuevaCategoriaNombre}
                      onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      size="sm"
                      placeholder="Prefijo (HEL)"
                      value={nuevaCategoriaPrefijo}
                      onChange={(e) => setNuevaCategoriaPrefijo(e.target.value.toUpperCase())}
                      maxLength={5}
                    />
                  </Col>
                  <Col xs={2}>
                    <Button size="sm" variant="purple" className="w-100" type="button" onClick={handleCrearCategoria}>
                      OK
                    </Button>
                  </Col>
                </Row>
                <Form.Text className="text-muted small">
                  El prefijo se usa para el código de acceso rápido de sus productos (ej: HEL-001).
                </Form.Text>
              </div>
            )}
          </Form.Group>

          <Row className="g-2 mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Precio Regular (S/):</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioRegular}
                  onChange={(e) => setPrecioRegular(parseFloat(e.target.value) || 0)}
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Precio Oferta (S/):</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioOferta}
                  onChange={(e) => setPrecioOferta(parseFloat(e.target.value) || 0)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-2 mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Stock Inicial:</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? 0 : Number(e.target.value))}
                  required
                />
                {!Number.isInteger(stock) && (
                  <Form.Text className="text-danger small d-block">
                    El stock debe ser un número entero (sin decimales).
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col xs={6} className="d-flex align-items-center pt-3">
              <Form.Check
                type="checkbox"
                id="check-prime"
                label="Producto Prime ⭐"
                checked={esPrime}
                onChange={(e) => setEsPrime(e.target.checked)}
                className="fw-semibold text-purple"
              />
            </Col>
          </Row>

          <Form.Group className="mb-1">
            <Form.Label className="fw-semibold small">Imagen del Producto:</Form.Label>
            <Form.Control type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleSubirImagen} />
            {subiendoImagen && (
              <div className="mt-2">
                <Spinner size="sm" animation="border" /> <span className="small text-muted">Subiendo imagen...</span>
              </div>
            )}
            {imagenUrl && (
              <img src={imagenUrl} alt="Vista previa" className="mt-2 rounded border" style={{ width: 80, height: 80, objectFit: 'cover' }} />
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={onHide} disabled={guardando}>
            Cancelar
          </Button>
          <Button variant="warning" type="submit" className="fw-bold text-purple" disabled={guardando || subiendoImagen}>
            {guardando ? 'Guardando...' : productoEditar ? 'Actualizar Producto' : 'Guardar Producto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
